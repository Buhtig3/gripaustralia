#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "openpyxl",
# ]
# ///
"""
Grip Sport International (GSI) Results Pipeline Automation
===========================================================
Automates:
1. Creating an Enhanced GSI Results Template (create-template) with:
   - Official GSI Contest Results scorecard sheet with Excel data validation (dropdowns)
   - Live Standings & Scoring sheet with automated 100-pt Grip Sport percentage formulas
   - Athletes Directory sheet compiled from national records and championship results
   - Implements & Records reference sheet covering all 50 Australian tracked events
   - Meet Day Guide & Rules sheet with scale calibration, seasoning, and 24-hr reporting
2. Exporting competition results from src/data/results.json into the official
   GSIResultsTemplate.xlsx for official GSI submission.
3. Importing completed GSIResultsTemplate.xlsx scorecards into src/data/results.json.
4. Validating GSIResultsTemplate.xlsx spreadsheets against GSI criteria.

Official GSI Submission Targets:
- Eric Roussin (eroussin@rogers.com)
- Jedd Johnson (jedd.diesel@gmail.com)
- Standard Template: https://gripsportint.com/PDF/GSIResultsTemplate.xlsx
- GSI Resources: https://gripsportint.com/resources
"""

import argparse
import copy
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

# Set console output encoding to utf-8 if possible
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_TEMPLATE_PATH = REPO_ROOT / "docs" / "gsi-docs" / "GSIResultsTemplate.xlsx"
RESULTS_JSON_PATH = REPO_ROOT / "src" / "data" / "results.json"
RECORDS_JSON_PATH = REPO_ROOT / "src" / "data" / "records.json"


def load_results_json(filepath: Path = RESULTS_JSON_PATH) -> dict:
    if not filepath.exists():
        return {}
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def save_results_json(data: dict, filepath: Path = RESULTS_JSON_PATH):
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")


def load_records_json(filepath: Path = RECORDS_JSON_PATH) -> list[dict]:
    if not filepath.exists():
        return []
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def parse_location(venue_str: str) -> tuple[str, str, str]:
    """Extracts (city, state, country) from a venue string like 'Iron Revolution Gym, Melbourne, VIC'."""
    city, state, country = "", "", "Australia"
    if not venue_str:
        return city, state, country
    
    parts = [p.strip() for p in venue_str.split(",")]
    aus_states = {"VIC", "NSW", "QLD", "WA", "SA", "TAS", "ACT", "NT"}
    for p in parts:
        words = p.upper().split()
        for w in words:
            if w in aus_states:
                state = w
                break
    
    if len(parts) >= 2:
        if state and parts[-1].upper() == state:
            city = parts[-2]
        elif len(parts) == 2 and not state:
            city = parts[0]
            state = parts[1]
        else:
            city = parts[-2] if len(parts) > 2 else parts[0]
    elif len(parts) == 1:
        city = parts[0]
        
    return city, state, country


def extract_unique_athletes(records: list[dict], results: dict) -> list[dict]:
    """Extracts unified unique athletes list across both records.json and results.json."""
    athletes_dict = {}

    # 1. From records.json
    for r in records:
        holder = r.get("holder")
        if not holder:
            continue
        name = holder.strip()
        if name not in athletes_dict:
            gender_raw = r.get("gender", "men")
            gender = "Women" if "women" in str(gender_raw).lower() else "Men"
            athletes_dict[name] = {
                "name": name,
                "gender": gender,
                "weightClasses": set(),
                "athleteId": r.get("athleteId", ""),
                "gsiUrl": r.get("gsiAthleteUrl", ""),
                "recordsHeld": [],
                "contests": set(),
                "country": "Australia"
            }
        entry = athletes_dict[name]
        if r.get("weightClass"):
            entry["weightClasses"].add(r["weightClass"])
        if not entry["athleteId"] and r.get("athleteId"):
            entry["athleteId"] = str(r["athleteId"])
        if not entry["gsiUrl"] and r.get("gsiAthleteUrl"):
            entry["gsiUrl"] = r["gsiAthleteUrl"]
        if r.get("event"):
            rec_desc = f"{r['event']} ({r.get('weightKg', '')} {r.get('unit', 'kg')})"
            entry["recordsHeld"].append(rec_desc)
        if r.get("contest"):
            entry["contests"].add(r["contest"])

    # 2. From results.json
    for year_str, contest in results.items():
        c_title = contest.get("title", f"AGSC {year_str}")
        for a in contest.get("athletes", []):
            name = a.get("athlete", "").strip()
            if not name:
                continue
            if name not in athletes_dict:
                gender_raw = a.get("gender", "Men")
                gender = "Women" if "women" in str(gender_raw).lower() or gender_raw == "F" else "Men"
                athletes_dict[name] = {
                    "name": name,
                    "gender": gender,
                    "weightClasses": set(),
                    "athleteId": str(a.get("athleteId", "")),
                    "gsiUrl": f"https://www.gripsport.org/athlete/{a.get('athleteId')}" if a.get("athleteId") else "",
                    "recordsHeld": [],
                    "contests": set(),
                    "country": "Australia"
                }
            entry = athletes_dict[name]
            if a.get("weightClass"):
                entry["weightClasses"].add(a["weightClass"])
            if not entry["athleteId"] and a.get("athleteId"):
                entry["athleteId"] = str(a["athleteId"])
                entry["gsiUrl"] = f"https://www.gripsport.org/athlete/{a.get('athleteId')}"
            entry["contests"].add(c_title)

    sorted_athletes = []
    for name in sorted(athletes_dict.keys()):
        item = athletes_dict[name]
        sorted_athletes.append({
            "name": name,
            "gender": item["gender"],
            "primaryWeightClass": ", ".join(sorted(item["weightClasses"])) if item["weightClasses"] else "Open",
            "athleteId": item["athleteId"] or "N/A",
            "gsiUrl": item["gsiUrl"] or "N/A",
            "recordsCount": len(item["recordsHeld"]),
            "recordsList": "; ".join(item["recordsHeld"][:3]) if item["recordsHeld"] else "None",
            "contests": ", ".join(sorted(item["contests"])) if item["contests"] else "None",
            "country": item["country"]
        })
    return sorted_athletes


