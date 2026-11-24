# AUDash

AUDash is a timetable app for students at **Dr. B.R. Ambedkar University Delhi (AUD)**. Pick your semester and subjects once, and it shows your classes for each day, with times and rooms.

## Features

- **Your own timetable:** choose your semester and the subjects you take, and see only those classes.
- **Day by day:** opens on today. Use the ← → arrow keys or swipe on your phone to change days.
- **Shows the current class:** the class happening right now is highlighted.
- **Remembers your choices:** your semester, subjects and last timetable are saved in your browser, so the page loads straight to your schedule next time.
- **Light and dark themes.**
- **Works on phones.**

## Running it locally

You need **Node.js 20+** for the website and **Python 3** for the API.

```bash
# Clone the repository
git clone https://github.com/Msingh-207/AUDash.git
cd AUDash

# Install dependencies
npm install
python -m pip install -r requirements.txt

# Terminal 1: start the API on http://localhost:8000
python api/main.py

# Terminal 2: start the website on http://localhost:5173
npm run dev
```

During development, the website forwards `/api/*` requests to the API on port 8000.

To try it on your phone, run `npm run dev -- --host` and open the Network address it prints, with your phone on the same Wi-Fi.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server with live reload |
| `npm run build` | Builds the production site into `dist/` |
| `npm run preview` | Serves the production build locally |

## How it's built

- **Frontend:** React 19 and Vite, with icons from [Lucide](https://lucide.dev/) and the Montserrat font.
- **API:** a small Flask app in `api/main.py` with two endpoints:
  - `POST /api/subjects` with `{ "semester": 1 }` returns the subjects for that semester.
  - `POST /api/timetable` with `{ "subjects": [...] }` returns the classes for those subjects.
- **Hosting:** Vercel. The site is built with Vite, and `/api/*` runs `api/main.py` as a Python function (see `vercel.json`).

## Project layout

```
AUDash/
├── api/main.py          Flask API
├── src/
│   ├── App.jsx          Main page: semester, subjects, day view
│   ├── components/      Navbar, Footer, SubjectPicker, Schedule, PillRail
│   ├── api.js           Calls to the API
│   ├── storage.js       Saves choices in the browser
│   ├── lib/time.js      Parses class times like "9-11" or "1.30-3.30"
│   └── index.css        Styles and light/dark theme
├── public/              Favicon, images, fonts, sitemap
├── subjectsList.json    Subjects for each semester
├── timeTable.json       Every class: day, subject, course code, time, room
├── index.html
├── vite.config.js
└── vercel.json
```

## Updating the timetable

All timetable data is in two JSON files in the project root.

`subjectsList.json` lists the subjects for each semester:

```json
{ "subjectCode": "AEC2 - NSUS1AE001", "subjectName": "English for Academic Purposes", "semester": 1 }
```

`timeTable.json` lists every class:

```json
{ "day": "Monday", "subject": "Introduction to Research Methods", "courseCode": "EN216", "time": "9-11", "room": "305" }
```

Times use a 12-hour clock without AM/PM (`"9-11"`, `"1.30-3.30"`). Any hour below 8 is read as afternoon.

## Credits

- The design is based on **[JIITPlanner](https://planner.codelif.in/)**. Thanks to its creators for the inspiration.
- Made by **Moksh Singh** (B.A. Economics, 2nd year). Follow [@van1sh.me](https://www.instagram.com/van1sh.me) on Instagram for timetable updates.
- Montserrat font is used under the SIL Open Font License (see `public/fonts/OFL.txt`).
