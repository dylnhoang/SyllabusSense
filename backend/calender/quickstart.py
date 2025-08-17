from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import pathlib

SCOPES = ["https://www.googleapis.com/auth/calendar"]

def get_service():
    token = pathlib.Path("token.json")
    creds = Credentials.from_authorized_user_file(token, SCOPES) if token.exists() else None
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file("backend/calender/credentials.json", SCOPES)
            creds = flow.run_local_server(port=0)
        token.write_text(creds.to_json())
    return build("calendar", "v3", credentials=creds)

if __name__ == "__main__":
    svc = get_service()
    print("Auth OK")