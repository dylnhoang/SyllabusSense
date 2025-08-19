import re
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any, Tuple

# ---------- Data models ----------
@dataclass
class Meeting:
    days_text: str                # Original days text, e.g., "MWF", "Tu/Th"
    days: List[str]               # ["MO","WE","FR"]
    start_24h: str                # "13:00"
    end_24h: str                  # "14:15"
    location: Optional[str] = None
    kind: str = "CLASS"           # "CLASS" | "LAB" | "DISCUSSION" | "OFFICE"

@dataclass
class CourseSchedule:
    course_name: Optional[str]
    meetings: List[Meeting]

# ---------- Utilities ----------
DAY_TOKEN_RE = (
    r"(?:"  # common tokens and composites
    r"Mon(?:day)?|Tue(?:s)?(?:day)?|Wed(?:nesday)?|Thu(?:r)?(?:sday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?|"
    r"M|T|Tu|Tues|W|Th|R|F|Sa|Su|"
    r"MWF|M/W/F|"
    r"TTh|T/Th|TuTh|Tu/Th|TR|T/R|"
    r"MTWRF|M/T/W/R/F|MTWThF"
    r")"
)
DAY_JOIN_RE  = r"(?:(?:\s*(?:/|,|and|\+|-)\s*)|(?:\s+))"
DAYS_BLOCK_RE = rf"(?:{DAY_TOKEN_RE})(?:{DAY_JOIN_RE}(?:{DAY_TOKEN_RE}))*"

# Times like:
# 1-2pm, 1–2 pm, 1:00-2:15pm, 13:00-14:15, 9:30–10:45 a.m., 11 am–12 pm
TIME_RE      = r"(?P<t>\d{1,2}(?::\d{2})?)\s*(?P<a>a\.?m\.?|p\.?m\.?)?"
TIME_RANGE_RE = (
    r"(?P<t1>\d{1,2}(?::\d{2})?)\s*(?P<a1>a\.?m\.?|p\.?m\.?)?\s*"
    r"(?:-|–|—|\bto\b)\s*"
    r"(?P<t2>\d{1,2}(?::\d{2})?)\s*(?P<a2>a\.?m\.?|p\.?m\.?)?"
)
RANGE_ANY_RE = re.compile(TIME_RANGE_RE, flags=re.I)

LINE_DAYS_RE = re.compile(rf"^\s*(?P<days>{DAYS_BLOCK_RE})\s*$", flags=re.I)
LINE_TIME_RE = re.compile(rf"^\s*(?P<trange>{TIME_RANGE_RE})\s*$", flags=re.I)
LINE_LOC_RE  = re.compile(
    r"^\s*(?:Location[: ]*)?(?P<loc>(?:TBD|Rm|Room|Hall|HALL|CH|Fowler|Science|Building|Bldg)[^\n,;]*)\s*$",
    flags=re.I
)

# Typical schedule lines:
# "Meets: MWF 10:00–10:50 AM (Room 101)"
# "Lecture Tu/Th 1:00-2:15pm, Fowler 302"
# "Class: Tuesday and Thursday 13:00–14:15, CH 120"
SCHEDULE_LINE_RE = re.compile(
    rf"(?P<prefix>\b(Meets|Meeting|Class|Class Meeting|Lecture|Times?)\b[: ]*)?"
    rf"(?P<days>{DAYS_BLOCK_RE})[ ,]*"
    rf"(?P<trange>{TIME_RANGE_RE})"
    rf"(?:[ ,;|-]+(?P<loc>(?:Rm|Room|Lab|Hall|HALL|CH|Fowler|Science|Building|Bldg|Online|Zoom|Location|TBD)[^,\n;]*))?",
    flags=re.IGNORECASE
)

COURSE_LINE_RE = re.compile(
    r"^\s*(Syllabus|Course)\s*[:-]?\s*(?P<name>.+)$|^\s*(?P<code>[A-Za-z]{2,}\s*\d{2,3}[A-Za-z\-]*)\s*[–-]\s*(?P<title>.+)$",
    flags=re.IGNORECASE | re.MULTILINE
)

