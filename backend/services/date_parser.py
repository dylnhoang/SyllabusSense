import spacy
from dateparser import parse

#extracts dates from syllabi text
def parse_dates(text: str):
    nlp = spacy.load("en_core_web_sm")

    results = []
    seen = set()

    keywords = ["exam", "quiz", "test", "homework", "assignment", "midterm", "final", "due", "project", "paper"]

    doc = nlp(text)
    for sent in doc.sents:
        for ent in sent.ents:
            if ent.label_ == "DATE":
                date_str = ent.text.strip()
                parsed = parse(date_str)
                if parsed and date_str not in seen:
                    seen.add(date_str)

                    idea = ""
                    lowered = sent.text.lower()
                    for k in keywords:
                        if k in lowered:
                            idea = sent.text.strip()
                            break
                            
                    results.append({
                        "raw": date_str,
                        "parsed": parsed.isoformat(),
                        "context": idea or sent.text.strip()
                    })

    return results

