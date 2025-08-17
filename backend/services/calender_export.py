from datetime import date, timedelta
from backend.calender.quickstart import get_service

TZ = "America/Los_Angeles"

def to_event(item):
    summary = item.get("title") or item.get("type", "Event").title()
    desc = item.get("context", "")
    d = item["iso_date"]                       # YYYY-MM-DD
    if item.get("type") == "DUE" and item.get("due_time"):
        return {
          "summary": summary,
          "description": desc,
          "start": {"dateTime": f"{d}T{item['due_time']}:00", "timeZone": TZ},
          "end":   {"dateTime": f"{d}T{item['due_time']}:59", "timeZone": TZ},
        }
    # default: all-day on date
    # end is exclusive → next day
    y, m, day = map(int, d.split("-"))
    end_day = (date(y, m, day) + timedelta(days=1)).isoformat()
    return {
      "summary": summary,
      "description": desc,
      "start": {"date": d},
      "end":   {"date": end_day},
    }

def insert_items(items, calendar_id="primary"):
    svc = get_service()
    for it in items:
        ev = to_event(it)
        created = svc.events().insert(calendarId=calendar_id, body=ev).execute()
        print("OK", created["id"], "-", ev["summary"])