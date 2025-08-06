from backend.services.pdf_parser import parse_file
from fastapi import APIRouter, File, UploadFile, HTTPException
import tempfile

router = APIRouter()

@router.post('/parse')
async def parse(file: UploadFile = File(...)):
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    contents = await file.read()
    temp_file.write(contents)
    temp_file.close()

    return parse_file(temp_file.name)

#good for now -> needs to extract dates and shit in the future tho