import re
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any

# ---------- Data models ----------
@dataclass
class Meeting:
    days_text: str                # Original days text, e.g., "MWF", "Tu/Th"
    days: List[str]               # ["MO","WE","FR"]
    start_24h: str                # "13:00"
    end_24h: str                  # "14:15"
    location: Optional[str] = None

@dataclass
class CourseSchedule:
    course_name: Optional[str]
    meetings: List[Meeting]

# ---------- Utilities ----------
DAY_TOKEN_RE = (
    r"(?:"
    r"Mon(?:day)?|Tue(?:s)?(?:day)?|Wed(?:nesday)?|Thu(?:r)?(?:sday)?|Fri(?:day)?|Sat(?:urday)?|Sun(?:day)?|"
    r"M|T|Tu|Tues|W|Th|R|F|Sa|Su|"
    r"MWF|M/W/F|"
    r"TTh|T/Th|TuTh|Tu/Th|TR|T/R|"
    r"MTWRF|M/T/W/R/F|MTWThF"
    r")"
)
DAY_JOIN_RE  = r"(?:(?:\s*(?:/|,|and|\+|-)\s*)|(?:\s+))"
DAYS_BLOCK_RE = rf"(?:{DAY_TOKEN_RE})(?:{DAY_JOIN_RE}(?:{DAY_TOKEN_RE}))*"

# Times like:
# 1-2pm, 1–2 pm, 1:00-2:15pm, 13:00-14:15, 9:30–10:45 a.m., 11 am–12 pm
TIME_RE      = r"(?P<t>\d{1,2}(?::\d{2})?)\s*(?P<a>a\.?m\.?|p\.?m\.?)?"
TIME_RANGE_RE = (
    r"(?P<t1>\d{1,2}(?::\d{2})?)\s*(?P<a1>a\.?m\.?|p\.?m\.?)?\s*"
    r"(?:-|–|—|\bto\b)\s*"
    r"(?P<t2>\d{1,2}(?::\d{2})?)\s*(?P<a2>a\.?m\.?|p\.?m\.?)?"
)

# Typical schedule lines we’ll match:
# "Meets: MWF 10:00–10:50 AM (Room 101)"
# "Lecture Tu/Th 1:00-2:15pm, Fowler 302"
# "Class: Tuesday and Thursday 13:00–14:15, CH 120"
SCHEDULE_LINE_RE = re.compile(
    rf"(?P<prefix>\b(Meets|Meeting|Class|Class Meeting|Lecture|Times?)\b[: ]*)?"
    rf"(?P<days>{DAY_TOKEN_RE})(?:[ ,/]*(?P<days2>{DAY_TOKEN_RE}))?"  # optional second block like "TTh/Fr"
    rf"[ ,]*"
    rf"(?P<trange>{TIME_RANGE_RE})"
    rf"(?:[ ,;|-]+(?P<loc>(?:Rm|Room|Lab|Hall|HALL|CH|Fowler|Science|Building|Bldg|Online|Zoom|Location|TBD)[^,\n;]*))?",
    flags=re.IGNORECASE
)

# Course title lines (very heuristic but works well on most syllabi)
COURSE_LINE_RE = re.compile(
    r"^\s*(Syllabus|Course)\s*[:-]?\s*(?P<name>.+)$|^\s*(?P<code>[A-Za-z]{2,}\s*\d{2,3}[A-Za-z\-]*)\s*[–-]\s*(?P<title>.+)$",
    flags=re.IGNORECASE | re.MULTILINE
)

CODE_RE = re.compile(
    r'\b([A-Z][A-Za-z&/]{1,15})\s*[:\-]?\s*(\d{2,3}[A-Za-z\-]*)\b'  # e.g., PHYS 110, Math 212
)
TERM_RE = re.compile(r'\b(Fall|Spring|Summer|Winter)\s+\d{4}\b', re.I)
NOISE_RE = re.compile(r'(course\s*page|canvas|syllabus\s*page|policy|resources)', re.I)

OFFICE_BLOCK_RE = re.compile(r"^\s*Office\s*Hours\s*:", flags=re.I|re.M)

# Map many day spellings/abbrevs to canonical weekday codes
DAY_MAP = {
    "m": "MO", "mon": "MO", "monday": "MO",
    "t": "TU", "tu": "TU", "tue": "TU", "tues": "TU", "tuesday": "TU",
    "w": "WE", "wed": "WE", "wednesday": "WE",
    "r": "TH", "th": "TH", "thu": "TH", "thur": "TH", "thurs": "TH", "thursday": "TH",
    "f": "FR", "fri": "FR", "friday": "FR",
    "sa": "SA", "sat": "SA", "saturday": "SA",
    "su": "SU", "sun": "SU", "sunday": "SU",
}
# Multi-token conveniences
COMPOSITES = {
    "mwf": ["MO","WE","FR"],
    "m/w/f": ["MO","WE","FR"],
    "tth": ["TU","TH"],
    "t/th": ["TU","TH"],
    "tuth": ["TU","TH"],
    "tu/th": ["TU","TH"],
    "tr":  ["TU","TH"],
    "t/r": ["TU","TH"],
    "mtwrf": ["MO","TU","WE","TH","FR"],
    "m/t/w/r/f": ["MO","TU","WE","TH","FR"],
    "mtwthf": ["MO","TU","WE","TH","FR"],
}

