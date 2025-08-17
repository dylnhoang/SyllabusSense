from backend.services.pdf_parser import parse_file
from backend.services.weekly_schedule import parse_class_schedule
from fastapi import APIRouter, File, UploadFile, HTTPException
import tempfile

router = APIRouter()

@router.post('/weekly')
async def parse(file: UploadFile = File(...)):
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    contents = await file.read()
    temp_file.write(contents)
    temp_file.close()

    print("Extracted text:", parse_file(temp_file.name))
    return parse_class_schedule(parse_file(temp_file.name))

#good for now -> needs to extract dates w/ context in the future tho