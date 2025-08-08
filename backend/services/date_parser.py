import re

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

def parse_dates(text: str):
    matches = re.findall(combined_pattern, text)
    for date in matches:
        print(f"Found date: {date}")
    return matches