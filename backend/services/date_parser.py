import spacy
from dateparser import parse

#extracts dates from syllabi text
def parse_dates(text: str):
    nlp = spacy.load("en_core_web_sm")

    res = ""

    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ == "DATE":
            res += ("Raw:" + ent.text) + "              " + ("Parsed:" + str(parse(ent.text))) + "\n"

    return res

