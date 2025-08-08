import fitz

#extracts text from uploaded files
def parse_file(my_path: str):
    doc = fitz.open(my_path)

    res = ""

    for page in doc:
        blocks = page.get_text("blocks")
        for b in blocks:
            res += b[4]  # b[4] contains the text

    print(res)
        
    return res