CODE_RE = re.compile(
    r'\b([A-Z][A-Za-z&/]{1,15})\s*[:\-]?\s*(\d{1,3}[A-Za-z\-]*)\b'  # e.g., PHYS 110, Math 22, CS 101A
)
TERM_RE = re.compile(r'\b(Fall|Spring|Summer|Winter)\s+\d{4}\b', re.I)
NOISE_RE = re.compile(r'(course\s*page|canvas|syllabus\s*page|policy|resources)', re.I)

# Office/support detection
OFFICE_BLOCK_RE = re.compile(r"^\s*Office\s*Hours\s*:", flags=re.I|re.M)
OFFICE_RE = re.compile(r'\b(office|student|instructor)\s*hours\b|\bOH\b', re.I)
APPT_RE     = re.compile(r'\b(appointments?|by\s+appointment|drop-?in)\b', re.I)
SERVICE_RE  = re.compile(
    r'\b(M[-/–]F|Mon(?:day)?\s*-\s*Fri(?:day)?)\b.*\b\d{1,2}(:\d{2})?\s*(a\.?m\.?|p\.?m\.?)\b.*\b\d{1,2}(:\d{2})?\s*(a\.?m\.?|p\.?m\.?)\b',
    re.I
)
SUPPORT_HINTS = re.compile(r'\b(chat|research support|library|tlrs|tutor|hotline|counseling|help\s*desk)\b', re.I)

# Section headers that imply a block kind
# NOTE: we accept Office/Student/Instructor Hours with or without a trailing colon,
# but we'll still tighten the span to the next blank/header line to avoid overreach.
SECTION_KIND_HEADERS = {
    "OFFICE":     re.compile(r'^\s*((Office|Student|Instructor)\s*Hours|OH|Availability)\b.*$', re.I | re.M),
    "LAB":        re.compile(r'^\s*(Labs?|Laborator(?:y|ies)|Studio)\s*:\s*$',   re.I | re.M),
    "DISCUSSION": re.compile(r'^\s*(Discussion|Recitation|Sections?)\s*:\s*$',   re.I | re.M),
    "CLASS":      re.compile(r'^\s*(Class\s*Meetings?|Meeting\s*Times?|Lecture|Schedule)\s*:\s*$', re.I | re.M),
}
# A simple “next header” or blank-line delimiter
NEXT_HEADER_OR_BLANK_RE = re.compile(r'^\s*\S[^:\n]*:\s*$|^\s*$', re.M)

# Kind hints (word-level)
LAB_HINT_RE        = re.compile(r'\b(lab|laborator(?:y|ies)|studio)\b', re.I)
DISC_HINT_RE       = re.compile(r'\b(discussion|recitation|precept|tutorial|section)\b', re.I)
LECTURE_HINT_RE    = re.compile(r'\b(lecture|class|seminar|meeting|meets)\b', re.I)

# Peek-behind context to help classify office hours even when the time line has no keywords
CONTEXT_WINDOW_CHARS = 200

# Day maps
DAY_MAP = {
    "m": "MO", "mon": "MO", "monday": "MO",
    "t": "TU", "tu": "TU", "tue": "TU", "tues": "TU", "tuesday": "TU",
    "w": "WE", "wed": "WE", "wednesday": "WE",
    "r": "TH", "th": "TH", "thu": "TH", "thur": "TH", "thurs": "TH", "thursday": "TH",
    "f": "FR", "fri": "FR", "friday": "FR",
    "sa": "SA", "sat": "SA", "saturday": "SA",
    "su": "SU", "sun": "SU", "sunday": "SU",
}
COMPOSITES = {
    "mwf": ["MO","WE","FR"],
    "m/w/f": ["MO","WE","FR"],
    "tth": ["TU","TH"],
    "t/th": ["TU","TH"],
    "tuth": ["TU","TH"],
    "tu/th": ["TU","TH"],
    "tr":  ["TU","TH"],
    "t/r": ["TU","TH"],
    "mtwrf": ["MO","TU","WE","TH","FR"],
    "m/t/w/r/f": ["MO","TU","WE","TH","FR"],
    "mtwthf": ["MO","TU","WE","TH","FR"],
    "m-f": ["MO","TU","WE","TH","FR"],
}