def extract_unique_implements(records: list[dict], results: dict) -> list[dict]:
    """Extracts unified unique events and implements across records.json and results.json."""
    implements_dict = {}

    cat_display = {
        "thick-bar": "Thick-Bar / Revolving Deadlift",
        "pinch": "Pinch Grip (Block / Saxon)",
        "crush": "Hand Grippers / Crushing",
        "vertical-lift": "Vertical Bar / Lift",
        "endurance": "Hold For Time / Endurance",
        "historical-feat": "Historical Benchmark / Feat"
    }

    apparatus_notes = {
        "Axle": "IronMind Apollon's Axle (1.9\"-2.0\" non-rotating bar). Double-overhand pronated grip only. No hook grip, no hitching.",
        "Napalm's Nightmare": "Barrel Strength Systems 2.375\" rolling handles or 3\" pinch blocks on Olympic loading pin.",
        "Saxon Bar": "3\"x4\" or 3\"x3\" rectangular structural steel tube. Double-overhand pinch only. No under-hooking.",
        "Rolling Thunder": "IronMind Rolling Thunder 2.375\" revolving deadlift handle. Free spinning, 1-hand pull to 6\" height.",
        "Silver Bullet": "IronMind Captains of Crush gripper with 2.5 kg Silver Bullet hanging clamp held for maximal time.",
        "Two Hands Pinch": "Euro Pinch apparatus or standardized 2\" parallel plates. Overhand pinch only, no resting on thighs.",
        "Hub": "IronMind Hub (2.875\" circular raised hub). Distal fingertip pads only, no palm contact ('heel foul').",
        "Little Big Horn": "IronMind Little Big Horn conical thick grip implement, 1-hand vertical lift.",
        "Vertical Bar": "FBBC 2\" or 1\" solid vertical bar with Olympic loading pin, 1-hand vertical pull.",
        "Mandrel": "Mullett's Mandrel calibrated multi-diameter Australian benchmark implement.",
        "Stub": "Standard 1\" or 2\" solid stub pinch block."
    }

    # 1. From records.json
    for r in records:
        ev = r.get("event")
        if not ev:
            continue
        ev_name = ev.strip()
        if ev_name not in implements_dict:
            cat = r.get("category", "thick-bar")
            spec = ""
            for k, v in apparatus_notes.items():
                if k.lower() in ev_name.lower():
                    spec = v
                    break
            if not spec:
                spec = "Standardized GSI contest implement. Lifted to full lockout under audible 'DOWN' referee command."

            implements_dict[ev_name] = {
                "name": ev_name,
                "category": cat_display.get(cat, cat.title()),
                "topRecord": f"{r.get('weightKg')} {r.get('unit', 'kg')}",
                "recordHolder": r.get("holder", "N/A"),
                "recordDate": r.get("date", "N/A"),
                "recordLocation": r.get("location", "Australia"),
                "spec": spec,
                "seasoning": "Dry powdered chalk and plain water/ambient humidity only. Zero chemicals, salt, vinegar, or wire grinding.",
                "sanctioned": "GSI Sanctioned" if r.get("sanctioned", True) else "Open"
            }
        else:
            current_top = implements_dict[ev_name].get("topRecord", "")
            try:
                cur_wt = float(current_top.split()[0])
                new_wt = float(r.get("weightKg", 0))
                if new_wt > cur_wt:
                    implements_dict[ev_name]["topRecord"] = f"{r.get('weightKg')} {r.get('unit', 'kg')}"
                    implements_dict[ev_name]["recordHolder"] = r.get("holder", "N/A")
                    implements_dict[ev_name]["recordDate"] = r.get("date", "N/A")
            except Exception:
                pass

    # 2. From results.json
    for c in results.values():
        for ev in c.get("eventNames", []):
            ev_name = ev.strip()
            if not ev_name:
                continue
            if ev_name not in implements_dict:
                spec = ""
                for k, v in apparatus_notes.items():
                    if k.lower() in ev_name.lower():
                        spec = v
                        break
                if not spec:
                    spec = "Standardized GSI contest implement. Lifted to full lockout under audible 'DOWN' referee command."

                implements_dict[ev_name] = {
                    "name": ev_name,
                    "category": "Contest Event",
                    "topRecord": "Contest Scored",
                    "recordHolder": "N/A",
                    "recordDate": c.get("date", "N/A"),
                    "recordLocation": c.get("venue", "Australia"),
                    "spec": spec,
                    "seasoning": "Dry powdered chalk and plain water/ambient humidity only. Zero chemicals, salt, vinegar, or wire grinding.",
                    "sanctioned": "GSI Sanctioned"
                }

    return [implements_dict[k] for k in sorted(implements_dict.keys())]


