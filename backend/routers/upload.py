from fastapi import APIRouter, File, UploadFile, HTTPException

router = APIRouter()

@router.post('/upload')
async def upload(file: UploadFile = File(...)):
    return {"filename": file.filename}

#want to change this to upload and save in Supabase bucket