def _norm_ampm(s: Optional[str]) -> Optional[str]:
    if not s:
        return None
    s = s.lower().replace(".", "")
    return {"am":"am", "a m":"am", "a":"am", "pm":"pm", "p m":"pm", "p":"pm"}.get(s, s)

def normalize_text(t: str) -> str:
    t = (t.replace("\u2013", "-")
           .replace("\u2014", "-")
           .replace("\u2212", "-")
           .replace("\u00A0", " "))   # NBSP → space
    t = re.sub(r"[ \t]{2,}", " ", t)
    t = t.replace("\r\n", "\n").replace("\r", "\n")
    return t

def _to_24h_with_ampm(hm: str, ampm: Optional[str]) -> str:
    def _norm(s):
        if not s: return None
        s = s.lower().replace('.', '')
        return 'am' if s.startswith('a') else ('pm' if s.startswith('p') else None)
    am = _norm(ampm)
    h, m = (hm.split(":") + ["00"])[:2]
    h, m = int(h), int(m)
    if am == 'am':
        if h == 12: h = 0
    elif am == 'pm':
        if h < 12: h += 12
    return f"{h:02d}:{m:02d}"

def _resolve_range(t1, a1, t2, a2):
    """
    Rule:
      - If only one side has AM/PM, use that for BOTH sides.
      - If neither side has AM/PM and end<=start, assume the END is PM (common class case).
    """
    left_ampm  = a1 or a2
    right_ampm = a2 or a1
    s = _to_24h_with_ampm(t1, left_ampm)
    e = _to_24h_with_ampm(t2, right_ampm)

    sh, sm = map(int, s.split(':'))
    eh, em = map(int, e.split(':'))

    # No AM/PM provided and inverted → bump end into PM (e.g., 1:30-2:20)
    if (a1 is None) and (a2 is None):
        if (eh, em) <= (sh, sm) and sh < 12:
            eh += 12
            e = f"{eh:02d}:{em:02d}"
    return s, e

def _gather_extra_ranges(after_text: str):
    return list(RANGE_ANY_RE.finditer(after_text))

def _has_days(s: str) -> bool:
    return bool(re.search(rf'\b{DAY_TOKEN_RE}\b', s, flags=re.I))

def _explode_days(days_text: str) -> List[str]:
    txt = days_text.strip()
    comp_key = re.sub(r"[^A-Za-z]", "", txt).lower()
    if comp_key in COMPOSITES:
        return COMPOSITES[comp_key]
    parts = re.split(DAY_JOIN_RE, txt, flags=re.IGNORECASE)
    out: List[str] = []
    for p in parts:
        if not p.strip():
            continue
        p_clean = p.strip().lower()
        if p_clean in DAY_MAP:
            out.append(DAY_MAP[p_clean]); continue
        pp = re.sub(r"[^A-Za-z]", "", p_clean)
        if pp in COMPOSITES:
            out.extend(COMPOSITES[pp]); continue
        out.append(DAY_MAP.get(pp, None))
    return [d for d in out if d]

def _clean(s: str) -> str:
    s = re.sub(r'\s+', ' ', s)
    s = s.strip(' -–—:;,. \t')
    return s

def _good_line(line: str) -> bool:
    if NOISE_RE.search(line): return False
    return len(line.strip()) >= 6

def _skip_nonclass_line(line: str) -> bool:
    # Service windows, helpdesk, etc. (keep office/class/etc)
    if SERVICE_RE.search(line) and SUPPORT_HINTS.search(line): return True
    return False

def _iter_lines_with_offsets(text: str) -> List[Tuple[int, int, str]]:
    """Return [(start, end, line_text), ...] for the whole doc."""
    out = []
    pos = 0
    for ln in text.splitlines(True):  # keepends
        start = pos
        end = pos + len(ln)
        out.append((start, end, ln.rstrip('\n\r')))
        pos = end
    return out