def create_enhanced_template(
    output_path: Path,
    contest_name: str = "",
    date_str: str = "",
    city: str = "",
    state: str = "",
    country: str = "Australia",
    events: list[str] | None = None,
    prefill_athletes: bool = False,
    records_path: Path = RECORDS_JSON_PATH,
    results_path: Path = RESULTS_JSON_PATH
) -> Path:
    """Creates a feature-rich, multi-sheet GSI competition template with athletes and implements."""
    records = load_records_json(records_path)
    results = load_results_json(results_path)

    unique_athletes = extract_unique_athletes(records, results)
    unique_implements = extract_unique_implements(records, results)

    wb = openpyxl.Workbook()
    # Remove default sheet
    wb.remove(wb.active)

    # Styles
    navy_header_fill = PatternFill(start_color="1A2B4C", end_color="1A2B4C", fill_type="solid")
    gold_header_fill = PatternFill(start_color="C59B27", end_color="C59B27", fill_type="solid")
    gray_sub_fill = PatternFill(start_color="E9ECEF", end_color="E9ECEF", fill_type="solid")
    zebra_fill = PatternFill(start_color="F8F9FA", end_color="F8F9FA", fill_type="solid")
    white_bold_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    navy_bold_font = Font(name="Calibri", size=11, bold=True, color="1A2B4C")
    bold_font = Font(name="Calibri", size=11, bold=True)
    normal_font = Font(name="Calibri", size=11)
    title_font = Font(name="Calibri", size=13, bold=True, color="1A2B4C")
    sub_title_font = Font(name="Calibri", size=11, bold=True, color="C59B27")

    thin_border_side = Side(style="thin", color="D1D5DB")
    cell_border = Border(left=thin_border_side, right=thin_border_side, top=thin_border_side, bottom=thin_border_side)
    thick_bottom = Border(bottom=Side(style="medium", color="1A2B4C"))

    # ==========================================
    # SHEET 1: Contest Results (Official GSI Schema)
    # ==========================================
    ws_results = wb.create_sheet(title="Contest Results")

    # Contest Details block
    ws_results["A1"] = "Contest Details"
    ws_results["A1"].font = title_font
    ws_results["F1"] = "Event Details"
    ws_results["F1"].font = title_font

    labels = [
        ("A2", "Name:", "B2", contest_name),
        ("A3", "Date:", "B3", date_str),
        ("A4", "City:", "B4", city),
        ("A5", "State:", "B5", state),
        ("A6", "Country:", "B6", country)
    ]
    for cell_l, label, cell_v, default_v in labels:
        ws_results[cell_l] = label
        ws_results[cell_l].font = bold_font
        ws_results[cell_v] = default_v
        ws_results[cell_v].font = normal_font

    # Event Details block
    event_list = events or []
    for idx in range(1, 6):
        r = idx + 1
        ws_results[f"F{r}"] = f"Event {idx} Name:"
        ws_results[f"F{r}"].font = bold_font
        if idx <= len(event_list):
            ws_results[f"G{r}"] = event_list[idx - 1]
        ws_results[f"G{r}"].font = normal_font

    # Competitor Table Header (Row 8)
    headers = [
        "Competitor Name",
        "Bodyweight \n(kg/lbs)",
        "Weight Class \n(kg)",
        "Gender \n(M/F)",
        "Age",
        "Country of Residence",
        "Venue \n(if a multi-venue contest)",
        "Email Address \n(for GSI Newsletter)",
        "Event 1 Result",
        "Event 2 Result",
        "Event 3 Result",
        "Event 4 Result",
        "Event 5 Result"
    ]
    ws_results.row_dimensions[8].height = 32
    for col_idx, h_text in enumerate(headers, start=1):
        cell = ws_results.cell(row=8, column=col_idx, value=h_text)
        cell.fill = navy_header_fill
        cell.font = white_bold_font
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = cell_border

    # Pre-fill Athletes or create clean formatted rows (Rows 9 to 58)
    max_rows = 50
    if prefill_athletes:
        for idx, ath in enumerate(unique_athletes[:max_rows], start=9):
            ws_results.cell(row=idx, column=1, value=ath["name"])
            ws_results.cell(row=idx, column=3, value=ath["primaryWeightClass"].split(",")[0].strip())
            ws_results.cell(row=idx, column=4, value="M" if ath["gender"] == "Men" else "F")
            ws_results.cell(row=idx, column=6, value=country)
            for c in range(1, 14):
                ws_results.cell(row=idx, column=c).border = cell_border
                ws_results.cell(row=idx, column=c).font = normal_font
    else:
        for r_idx in range(9, 9 + max_rows):
            for c_idx in range(1, 14):
                cell = ws_results.cell(row=r_idx, column=c_idx)
                cell.border = cell_border
                cell.font = normal_font

    # Excel Data Validations
    # 1. Gender Dropdown (M/F)
    dv_gender = DataValidation(type="list", formula1='"M,F"', allow_blank=True)
    ws_results.add_data_validation(dv_gender)
    dv_gender.add(f"D9:D{8 + max_rows}")

    # 2. Weight Class Dropdown
    weight_classes_str = '"Mens 59k,Mens 66k,Mens 74k,Mens 83k,Mens 93k,Mens 105k,Mens 120k,Mens 120k+,Womens 47k,Womens 52k,Womens 57k,Womens 63k,Womens 72k,Womens 84k,Womens 100k,Womens 100k+,Masters 40+,Masters 50+,Masters 60+,Open"'
    dv_weight = DataValidation(type="list", formula1=weight_classes_str, allow_blank=True)
    ws_results.add_data_validation(dv_weight)
    dv_weight.add(f"C9:C{8 + max_rows}")

    # 3. Event Names Dropdown in G2..G6 referencing Implements sheet
    dv_events = DataValidation(type="list", formula1="=Implements!$A$2:$A$70", allow_blank=True)
    ws_results.add_data_validation(dv_events)
    dv_events.add("G2:G6")

    # ==========================================
    # SHEET 2: Live Standings & Scoring (Automated Formulas)
    # ==========================================
    ws_scoring = wb.create_sheet(title="Live Standings")

    ws_scoring["A1"] = "Live Grip Sport Scoring & Standings"
    ws_scoring["A1"].font = title_font
    ws_scoring["A2"] = "Automatically computes Grip Sport 100-Point Percentage Scores from 'Contest Results'. Leader receives 100 pts per event."
    ws_scoring["A2"].font = Font(name="Calibri", size=10, italic=True, color="6B7280")

    scoring_headers = [
        "Rank",
        "Competitor Name",
        "Gender",
        "Event 1 Pts",
        "Event 2 Pts",
        "Event 3 Pts",
        "Event 4 Pts",
        "Event 5 Pts",
        "Total Points"
    ]
    ws_scoring.row_dimensions[4].height = 26
    for col_idx, h_text in enumerate(scoring_headers, start=1):
        cell = ws_scoring.cell(row=4, column=col_idx, value=h_text)
        cell.fill = gold_header_fill
        cell.font = navy_bold_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = cell_border

    # Formula generation for rows 5 to 54
    end_row = 8 + max_rows
    for idx in range(5, 5 + max_rows):
        res_r = idx + 4  # corresponds to row 9 in Contest Results
        # Athlete Name
        ws_scoring.cell(row=idx, column=2, value=f"=IF('Contest Results'!A{res_r}=\"\",\"\",'Contest Results'!A{res_r})")
        # Gender
        ws_scoring.cell(row=idx, column=3, value=f"=IF('Contest Results'!D{res_r}=\"\",\"\",'Contest Results'!D{res_r})")
        
        # Event 1..5 Pts
        # Formula: =IF(OR(B5="", MAX('Contest Results'!$I$9:$I$58)<=0), 0, ('Contest Results'!I9 / MAX('Contest Results'!$I$9:$I$58)) * 100)
        event_cols = ["I", "J", "K", "L", "M"]
        for ev_idx, col_letter in enumerate(event_cols, start=4):
            f_str = f"=IF(OR(B{idx}=\"\", MAX('Contest Results'!${col_letter}$9:${col_letter}${end_row})<=0), 0, ('Contest Results'!{col_letter}{res_r} / MAX('Contest Results'!${col_letter}$9:${col_letter}${end_row})) * 100)"
            sc_cell = ws_scoring.cell(row=idx, column=ev_idx, value=f_str)
            sc_cell.number_format = "0.00"

        # Total Points
        tot_cell = ws_scoring.cell(row=idx, column=9, value=f"=IF(B{idx}=\"\",\"\",SUM(D{idx}:H{idx}))")
        tot_cell.number_format = "0.00"
        tot_cell.font = bold_font

        # Rank
        ws_scoring.cell(row=idx, column=1, value=f"=IF(B{idx}=\"\",\"\",RANK(I{idx},$I$5:$I${4 + max_rows}))")

        for c_idx in range(1, 10):
            ws_scoring.cell(row=idx, column=c_idx).border = cell_border

    # ==========================================
    # SHEET 3: Athletes Directory
    # ==========================================
    ws_athletes = wb.create_sheet(title="Athletes")

    ws_athletes["A1"] = "Australian Grip Athletes Directory (Source: records.json & results.json)"
    ws_athletes["A1"].font = title_font

    ath_headers = [
        "Athlete Name",
        "Gender",
        "Primary Weight Class",
        "GSI Athlete ID",
        "GSI Profile URL",
        "National Records Held",
        "Key Benchmark Records",
        "Championship History",
        "Country"
    ]
    ws_athletes.row_dimensions[3].height = 26
    for col_idx, h_text in enumerate(ath_headers, start=1):
        cell = ws_athletes.cell(row=3, column=col_idx, value=h_text)
        cell.fill = navy_header_fill
        cell.font = white_bold_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = cell_border

    for idx, ath in enumerate(unique_athletes, start=4):
        ws_athletes.cell(row=idx, column=1, value=ath["name"])
        ws_athletes.cell(row=idx, column=2, value=ath["gender"])
        ws_athletes.cell(row=idx, column=3, value=ath["primaryWeightClass"])
        ws_athletes.cell(row=idx, column=4, value=ath["athleteId"])
        ws_athletes.cell(row=idx, column=5, value=ath["gsiUrl"])
        ws_athletes.cell(row=idx, column=6, value=ath["recordsCount"])
        ws_athletes.cell(row=idx, column=7, value=ath["recordsList"])
        ws_athletes.cell(row=idx, column=8, value=ath["contests"])
        ws_athletes.cell(row=idx, column=9, value=ath["country"])

        fill = zebra_fill if idx % 2 == 0 else None
        for c in range(1, 10):
            c_cell = ws_athletes.cell(row=idx, column=c)
            c_cell.border = cell_border
            c_cell.font = normal_font
            if fill:
                c_cell.fill = fill

    # ==========================================
    # SHEET 4: Implements & Records Reference
    # ==========================================
    ws_impl = wb.create_sheet(title="Implements")

    ws_impl["A1"] = "Australian Tracked Implements & Record Registry"
    ws_impl["A1"].font = title_font

    impl_headers = [
        "Event / Implement Name",
        "Discipline Category",
        "Current Australian Record",
        "Record Holder",
        "Record Date",
        "Location",
        "Official Apparatus Specifications",
        "Seasoning Standards",
        "Sanction Status"
    ]
    ws_impl.row_dimensions[3].height = 26
    for col_idx, h_text in enumerate(impl_headers, start=1):
        cell = ws_impl.cell(row=3, column=col_idx, value=h_text)
        cell.fill = navy_header_fill
        cell.font = white_bold_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = cell_border

    for idx, item in enumerate(unique_implements, start=4):
        ws_impl.cell(row=idx, column=1, value=item["name"])
        ws_impl.cell(row=idx, column=2, value=item["category"])
        ws_impl.cell(row=idx, column=3, value=item["topRecord"])
        ws_impl.cell(row=idx, column=4, value=item["recordHolder"])
        ws_impl.cell(row=idx, column=5, value=item["recordDate"])
        ws_impl.cell(row=idx, column=6, value=item["recordLocation"])
        ws_impl.cell(row=idx, column=7, value=item["spec"])
        ws_impl.cell(row=idx, column=8, value=item["seasoning"])
        ws_impl.cell(row=idx, column=9, value=item["sanctioned"])

        fill = zebra_fill if idx % 2 == 0 else None
        for c in range(1, 10):
            c_cell = ws_impl.cell(row=idx, column=c)
            c_cell.border = cell_border
            c_cell.font = normal_font
            if fill:
                c_cell.fill = fill

    # ==========================================
    # SHEET 5: Meet Day Guide & Checklist
    # ==========================================
    ws_guide = wb.create_sheet(title="Meet Director Guide")
    ws_guide["A1"] = "GSI Meet Director Operational Guide & Checklist"
    ws_guide["A1"].font = title_font
    ws_guide["A2"] = "Standards published on gripsportint.com/resources"
    ws_guide["A2"].font = Font(name="Calibri", size=10, italic=True, color="6B7280")

    checklist_items = [
        ("1. Pre-Contest Sanctioning", "Submit contest notice to Jedd Johnson (jedd.diesel@gmail.com) with Name, Date, Venue, Entry Link, and Event List. Confirm Full (F) vs Partial (P) sanctioning status."),
        ("2. Certified Scale Calibration", "For Full Sanctioning (F), all lifting plates, loading pins, spacers, collars, and implements MUST be weighed on a certified scale. Record exact equipment tare weights."),
        ("3. Implement Seasoning Protocol", "Bare metal implements may only be seasoned using dry powdered chalk and ambient environmental exposure (water/humidity). STRICTLY PROHIBITED: salt, vinegar, muriatic acid, wire brushes, or power grinders. Platform wipes must be DRY towels only (blood safety is the only exception)."),
        ("4. Competitor Weigh-ins", "Record digital bodyweights and assign competitors to official GSI weight classes (Men: 59, 66, 74, 83, 93, 105, 120, 120+; Women: 47, 52, 57, 63, 72, 84, 100, 100+)."),
        ("5. Attempt Flow & Notation", "Standard Rising Bar format (lightest lifter first, bar never descends) with standard 4 attempts per athlete per event. Circle successful attempts on the scorecard; strike through missed lifts."),
        ("6. Referee Down Signal", "Athletes must reach full lockout (hips and knees locked, torso erect) and remain motionless until receiving the audible and visual 'DOWN' signal. Dumping or releasing early is an automatic no-lift."),
        ("7. Dual Scoring Systems", "Use Grip Sport 100-pt percentage scoring (winner receives 100 pts, others get [lift/winner]*100 to reward victory margins) or Strongman rank scoring (1st=1 pt). The 'Live Standings' sheet computes Grip Sport scoring automatically!"),
        ("8. Mandatory 24-Hour Results Submission", "Within 24 hours of contest finish, email this completed spreadsheet to Eric Roussin (eroussin@rogers.com) and Jedd Johnson (jedd.diesel@gmail.com)."),
        ("9. National Archive Integration", "Submit your scorecard to Grip Australia via GitHub issue or by running 'npm run gsi:import' to archive the results and update national rankings at gripaustralia.com.")
    ]

    ws_guide.row_dimensions[4].height = 24
    ws_guide.cell(row=4, column=1, value="Step / Protocol").fill = navy_header_fill
    ws_guide.cell(row=4, column=1).font = white_bold_font
    ws_guide.cell(row=4, column=2, value="Operational Instructions & Requirements").fill = navy_header_fill
    ws_guide.cell(row=4, column=2).font = white_bold_font

    for idx, (step_title, step_desc) in enumerate(checklist_items, start=5):
        cell_t = ws_guide.cell(row=idx, column=1, value=step_title)
        cell_t.font = bold_font
        cell_t.border = cell_border
        cell_t.fill = gray_sub_fill

        cell_d = ws_guide.cell(row=idx, column=2, value=step_desc)
        cell_d.font = normal_font
        cell_d.border = cell_border
        cell_d.alignment = Alignment(wrap_text=True)
        ws_guide.row_dimensions[idx].height = 36

    # ==========================================
    # Auto-adjust column widths for all sheets
    # ==========================================
    for sheet in [ws_results, ws_scoring, ws_athletes, ws_impl, ws_guide]:
        sheet.views.sheetView[0].showGridLines = True
        for col in sheet.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                val = cell.value
                if val:
                    val_str = str(val)
                    if "\n" in val_str:
                        val_str = max(val_str.split("\n"), key=len)
                    if not val_str.startswith("="):
                        max_len = max(max_len, len(val_str))
            sheet.column_dimensions[col_letter].width = max(max_len + 3, 12)

    # Specific manual tweaks
    ws_results.column_dimensions["A"].width = 24
    ws_results.column_dimensions["B"].width = 28
    ws_results.column_dimensions["F"].width = 18
    ws_results.column_dimensions["G"].width = 34
    ws_scoring.column_dimensions["B"].width = 26
    ws_guide.column_dimensions["A"].width = 30
    ws_guide.column_dimensions["B"].width = 90

    output_path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(output_path)
    return output_path


