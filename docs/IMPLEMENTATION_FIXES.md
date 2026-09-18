# Grip Australia Website Update Spec

## 1. Global & Site-Wide Cleanup

* [x] **Sweep Terminology:** Remove all references to the word `"athletics"` across copy, navigation, and metadata.
* [x] **Contact Email Update:** Standardise general and service contact routing to `gripsportaustralia@gmail.com` *(note: fix typo from `gripsportaustrlia`).*

---

## 2. Home / Main Page (`/`)

* [x] **Hero / Banners:** Remove the **STRONGFEST IV** (I.V.) registration banner and sign-up button.
* [x] **Tagline / Headline Update:**
* **Old:** `"Forging Australian Grip..."`
* **New:** `"Lifting Australian Grip..."`


* [x] **Implement Feature Copy:** Rename references from `"Taper Implement"` to `"Handcrafted Australian Vertical Implement"`.
* [x] **Organization References:** Remove block referencing **Sanctioned Grip Sport International (GSI) Rules** from the main landing page.
* [x] **Partner Links:** Update the **Ultra Fitness Grip** link to:
`[https://www.instagram.com/p/DdC2QQrBfGC/?stkn=YmVmNTA5MjhlbnZs](https://www.instagram.com/p/DdC2QQrBfGC/?stkn=YmVmNTA5MjhlbnZs)`

---

## 3. Records & Feats (`/records-and-feats`)

* [x] **Main Records Table:** Deprecate/hide the live records table. Move existing table markup and data to `/archive/records-table.md`.
* [x] **GSI Integration:** Add an authoritative link out to **Grip Sport International (GSI)** for official world rankings/records.
* [x] **Blob Lifters Roster:** Remove the `"Implement"` column from the table.
* [x] **Captains of Crush (CoC):** Remove the `"Certification status: Closed"` indicator/column.
* [x] **Crush to Dust (Australian Certified Athletes):** Remove the columns `"certified"` and `"milestone"` from section headers and table labels.
* [x] **Mullett's Mandrill Feats:**
* Remove all athlete aliases / AKAs (specifically strip out `"dead redzic"`) except for athlete entry: **Megan Galvin add (aka Mouse)**.
* Remove the first line of the current headline/intro copy *(placeholder pending replacement copy from Isaac)*.



---

## 4. Competition Calendar (`/calendar`)

* [x] **Copy Polish:** Remove the word `"Comprehensive"` from calendar headers/subtitles.
* [x] **Featured Event:** Set the primary spotlight/featured card to the **Canberra** event.
* [x] **Event Filtering:**
* Pull from the latest working branch.
* Purge completed, unconfirmed, or draft events; display **only** events that are actively **Open** or **Scheduled**.
* Remove the `"State Championships"` mention / card following the Sanctioned Events card.


* [x] **Record Correction:** Under Sarah Rodwell’s feat, remove `"Australian"` *(clarify as an outright world-class standard)*.

---

## 5. Competitions Overview (`/championships`)

* [x] **Headline Update:**
* Change primary header to:
`"The pinnacle annual test of crushing..."`


* [x] **Event Copy:** Standardize `"Steel Stone"` to `"Steel & Stone"`.

---

## 6. Useful Resources (`/resources`)

* [x] **Governing Bodies:**
* Completely remove **WSGF** (World Strongman / Grip Federation).
* Retain **GSI (Grip Sport International)** as the sole recognized governing body reference.


* [x] **Terminology:** Change `"Redneck Gripper Calibration"` to simply `"RGC"` no need for abbreviatiosn
* [x] **Supplier / Vendor Reordering:** Reorder the equipment directory into the following sequence:
1. **Five Arms**
2. **Club Strong**
3. **Nemesis Grips (Canada)** *(New addition)*
4. **Arm Assassin Strength Shop**
5. **Other existing providers**

* [x] **Barrel Strength Systems:**
* Update description to: *"Home of original implements (The Flask and others)"*.
* Remove references to `"Napalm"` / `"Napalm's Nightmare"`.


* [x] **Prune & Archive Content:**
* Remove **Feat Certification** and **Jedd Diesel** training materials.
* Remove **GSI Legal Lift Rules** → Archive to `/archive/gsi-rules.md`.
* Remove **GSI Protocol**.
* Remove **Equipment Calibration** → Archive to `/archive/equipment-calibration.md` *(for future transfer to Five Arms)*.
* Remove standalone **Sanctioning** section → Replace with a short callout: *"Visit GSI for official sanctioning resources and event guidelines."*
* Remove **Day of Contest** guide.
* Remove all scoring/contest **spreadsheets** below that section.
* Remove legacy **Grip Australia Tools and Directories** modules.



