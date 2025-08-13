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

def classify_context(text: str, date_str: str):
    doc = nlp(text)
    
    if date_str not in text:
        return None

    date_token_i = None
    for i, token in enumerate(doc):
        if date_str in token.text:
            date_token_i = i
            break
    if date_token_i is None:
        return None
    
    matches = matcher(doc)
    
    closest_match = None
    min_dist = float('inf')

    for match_id, start, end in matches:
        dist = min(abs(start - date_token_i), abs(end - 1 - date_token_i))
        if dist <= 10 and dist < min_dist:  
            min_dist = dist
            closest_match = (match_id, start, end)
        
    event_type = None
    title = None
    if closest_match:
        match_id, start, end = closest_match
        event_type = nlp.vocab.strings[match_id]
        title = doc[start:end].text

    if not title:
        noun_chunks = [nc.text for nc in doc.noun_chunks]
        title = noun_chunks[0] if noun_chunks else text.strip()

    return {
        "type": event_type,
        "title": title,
        "context": text.strip(),
    }

def parse_dates(text: str):
    blocks = text.splitlines()
    res = []

    for block in blocks:
        for match in re.finditer(combined_pattern, block):
            date_str = match.group(0)

            ctx_info = classify_context(block, date_str) or {}

            res.append({
                "date_raw": date_str,
                "context": ctx_info.get("context", ""),
                "type": ctx_info.get("type"),
                "title": ctx_info.get("title")
            })

    seen = set()
    final = []
    for item in res:
        key = (item["date_raw"], item["context"])
        if key not in seen and item["context"] and item["type"]:
            final.append(item)
            seen.add(key)

    return final