def export_competition_to_template(
    year_or_title: str,
    output_path: Path,
    template_path: Path = DEFAULT_TEMPLATE_PATH,
    results_path: Path = RESULTS_JSON_PATH
) -> Path:
    """Exports a competition from results.json into an official GSIResultsTemplate.xlsx file."""
    if not template_path.exists():
        raise FileNotFoundError(f"GSI Template not found at: {template_path}")
    
    results = load_results_json(results_path)
    contest = None

    if str(year_or_title) in results:
        contest = results[str(year_or_title)]
    else:
        for k, v in results.items():
            if str(v.get("contestId")) == str(year_or_title) or str(year_or_title).lower() in v.get("title", "").lower():
                contest = v
                break

    if not contest:
        available = ", ".join(results.keys())
        raise ValueError(f"Contest '{year_or_title}' not found in {results_path}. Available years: {available}")

    wb = openpyxl.load_workbook(template_path)
    ws = wb["Contest Results"] if "Contest Results" in wb.sheetnames else wb.active

    title = contest.get("title", f"{contest.get('year')} Competition")
    date_str = contest.get("date", "")
    venue_str = contest.get("venue", "")
    city, state, country = parse_location(venue_str)

    ws["B2"] = title
    ws["B3"] = date_str
    ws["B4"] = city
    ws["B5"] = state
    ws["B6"] = country

    event_names = contest.get("eventNames", [])
    for idx, ev in enumerate(event_names[:5], start=1):
        cell_ref = f"G{idx + 1}"
        ws[cell_ref] = ev

    athletes = contest.get("athletes", [])
    for row_idx, athlete in enumerate(athletes, start=9):
        name = athlete.get("athlete", "")
        weight_class = athlete.get("weightClass", "")
        gender_raw = athlete.get("gender", "Men")
        gender = "F" if "women" in gender_raw.lower() or gender_raw == "F" else "M"
        
        ws.cell(row=row_idx, column=1, value=name)
        bodyweight = athlete.get("bodyweight", "")
        ws.cell(row=row_idx, column=2, value=bodyweight)
        ws.cell(row=row_idx, column=3, value=weight_class)
        ws.cell(row=row_idx, column=4, value=gender)
        ws.cell(row=row_idx, column=5, value=athlete.get("age", ""))
        ws.cell(row=row_idx, column=6, value=athlete.get("country", country))
        ws.cell(row=row_idx, column=7, value=athlete.get("venue", venue_str))
        ws.cell(row=row_idx, column=8, value=athlete.get("email", ""))

        events_dict = athlete.get("events", {})
        for ev_idx, ev_name in enumerate(event_names[:5]):
            col_idx = 9 + ev_idx
            ev_data = events_dict.get(ev_name)
            if ev_data:
                if isinstance(ev_data, dict):
                    val = ev_data.get("value")
                    if val is None or val == 0:
                        val = ev_data.get("display", "")
                    else:
                        val = round(val, 2)
                else:
                    val = ev_data
                ws.cell(row=row_idx, column=col_idx, value=val)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(output_path)
    return output_path


