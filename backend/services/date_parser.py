import re
import spacy
from spacy.matcher import Matcher

nlp = spacy.load("en_core_web_sm")
matcher = Matcher(nlp.vocab)

matcher.add("EXAM", [[{"LOWER": {"IN": ["exam", "midterm", "final"]}}]])
matcher.add("HOMEWORK", [[{"LOWER": {"IN": ["homework", "assignment", "hw"]}}]])
matcher.add("PROJECT", [[{"LOWER": {"IN": ["project", "proposal", "report", "presentation"]}}]])
matcher.add("QUIZ", [[{"LOWER": "quiz"}]])
matcher.add("LAB", [[{"LOWER": "lab"}]])
matcher.add("READING", [[{"LOWER": {"IN": ["reading", "chapter", "ch."]}}]])
matcher.add("DUE", [[{"LOWER": {"IN": ["due", "deadline", "submit"]}}]])
matcher.add("EXAM_NUM", [[{"LOWER": "exam"}, {"IS_DIGIT": True}]])

date_patterns = [
    # Day-first with ordinal + comma: "27th August, 2024"
    r'\b\d{1,2}(?:st|nd|rd|th)\s+'
    r'(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|'
    r'Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|'
    r'Dec(?:ember)?)\s*,\s*\d{4}\b',

    # Month-first with ordinal + comma: "August 27th, 2024"
    r'\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|'
    r'Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|'
    r'Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)\s*,\s*\d{4}\b',

    # Month-first standard: "August 7, 2025"
    r'\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|'
    r'Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|'
    r'Dec(?:ember)?)\s+\d{1,2},\s+\d{4}\b',

    # Day-first standard: "7 August 2025"
    r'\b\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|'
    r'May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|'
    r'Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\b',

    # Numeric formats
    r'\b\d{2}/\d{2}/\d{4}\b',       # 07/08/2025
    r'\b\d{4}-\d{2}-\d{2}\b',       # 2025-08-07
    r'\b\d{4}\.\d{2}\.\d{2}\b',     # 2025.08.07
    r'\b\d{2}-\d{2}-\d{4}\b',       # 08-07-2025

    # Abbreviated month + day: "Sept 9", "Dec. 2"
    r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.? ?\d{1,2}\b',

    # Short numeric without year: "9/16"
    r'\b\d{1,2}/\d{1,2}\b',

    # Short hyphen without year: "10-25"
    r'\b\d{1,2}-\d{1,2}\b',

    # Academic term + year: "Fall 2024"
    r'\b(?:Spring|Summer|Fall|Winter)\s+\d{4}\b',

    # Day + month without year: "9 September"
    r'\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\b',
]

# Compile once with IGNORECASE
combined_pattern = re.compile("|".join(date_patterns), flags=re.IGNORECASE)

TOKEN_WINDOW = 5  # max distance in tokens from the date to consider a keyword "nearby"

def classify_context(window_text: str, start_char: int, end_char: int, k: int = TOKEN_WINDOW):
    doc = nlp(window_text)

    date_span = doc.char_span(start_char, end_char, alignment_mode="expand")
    if date_span is None:
        return None
    ds, de = date_span.start, date_span.end  # [start, end)

    # Gather matcher hits within ±k tokens of the date
    candidates = []
    for match_id, ms, me in matcher(doc):
        if me <= ds:
            dist = ds - me
            direction = -1   # keyword BEFORE date
        elif ms >= de:
            dist = ms - de
            direction = +1   # keyword AFTER date
        else:
            dist = 0
            direction = 0    # overlap

        if dist <= k:
            # We'll sort by direction first (overlap < before < after), then distance
            # and finally by tighter span length.
            candidates.append((direction, dist, me - ms, match_id, ms, me))

    if not candidates:
        return {"type": None, "title": None, "context": window_text.strip()}

    # Direction-first ranking: overlap (0) < before (-1) < after (+1)
    dir_rank = {0: 0, -1: 1, +1: 2}
    candidates.sort(key=lambda x: (dir_rank[x[0]], x[1], x[2]))

    direction, dist, span_len, match_id, ms, me = candidates[0]
    event_type = nlp.vocab.strings[match_id]

    # Build title from a compact slice that surely contains BOTH keyword and date
    cover_start = max(0, min(ms, ds) - 3)
    cover_end   = min(len(doc), max(me, de) + 6)
    cover_text  = doc[cover_start:cover_end].text

    # Prefer "due ... at ..." for DUE
    title = None
    if event_type == "DUE":
        m_due = re.search(r'\b(due|deadline|submit)\b.*?(?:\bat\b.*)?', cover_text, flags=re.I)
        if m_due:
            title = m_due.group(0)

    if not title:
        kw_text   = doc[ms:me].text
        date_text = window_text[start_char:end_char]
        # Smallest clause containing both keyword and date
        clauses = re.split(r'[.;:—–-]|,(?!\d)', cover_text)
        cands = [c.strip() for c in clauses if (kw_text.lower() in c.lower() and date_text in c)]
        title = (min(cands, key=len) if cands else kw_text)

    title = re.sub(r'\s+', ' ', title).strip().rstrip('.')

    return {
        "type": event_type,
        "title": title,
        "context": cover_text.strip()
    }



def parse_dates(text: str):
    lines, res = text.splitlines(), []
    for i, line in enumerate(lines):
        prev_line = lines[i-1] if i-1 >= 0 else ""
        next_line = lines[i+1] if i+1 < len(lines) else ""
        window = f"{prev_line}\n{line}\n{next_line}"
        base = window.find(line)

        for m in re.finditer(combined_pattern, line):
            start_char = base + m.start()
            end_char   = base + m.end()
            ctx = classify_context(window, start_char, end_char) or {}
            res.append({
                "date_raw": m.group(0),
                "context": ctx.get("context", line.strip()),
                "type": ctx.get("type"),
                "title": ctx.get("title"),
            })

    # keep only with both context + type (your earlier filter)
    seen, final = set(), []
    for it in res:
        key = (it["date_raw"], it["context"])
        if key not in seen:
            final.append(it); seen.add(key)
    return final