def _norm_ampm(s: Optional[str]) -> Optional[str]:
    if not s:
        return None
    s = s.lower().replace(".", "")
    return {"am":"am", "a m":"am", "a":"am", "pm":"pm", "p m":"pm", "p":"pm"}.get(s, s)

def _to_24h(hm: str, ampm_left: Optional[str], ampm_right: Optional[str]) -> str:
    ampm = _norm_ampm(ampm_right) or _norm_ampm(ampm_left)
    h, m = (hm.split(":") + ["00"])[:2]
    h, m = int(h), int(m)

    # If we got explicit am/pm, convert normally:
    if ampm == "am":
        if h == 12: h = 0
    elif ampm == "pm":
        if h < 12: h += 12
    else:
        # Heuristic for no am/pm:
        # - If 1–7 → assume afternoon classes if your campus mostly schedules then (13–19)
        # - Else leave as-is (8–12 → morning; 13–23 already 24h)
        if 1 <= h <= 7:
            h += 12

    return f"{h:02d}:{m:02d}"

def _explode_days(days_text: str) -> List[str]:
    txt = days_text.strip()
    # Fast path for composites like "MWF", "TTh", "TR"
    comp_key = re.sub(r"[^A-Za-z]", "", txt).lower()
    if comp_key in COMPOSITES:
        return COMPOSITES[comp_key]

    # Split on separators: '/', ',', 'and', '+', '-', whitespace
    parts = re.split(DAY_JOIN_RE, txt, flags=re.IGNORECASE)
    out: List[str] = []
    for p in parts:
        if not p.strip():
            continue
        p_clean = p.strip().lower()
        # handle single letters and words
        if p_clean in DAY_MAP:
            out.append(DAY_MAP[p_clean])
            continue
        # handle Tue/Thu crushed like "TTh" or "TR" inside a part
        pp = re.sub(r"[^A-Za-z]", "", p_clean)
        if pp in COMPOSITES:
            out.extend(COMPOSITES[pp]); continue
        # try multi-char tokens "mon", "thurs", etc.
        out.append(DAY_MAP.get(pp, None))
    return [d for d in out if d]

def _clean(s: str) -> str:
    s = re.sub(r'\s+', ' ', s)
    s = s.strip(' -–—:;,. \t')
    return s

def _good_line(line: str) -> bool:
    if NOISE_RE.search(line): return False
    # avoid lines that are just navigation or URLs
    if len(line.strip()) < 6: return False
    return True