def import_template_to_competition(
    file_path: Path,
    target_year: int | None = None,
    results_path: Path = RESULTS_JSON_PATH,
    dry_run: bool = False
) -> dict:
    """Parses a completed GSIResultsTemplate.xlsx file and inserts/updates results.json."""
    if not file_path.exists():
        raise FileNotFoundError(f"Excel file not found: {file_path}")

    wb = openpyxl.load_workbook(file_path, data_only=True)
    ws = wb["Contest Results"] if "Contest Results" in wb.sheetnames else wb.active

    title = str(ws["B2"].value or "").strip()
    date_val = ws["B3"].value
    date_str = str(date_val).strip() if date_val is not None else ""
    city = str(ws["B4"].value or "").strip()
    state = str(ws["B5"].value or "").strip()
    country = str(ws["B6"].value or "").strip()

    year = target_year
    if not year:
        m = re.search(r"\b(20\d{2})\b", f"{title} {date_str}")
        if m:
            year = int(m.group(1))
        else:
            year = datetime.now().year

    venue_parts = [p for p in [city, state, country] if p]
    venue = ", ".join(venue_parts)

    event_names = []
    for r in range(2, 7):
        val = ws[f"G{r}"].value
        if val and str(val).strip():
            event_names.append(str(val).strip())

    athletes = []
    r = 9
    while r <= ws.max_row:
        name_val = ws.cell(row=r, column=1).value
        if name_val is None or not str(name_val).strip():
            r += 1
            if r > 15 and not any(ws.cell(row=sub_r, column=1).value for sub_r in range(r, min(r + 5, ws.max_row + 1))):
                break
            continue

        name = str(name_val).strip()
        bodyweight = ws.cell(row=r, column=2).value
        weight_class = str(ws.cell(row=r, column=3).value or "Open").strip()
        gender_code = str(ws.cell(row=r, column=4).value or "M").strip().upper()
        gender = "Women" if gender_code.startswith("F") or gender_code.startswith("W") else "Men"
        age = ws.cell(row=r, column=5).value
        athlete_country = str(ws.cell(row=r, column=6).value or country).strip()
        athlete_venue = str(ws.cell(row=r, column=7).value or venue).strip()
        email = str(ws.cell(row=r, column=8).value or "").strip()

        events_data = {}
        for ev_idx, ev_name in enumerate(event_names):
            col_idx = 9 + ev_idx
            cell_val = ws.cell(row=r, column=col_idx).value
            if cell_val is not None and str(cell_val).strip() != "":
                try:
                    num_val = float(str(cell_val).replace("kg", "").replace("lbs", "").strip())
                    display_val = f"{num_val:.2f} kg"
                except ValueError:
                    num_val = 0.0
                    display_val = str(cell_val).strip()
                events_data[ev_name] = {
                    "display": display_val,
                    "value": num_val
                }
            else:
                events_data[ev_name] = {
                    "display": "0.00 kg",
                    "value": 0.0
                }

        athletes.append({
            "athlete": name,
            "weightClass": weight_class,
            "gender": gender,
            "bodyweight": bodyweight if bodyweight is not None else "",
            "age": age if age is not None else "",
            "country": athlete_country,
            "venue": athlete_venue,
            "email": email,
            "events": events_data
        })
        r += 1

    # Compute Grip Sport 100-pt percentage scoring to recommend champions
    event_maxes = {}
    for ev in event_names:
        max_v = 0.0
        for a in athletes:
            v = a["events"].get(ev, {}).get("value", 0.0)
            if v > max_v:
                max_v = v
        event_maxes[ev] = max_v

    mens_scores = {}
    womens_scores = {}
    for a in athletes:
        total_pts = 0.0
        for ev, max_v in event_maxes.items():
            val = a["events"].get(ev, {}).get("value", 0.0)
            pts = (val / max_v * 100.0) if max_v > 0 else 0.0
            total_pts += pts
        if a["gender"] == "Women":
            womens_scores[a["athlete"]] = total_pts
        else:
            mens_scores[a["athlete"]] = total_pts

    mens_overall = max(mens_scores.items(), key=lambda x: x[1])[0] if mens_scores else None
    womens_overall = max(womens_scores.items(), key=lambda x: x[1])[0] if womens_scores else None

    existing_all = load_results_json(results_path)
    existing_contest = existing_all.get(str(year), {})

    champions = existing_contest.get("champions", {
        "mensOverall": mens_overall,
        "womensOverall": womens_overall,
        "mensP4P": existing_contest.get("champions", {}).get("mensP4P"),
        "womensP4P": existing_contest.get("champions", {}).get("womensP4P")
    })

    contest_entry = {
        "year": year,
        "contestId": existing_contest.get("contestId"),
        "title": title or existing_contest.get("title", f"{year} Australian Grip Sport Championship"),
        "gsiUrl": existing_contest.get("gsiUrl", f"https://www.gripsport.org/contest/{existing_contest.get('contestId', '')}" if existing_contest.get("contestId") else ""),
        "date": date_str or existing_contest.get("date", ""),
        "venue": venue or existing_contest.get("venue", ""),
        "promoter": existing_contest.get("promoter", "Isaac Pitt"),
        "abbreviation": existing_contest.get("abbreviation", f"AGSC{str(year)[-2:]}"),
        "champions": champions,
        "eventNames": event_names,
        "athleteCount": len(athletes),
        "mensCount": sum(1 for a in athletes if a["gender"] == "Men"),
        "womensCount": sum(1 for a in athletes if a["gender"] == "Women"),
        "athletes": athletes
    }

    if not dry_run:
        existing_all[str(year)] = contest_entry
        save_results_json(existing_all, results_path)

    return contest_entry


