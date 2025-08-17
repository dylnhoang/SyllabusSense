from fastapi import FastAPI
from backend.routers import upload, parse_text, parse_weekly

app = FastAPI()

app.include_router(upload.router)
app.include_router(parse_text.router)
app.include_router(parse_weekly.router)