def _guess_course_name(text: str) -> Optional[str]:
    # Normalize weird dashes and whitespace
    norm = text.replace('—', '-').replace('–', '-')
    lines = [l.strip() for l in norm.splitlines() if l.strip()]
    # Only scan the top of the doc (headers), but give some slack
    head = lines[:80]

    best = None
    best_score = -1

    for i, ln in enumerate(head):
        if not _good_line(ln): continue
        m = CODE_RE.search(ln)
        if not m:
            # Sometimes code line then title on next line: try combining two lines
            if i+1 < len(head):
                combo = f"{ln} {head[i+1]}"
                m2 = CODE_RE.search(combo)
                if m2 and _good_line(combo):
                    dept, num = m2.groups()
                    title = CODE_RE.sub('', combo).strip(' -:')  # remove code part
                    cand = _clean(f"{dept} {num} {title}")
                    score = 2
                    if TERM_RE.search(combo): score += 1
                    if len(title) >= 8: score += 1
                    if score > best_score:
                        best, best_score = cand, score
            continue

        dept, num = m.groups()
        # Title = remainder of line after code; if empty, try next line
        title = _clean(ln[m.end():]) or (_clean(head[i+1]) if i+1 < len(head) and _good_line(head[i+1]) else '')
        cand = _clean(f"{dept} {num} {title}")

        # score: presence of term, has title words, nearer to top is better
        score = 2
        if TERM_RE.search(ln) or TERM_RE.search(title): score += 1
        if len(title.split()) >= 2: score += 1
        score += max(0, 5 - i//5)  # slight preference to earlier lines

        if score > best_score:
            best, best_score = cand, score

    # Final cleanup: drop trailing term if you don’t want it in the name
    if best:
        # If you want to keep the term, comment out the next two lines
        best = TERM_RE.sub('', best)
        best = _clean(best)
        return best

    # Fallback: any code anywhere
    m = CODE_RE.search(norm)
    if m:
        return _clean(f"{m.group(1)} {m.group(2)}")

    return None

def _looks_like_office_hours(ctx: str) -> bool:
    # simple text guard
    return bool(re.search(r"office\s*hours", ctx, flags=re.I))

def _is_in_office_block(text: str, match_start: int) -> bool:
    # Find nearest "Office Hours:" above; stop block at blank line or next section header
    block_start = [m.start() for m in OFFICE_BLOCK_RE.finditer(text) if m.start() <= match_start]
    if not block_start: return False
    block_start = max(block_start)
    # crude end: next blank line or next line ending with colon
    after = text[block_start:match_start]
    return True  # we are within the office hours area

LAB_LINE_RE = re.compile(
    r"Lab\s+Sections?:\s*(?P<body>.+?)\s*(\((?P<allloc>all in [^)]+)\))?\s*$",
    flags=re.IGNORECASE | re.MULTILINE
)
LAB_ITEM_RE = re.compile(
    rf"(?:Sec\s*\d+\s*[–-]\s*)?(?P<days>{DAY_TOKEN_RE})\s*(?P<trange>{TIME_RANGE_RE})",
    flags=re.IGNORECASE
)
ROOM_RE = re.compile(r"\b([A-Z]{2,}\s*\d{1,4})\b")  # matches HSC 109, CH 120, etc.

def _parse_labs_block(text: str) -> List[Meeting]:
    out = []
    for labm in LAB_LINE_RE.finditer(text):
        body = labm.group("body")
        # optional shared location "(all in HSC 109)"
        shared = labm.group("allloc")
        shared_loc = None
        if shared:
            rm = ROOM_RE.search(shared)
            if rm: shared_loc = rm.group(1)

        for part in body.split(";"):
            item = LAB_ITEM_RE.search(part)
            if not item: 
                continue
            days_text = item.group("days")
            days = _explode_days(days_text)

            a1, a2 = item.group("a1"), item.group("a2")
            t1, t2 = item.group("t1"), item.group("t2")
            start_24h = _to_24h(t1, a1, a2)
            end_24h   = _to_24h(t2, a1, a2)

            # try to capture a per-item room (rare), else shared "(all in HSC 109)"
            loc = None
            rm = ROOM_RE.search(part)
            if rm: loc = rm.group(1)
            if not loc: loc = shared_loc

            out.append(Meeting(
                days_text=days_text,
                days=days,
                start_24h=start_24h,
                end_24h=end_24h,
                location=loc
            ))
    return out

def _dedupe_meetings(meetings):
    seen = set(); out = []
    for mt in meetings:
        key = (tuple(mt.days), mt.start_24h, mt.end_24h, (mt.location or "").lower())
        if key in seen: continue
        seen.add(key); out.append(mt)
    return out

# ---------- Main parser ----------
def parse_class_schedule(raw_text: str) -> CourseSchedule:
    meetings: List[Meeting] = []
    # 3a) Labs first (so they don't get swallowed oddly)
    meetings.extend(_parse_labs_block(raw_text))

    # 3b) Lectures and other lines
    for m in SCHEDULE_LINE_RE.finditer(raw_text):
        line_start = raw_text.rfind("\n", 0, m.start()) + 1
        line_text = raw_text[line_start: raw_text.find("\n", m.end()) if raw_text.find("\n", m.end())!=-1 else len(raw_text)]
        if _looks_like_office_hours(raw_text[line_start: m.end()]) or _is_in_office_block(raw_text, m.start()):
            continue

        days_text = m.group("days")
        days = _explode_days(days_text)

        a1, a2 = m.group("a1"), m.group("a2")
        start_24h = _to_24h(m.group("t1"), a1, a2)
        end_24h   = _to_24h(m.group("t2"), a1, a2)

        loc = m.group("loc")
        if not loc:
            # try a generic room on the same line
            rm = ROOM_RE.search(line_text)
            if rm: loc = rm.group(1)

        meetings.append(Meeting(
            days_text=days_text.strip(),
            days=days,
            start_24h=start_24h,
            end_24h=end_24h,
            location=(re.sub(r"\s+", " ", loc).strip(" ,;.") if loc else None)
        ))

    meetings = _dedupe_meetings(meetings)

    return CourseSchedule(course_name=_guess_course_name(raw_text), meetings=meetings)

# ---------- Helpers you’ll likely want ----------
def meetings_to_rrule(meet: Meeting, dtstart_ymd: str) -> Dict[str, Any]:
    """
    Convert one meeting pattern to a Google Calendar friendly dict:
    - BYDAY from meet.days
    - DTSTART from term start date (your choice)
    """
    byday = ",".join(meet.days) or None
    return {
        "start": {"dateTime": f"{dtstart_ymd}T{meet.start_24h}:00"},
        "end":   {"dateTime": f"{dtstart_ymd}T{meet.end_24h}:00"},
        "recurrence": [f"RRULE:FREQ=WEEKLY;BYDAY={byday}"] if byday else []
    }

def exam_window_from_schedule(item_course: str, schedule: CourseSchedule, exam_ymd: str):
    """
    Given a course name (or code) and parsed schedule, return (start_dt, end_dt)
    for that exam date using the first matching meeting block.
    """
    # Simple match: course_name contains item_course or vice versa (fallback if None)
    ok = (schedule.course_name and item_course and
          (item_course.lower() in schedule.course_name.lower()
           or schedule.course_name.lower() in item_course.lower()))
    # choose first meeting if course name check is inconclusive
    if schedule.meetings:
        m = schedule.meetings[0]
        return f"{exam_ymd}T{m.start_24h}:00", f"{exam_ymd}T{m.end_24h}:00"
    return None, None