def validate_template_file(file_path: Path) -> tuple[bool, list[str]]:
    """Validates that a spreadsheet conforms to GSI Results Template requirements."""
    errors = []
    if not file_path.exists():
        return False, [f"File not found: {file_path}"]

    wb = openpyxl.load_workbook(file_path, data_only=True)
    ws = wb["Contest Results"] if "Contest Results" in wb.sheetnames else wb.active

    title = ws["B2"].value
    if not title:
        errors.append("Cell B2 (Contest Name) is empty.")

    date_val = ws["B3"].value
    if not date_val:
        errors.append("Cell B3 (Contest Date) is empty.")

    city = ws["B4"].value
    if not city:
        errors.append("Cell B4 (City) is empty.")

    events = [ws[f"G{r}"].value for r in range(2, 7) if ws[f"G{r}"].value]
    if not events:
        errors.append("No event names found in G2..G6.")

    athlete_count = 0
    for r in range(9, ws.max_row + 1):
        name = ws.cell(row=r, column=1).value
        if name and str(name).strip():
            athlete_count += 1
            gender = str(ws.cell(row=r, column=4).value or "").strip().upper()
            if gender and not (gender.startswith("M") or gender.startswith("F") or gender.startswith("W")):
                errors.append(f"Row {r} ({name}): Invalid gender code '{gender}'. Expected M or F.")

    if athlete_count == 0:
        errors.append("No competitors found starting at Row 9.")

    return len(errors) == 0, errors