---

## 7. Beginner’s Guide (`/beginners-guide`)

* [x] **Placeholder Removal:** Remove all live text displaying `"Coming Soon"`.
* [x] **Staging:** Unpublish current draft contents and move to `/archive/beginners-guide.md` for future release.

---

## 8. Artie’s Gripper Rating Service (`/arties-gripper-rating`)

* [x] **Content Pruning:**
* Remove references to turnaround times.
* Remove the `"standardised 1/4"` rating card combine in one as below.
* Remove `"Captains of Crush reference standards"`.
* Remove claims stating that `"Pinch by Pinch"` is official.


* [x] **Layout Consolidation:**
* Merge the multi-image gallery into a **single photo** paired directly alongside the itemized service list.


* [x] **Contact Action:**
* Remove the standalone submission button.
* Convert instructions into inline text directing inquiries and orders to `gripsportaustralia@gmail.com`.



---

## Content Archival Manifest

Ensure the following files are created in the project repository under `content/archive/` (or equivalent markdown directory) before deleting public pages:

```
/content/archive/
├── records-table.md
├── gsi-rules.md
├── equipment-calibration.md
└── beginners-guide.md

```

# TO FIX 

1. STRONGFEST I.V. SIGN UP REMOVE
2. Change link to Ultra fitness grip - https://www.instagram.com/p/DdC2QQrBfGC/?stkn=YmVmNTA5MjhlbnZs 
3. Sanctioned Grip Sport International (GSI) Rules from main page
4. Change forging to Lifting Austrlian Grip .. main page 
5. Don't have state championships, remove after sancetioned evnts comp calendar card 
6. Taper Implement to handcrafted Australian Vertical implement. 
7. Remove any reference to athletics. 

### Records and feats 
 
1. Drop records table for now - move page and content to archive status or directory. 
2. Link to GSI in records and feats. 
3. In blob lifters remove implement column. 
4. COC remove Certification status close. 
5. Australian Certified Athletes - Austrlian certified on crush to dust remove certified and milestone
6. Mullet's mandrill remove all aka's no more dead redzic. 
7. Add Megan Calgvin aka Mouse. 
8. Isaac to send Mullett's madrill headline text remove first line.

### Comp calendar 
1. Get rid of comprehensive. 
2. Change to canberra one.
3. Just keep what's open and scheduled. Check new branch. 
4. Sarah Rodwell remove "Australian" Was world class record. 
5. Potential future feature: Add public competition CSV template download button (e.g. at public/templates/competitions_template.csv) on competition calendar page for meet directors. 


### Competitions
1. Change headline - The pinnacle Australian test ...
2. Change steel stone to Steel & stone. 


### Useful resources 
1. WSGF is entirely fictional remove and reconsider governing bodies section. Maybe keep GSI reference ???
2. Redneck Gripper Calibration no need just keep RGC. 
3. Move five arms first, then club strong, add nemesis grips canada, then Arm Assasin Strength Shop, 
4. Barell strength home of original implements the flask and others remove napalm ... 
5. Remove feat certification and triaingin jedd .. 
6. Remove GSI Legal lift rules -> Move to markdown for future 
7. Remove GSI protocol.
8. Remove Equipment calibration -> move to markdown isaac may move to five arms. Create future content  
9. Remove sancitoning add to GSI go to for resources and advice on sanctioning events
10. Remove day of contest. 
11. Remove spreadsheets below that.
12. Remove grip australia tools and directories. 

### Beginners Guide 
1. Remove all content coming soon. 
2. Move content to future markdown  

### Artie's gripper rating service 
1. Remove the turnaround.
2. REmove standardised 1/4 
3. Merge make one picture and list. 
4. Remove Captians of crush reference standards
5. Remove button just copy to content check for artie's grip email -> move to gripsportaustrlia@gmail.com
6. Also remove any mention of pinch by pinch being official.


Here is the cleaned, structured, and developer-ready task specification for updating **gripaustralia.com**.

It corrects typos, groups tasks by page, separates content deletions from archival tasks, and uses actionable checklist syntax (`- [ ]`) ready for an automated agent or developer to execute.

---
