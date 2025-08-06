import pymupdf

#extracts text from uploaded files
def parse_file(my_path: str):
    doc = pymupdf.open(my_path)

    res = ""

    for page in doc:
        text = page.get_text()
        res += text
        
    return res