def main():
    parser = argparse.ArgumentParser(
        description="GSI Results Pipeline Automation: Create enhanced templates, export competitions, or import completed scorecards."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Create-Template Subcommand
    create_parser = subparsers.add_parser("create-template", help="Create an enhanced GSI Results Template with Athletes and Implements directories")
    create_parser.add_argument("--output", "-o", default=None, help="Output .xlsx file path (default: dist/GSIResultsTemplate_Enhanced.xlsx)")
    create_parser.add_argument("--contest-name", default="", help="Pre-fill contest name in cell B2")
    create_parser.add_argument("--date", default="", help="Pre-fill contest date in cell B3")
    create_parser.add_argument("--city", default="", help="Pre-fill city in cell B4")
    create_parser.add_argument("--state", default="", help="Pre-fill state in cell B5")
    create_parser.add_argument("--country", default="Australia", help="Pre-fill country in cell B6")
    create_parser.add_argument("--events", nargs="*", default=None, help="Pre-fill event names in G2..G6")
    create_parser.add_argument("--prefill-athletes", action="store_true", help="Pre-populate Australian athlete roster in competitor rows")

    # Export Subcommand
    export_parser = subparsers.add_parser("export", help="Export competition data to GSIResultsTemplate.xlsx")
    export_parser.add_argument("--year", required=True, help="Competition year (e.g. 2026) or contest title keyword")
    export_parser.add_argument("--output", "-o", default=None, help="Output .xlsx file path (default: dist/GSIResults_<year>.xlsx)")
    export_parser.add_argument("--template", default=str(DEFAULT_TEMPLATE_PATH), help="Path to clean GSIResultsTemplate.xlsx")
    export_parser.add_argument("--results-json", default=str(RESULTS_JSON_PATH), help="Path to src/data/results.json")

    # Import Subcommand
    import_parser = subparsers.add_parser("import", help="Import a completed GSIResultsTemplate.xlsx into results.json")
    import_parser.add_argument("--file", "-f", required=True, help="Path to filled GSIResultsTemplate.xlsx")
    import_parser.add_argument("--year", type=int, default=None, help="Force specific contest year (optional)")
    import_parser.add_argument("--results-json", default=str(RESULTS_JSON_PATH), help="Path to src/data/results.json")
    import_parser.add_argument("--dry-run", action="store_true", help="Print extracted data without modifying results.json")

    # Validate Subcommand
    validate_parser = subparsers.add_parser("validate", help="Validate a completed GSIResultsTemplate.xlsx file")
    validate_parser.add_argument("--file", "-f", required=True, help="Path to GSI results spreadsheet")

    args = parser.parse_args()

    if args.command == "create-template":
        out_path = Path(args.output) if args.output else REPO_ROOT / "dist" / "GSIResultsTemplate_Enhanced.xlsx"
        try:
            res_path = create_enhanced_template(
                output_path=out_path,
                contest_name=args.contest_name,
                date_str=args.date,
                city=args.city,
                state=args.state,
                country=args.country,
                events=args.events,
                prefill_athletes=args.prefill_athletes
            )
            print(f"\n✓ Successfully created Enhanced GSI Results Template:")
            print(f"  -> {res_path}")
            print("\nIncluded Multi-Sheet Features:")
            print("  1. 'Contest Results': Official GSI scorecard with dropdown data validation for Gender (M/F), Weight Classes, and Events.")
            print("  2. 'Live Standings': Automated 100-pt Grip Sport percentage scoring formulas calculating live ranks as scores are entered.")
            print("  3. 'Athletes': Comprehensive directory of Australian competitors from records.json and results.json.")
            print("  4. 'Implements': 50 Australian tracked events/implements with current records, holders, and apparatus specifications.")
            print("  5. 'Meet Director Guide': Operational checklist for scale calibration, seasoning, 4 attempts rule, and 24-hr reporting.")
        except Exception as e:
            print(f"\n✗ Failed to create template: {e}", file=sys.stderr)
            sys.exit(1)

    elif args.command == "export":
        year = args.year
        out_path = Path(args.output) if args.output else REPO_ROOT / "dist" / f"GSIResults_{year}.xlsx"
        try:
            res_path = export_competition_to_template(
                year_or_title=year,
                output_path=out_path,
                template_path=Path(args.template),
                results_path=Path(args.results_json)
            )
            print(f"\n✓ Successfully exported '{year}' contest to official GSI template:")
            print(f"  -> {res_path}")
            print("\nNext Steps for Meet Directors:")
            print("  1. Verify competitor details, bodyweights, and attempts.")
            print("  2. Within 24 hours of contest, email this spreadsheet to:")
            print("     - Eric Roussin: eroussin@rogers.com")
            print("     - Jedd Johnson: jedd.diesel@gmail.com")
            print("     - Subject: GSI Contest Results - [Contest Name] - [Date]")
        except Exception as e:
            print(f"\n✗ Export failed: {e}", file=sys.stderr)
            sys.exit(1)

    elif args.command == "import":
        excel_file = Path(args.file)
        try:
            entry = import_template_to_competition(
                file_path=excel_file,
                target_year=args.year,
                results_path=Path(args.results_json),
                dry_run=args.dry_run
            )
            mode_str = "[DRY-RUN] " if args.dry_run else ""
            print(f"\n✓ {mode_str}Successfully processed GSI results for '{entry['title']}' ({entry['year']}):")
            print(f"  - Athletes: {entry['athleteCount']} ({entry['mensCount']} Men, {entry['womensCount']} Women)")
            print(f"  - Events ({len(entry['eventNames'])}): {', '.join(entry['eventNames'])}")
            print(f"  - Overall Men's Champion: {entry['champions']['mensOverall']}")
            print(f"  - Overall Women's Champion: {entry['champions']['womensOverall']}")
            if not args.dry_run:
                print(f"  - Updated: {args.results_json}")
        except Exception as e:
            print(f"\n✗ Import failed: {e}", file=sys.stderr)
            sys.exit(1)

    elif args.command == "validate":
        excel_file = Path(args.file)
        valid, errors = validate_template_file(excel_file)
        if valid:
            print(f"\n✓ Spreadsheet '{excel_file.name}' is fully valid under GSI Results Template criteria.")
        else:
            print(f"\n✗ Validation failed with {len(errors)} issue(s):", file=sys.stderr)
            for err in errors:
                print(f"  - {err}", file=sys.stderr)
            sys.exit(1)


if __name__ == "__main__":
    main()