def _fallback_line_pairs_with_pos(text: str):
    """
    Yield (days_text, time_match, location_or_None, days_line_start_offset, synthetic_line_text)
    """
    lines = _iter_lines_with_offsets(text)
    # Just the visible text for regex line-based matches:
    plain = [ln for _, _, ln in lines]

    for i, ln in enumerate(plain):
        md = LINE_DAYS_RE.match(ln)
        if not md:
            continue
        # look within next 2 visible lines for a time
        for j in (i+1, i+2):
            if j < len(plain):
                mt = LINE_TIME_RE.match(plain[j])
                if mt:
                    loc = None
                    # optional location same/next line
                    for k in (j, j+1):
                        if k < len(plain):
                            ml = LINE_LOC_RE.match(plain[k])
                            if ml:
                                loc = ml.group("loc").strip(" ,;."); break
                    days_text = md.group("days")
                    # use the start offset of the days line
                    start_off = lines[i][0]
                    synthetic_line = f"{days_text} {mt.group('t1')}-{mt.group('t2')} {loc or ''}".strip()
                    yield days_text, mt, loc, start_off, synthetic_line
                    break

def _guess_course_name(text: str) -> Optional[str]:
    norm = text.replace('—', '-').replace('–', '-')
    lines = [l.strip() for l in norm.splitlines() if l.strip()]
    # Only scan the top of the doc (headers), but give some slack
    head = lines[:80]

    best = None
    best_score = -1
    for i, ln in enumerate(head):
        if not _good_line(ln): continue
        m = CODE_RE.search(ln)
        if not m:
            if i+1 < len(head):
                combo = f"{ln} {head[i+1]}"
                m2 = CODE_RE.search(combo)
                if m2 and _good_line(combo):
                    dept, num = m2.groups()
                    title = CODE_RE.sub('', combo).strip(' -:')
                    cand = _clean(f"{dept} {num} {title}")
                    score = 2
                    if TERM_RE.search(combo): score += 1
                    if len(title) >= 8: score += 1
                    if score > best_score:
                        best, best_score = cand, score
            continue

        dept, num = m.groups()
        # Title = remainder of line after code; if empty, try next line
        title = _clean(ln[m.end():]) or (_clean(head[i+1]) if i+1 < len(head) and _good_line(head[i+1]) else '')
        cand = _clean(f"{dept} {num} {title}")

        # score: presence of term, has title words, nearer to top is better
        score = 2
        if TERM_RE.search(ln) or TERM_RE.search(title): score += 1
        if len(title.split()) >= 2: score += 1
        score += max(0, 5 - i//5)  # slight preference to earlier lines

        if score > best_score:
            best, best_score = cand, score

    # Final cleanup: drop trailing term if you don’t want it in the name
    if best:
        # If you want to keep the term, comment out the next two lines
    #     best = TERM_RE.sub('', best)
        best = _clean(best)
        return best

    # Fallback: any code anywhere
    m = CODE_RE.search(norm)
    if m:
        return _clean(f"{m.group(1)} {m.group(2)}")

    return None

# ----- Section-kind spans & classification -----
def _find_all_headers(text: str) -> List[Tuple[int, str]]:
    """Return sorted list of (start_index, KIND) for all section-kind headers."""
    headers = []
    for kind, hdr_re in SECTION_KIND_HEADERS.items():
        for m in hdr_re.finditer(text):
            headers.append((m.start(), kind))
    headers.sort(key=lambda x: x[0])
    return headers

def _compute_kind_spans(text: str):
    """
    Build non-overlapping spans: each header covers until the *next* header
    OR the next 'header-like' line or blank line after some content.
    This keeps 'Office Hours' blocks tight even without a colon.
    """
    spans = []
    headers = _find_all_headers(text)  # [(pos, kind), ...] sorted
    if not headers:
        return spans
    for i, (start, kind) in enumerate(headers):
        # default end: next header or EOF
        end = headers[i+1][0] if i+1 < len(headers) else len(text)
        # tighten: if a header-like or blank line occurs sooner, use that
        nxt = NEXT_HEADER_OR_BLANK_RE.search(text, start + 1)
        if nxt and nxt.start() < end:
            end = nxt.start()
        spans.append((start, end, kind))
    return spans

def _kind_at(pos: int, spans):
    for s, e, k in spans:
        if s <= pos < e:
            return k
    return None

def _classify_kind(line_text: str, loc: Optional[str], span_kind: Optional[str], ctx: str = "") -> str:
    # 0) If the preceding context mentions office hours, that's strongest
    if ctx and OFFICE_RE.search(ctx):
        return "OFFICE"

    # 1) Inline "Office hours" on the same line should always win
    txt = (line_text or "")
    if OFFICE_RE.search(txt):
        return "OFFICE"

    # 2) Section signal (next priority)
    if span_kind == "OFFICE":     return "OFFICE"
    if span_kind == "LAB":        return "LAB"
    if span_kind == "DISCUSSION": return "DISCUSSION"

    # 3) Other inline hints
    loc = loc or ""
    if LAB_HINT_RE.search(txt) or LAB_HINT_RE.search(loc):   return "LAB"
    if DISC_HINT_RE.search(txt) or DISC_HINT_RE.search(loc): return "DISCUSSION"
    if LECTURE_HINT_RE.search(txt):                          return "CLASS"

    # 4) Default
    return "CLASS"

# ----- Lab block parsing (kept for completeness) -----
LAB_LINE_RE = re.compile(
    r"Lab\s+Sections?:\s*(?P<body>.+?)\s*(\((?P<allloc>all in [^)]+)\))?\s*$",
    flags=re.IGNORECASE | re.MULTILINE
)
LAB_ITEM_RE = re.compile(
    rf"(?:Sec\s*\d+\s*[–-]\s*)?(?P<days>{DAY_TOKEN_RE})\s*(?P<trange>{TIME_RANGE_RE})",
    flags=re.IGNORECASE
)
ROOM_RE = re.compile(r"\b([A-Z]{2,}\s*\d{1,4})\b")  # e.g., HSC 109, CH 120

def _parse_labs_block(text: str) -> List[Meeting]:
    out = []
    for labm in LAB_LINE_RE.finditer(text):
        body = labm.group("body")
        shared = labm.group("allloc")
        shared_loc = None
        if shared:
            rm = ROOM_RE.search(shared)
            if rm: shared_loc = rm.group(1)

        for part in body.split(";"):
            item = LAB_ITEM_RE.search(part)
            if not item:
                continue
            days_text = item.group("days")
            days = _explode_days(days_text)

            a1, a2 = item.group("a1"), item.group("a2")
            t1, t2 = item.group("t1"), item.group("t2")
            start_24h, end_24h = _resolve_range(t1, a1, t2, a2)

            # try to capture a per-item room (rare), else shared "(all in HSC 109)"
            loc = None
            rm = ROOM_RE.search(part)
            if rm: loc = rm.group(1)
            if not loc: loc = shared_loc

            out.append(Meeting(
                days_text=days_text,
                days=days,
                start_24h=start_24h,
                end_24h=end_24h,
                location=loc,
                kind="LAB"
            ))
    return out

def _dedupe_meetings(meetings: List[Meeting]) -> List[Meeting]:
    seen = set(); out = []
    for mt in meetings:
        key = (tuple(mt.days), mt.start_24h, mt.end_24h, (mt.location or "").lower(), mt.kind)
        if key in seen: continue
        seen.add(key); out.append(mt)
    return out

def time_makes_sense(meeting: Meeting) -> bool:
    sh, sm = map(int, meeting.start_24h.split(':'))
    eh, em = map(int, meeting.end_24h.split(':'))
    return (eh, em) > (sh, sm)

# ---------- Main parser ----------
def parse_class_schedule(raw_text: str) -> CourseSchedule:
    text = normalize_text(raw_text)
    meetings: List[Meeting] = []

    # Kind spans from section headers (Office Hours:, Lab:, etc.)
    kind_spans = _compute_kind_spans(text)

    # ---- Pass A: explicit schedule lines in one line ----
    for m in SCHEDULE_LINE_RE.finditer(text):
        # determine line bounds for classification/filters
        line_start = text.rfind("\n", 0, m.start()) + 1
        line_end = text.find("\n", m.end())
        line_end = len(text) if line_end == -1 else line_end
        line_text = text[line_start:line_end]

        if _skip_nonclass_line(line_text):
            continue

        days_text = m.group("days").strip()
        days = _explode_days(days_text)

        a1, a2 = m.group("a1"), m.group("a2")
        t1, t2 = m.group("t1"), m.group("t2")
        start_24h, end_24h = _resolve_range(t1, a1, t2, a2)

        loc = m.group("loc")
        if loc:
            loc = re.sub(r"\s+", " ", loc).strip(" ,;.")
            if loc.upper() == "TBD":
                loc = "TBD"

        # ---- classification (use this line; OFFICE inline and ctx override span) ----
        span_kind = _kind_at(m.start(), kind_spans)   # where the match occurs
        prev_ctx_start = max(0, line_start - CONTEXT_WINDOW_CHARS)
        prev_ctx = text[prev_ctx_start:line_start]
        kind = _classify_kind(line_text, loc, span_kind, prev_ctx)

        meetings.append(Meeting(days_text, days, start_24h, end_24h, loc, kind))

        # IMPORTANT: We intentionally DO NOT scan for "extra ranges" on the same/next line,
        # because that tends to pair a day from one line with a time from another,
        # creating incorrect day-time combos and duplicates.

    # ---- Pass B: fallback line-pair stitching with positions ----
    for days_text, mt, loc, start_off, synth_line in _fallback_line_pairs_with_pos(text):
        if _skip_nonclass_line(synth_line):
            continue

        days = _explode_days(days_text)
        start_24h, end_24h = _resolve_range(mt.group("t1"), mt.group("a1"), mt.group("t2"), mt.group("a2"))

        if loc:
            loc = re.sub(r"\s+", " ", loc).strip(" ,;.")
            if loc.upper() == "TBD":
                loc = "TBD"

        # classification for fallback (use preceding context around the days line)
        span_kind = _kind_at(start_off, kind_spans)
        prev_ctx_start = max(0, start_off - CONTEXT_WINDOW_CHARS)
        prev_ctx = text[prev_ctx_start:start_off]
        kind = _classify_kind(synth_line, loc, span_kind, prev_ctx)

        meetings.append(Meeting(days_text, days, start_24h, end_24h, loc, kind))

    # Dedupe & sanity filter
    meetings = [m for m in meetings if time_makes_sense(m)]
    meetings = _dedupe_meetings(meetings)

    return CourseSchedule(course_name=_guess_course_name(text), meetings=meetings)

# Helpers
def meetings_to_rrule(meet: Meeting, dtstart_ymd: str) -> Dict[str, Any]:
    """
    Convert one meeting pattern to a Google Calendar friendly dict:
    - BYDAY from meet.days
    - DTSTART from term start date (your choice)
    """
    byday = ",".join(meet.days) or None
    return {
        "start": {"dateTime": f"{dtstart_ymd}T{meet.start_24h}:00"},
        "end":   {"dateTime": f"{dtstart_ymd}T{meet.end_24h}:00"},
        "recurrence": [f"RRULE:FREQ=WEEKLY;BYDAY={byday}"] if byday else []
    }

def exam_window_from_schedule(item_course: str, schedule: CourseSchedule, exam_ymd: str):
    """
    Given a course name (or code) and parsed schedule, return (start_dt, end_dt)
    for that exam date using the first matching meeting block.
    """
    if schedule.meetings:
        m = schedule.meetings[0]
        return f"{exam_ymd}T{m.start_24h}:00", f"{exam_ymd}T{m.end_24h}:00"
    return None, None
