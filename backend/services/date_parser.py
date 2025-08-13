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

date_patterns = [
    r'\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|'
    r'Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|'
    r'Dec(?:ember)?)\s+\d{1,2},\s+\d{4}\b',  # e.g., August 7, 2025

    r'\b\d{1,2}\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|'
    r'May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|'
    r'Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\b',  # e.g., 7 August 2025

    r'\b\d{2}/\d{2}/\d{4}\b',                  # e.g., 07/08/2025
    r'\b\d{4}-\d{2}-\d{2}\b',                  # e.g., 2025-08-07
    r'\b\d{4}\.\d{2}\.\d{2}\b',                # e.g., 2025.08.07
    r'\b\d{2}-\d{2}-\d{4}\b',                  # e.g., 08-07-2025

    r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\.? ?\d{1,2}\b',  # e.g., Sept 9, Dec. 2
    r'\b\d{1,2}/\d{1,2}\b',                                                       # e.g., 9/16
    r'\b\d{1,2}-\d{1,2}\b',                                                       # e.g., 10-25
    r'\b(?:Spring|Summer|Fall|Winter)\s+\d{4}\b',                                 # e.g., Fall 2024
    r'\b\d{1,2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\b',       # e.g., 9 September
]

combined_pattern = '|'.join(date_patterns)

def classify_context(text: str, date_span: tuple):
    start, end = date_span
    doc = nlp(text)

    date_token_i = None
    for i, token in enumerate(doc):
        for i, token in enumerate(doc):
            if token.idx == start:
                date_token_i = i
                break
        if date_token_i is None:
            return None
        
        window_start = max(0, date_token_i - 10)
        window_end = min(len(doc), date_token_i + 10)
        context_span = doc[window_start : window_end]

        matches = matcher(context_span)
        event_type = None
        if matches:
            match_id, start, end = matches[0]
            event_type = nlp.vocab.strings[match_id]

        noun_chunks = [nc.text for nc in context_span.noun_chunks]
        title = noun_chunks[0] if noun_chunks else context_span.text.strip()

        return {
            "type": event_type,
            "title": title,
            "context": context_span.text.strip(),
        }

def parse_dates(text: str):
    res = []

    for match in re.finditer(combined_pattern, text):
        date_str = match.group(0)
        date_span = match.span()

        ctx_info = classify_context(text, date_span) or {}

        res.append({
            "date_raw": date_str,
            "context": ctx_info.get("context", "")
        })


