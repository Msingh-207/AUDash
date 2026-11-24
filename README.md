# AUDash 

*Because why not?*

A web app designed for **Dr. B.R. Ambedkar University Delhi (AUD)** students to easily view, search, and manage academic timetables and class schedules in real time.

---

## Getting Started

You need **Python 3** (for the API) and **Node.js 20+** (for the React frontend).

```bash
# clone the repository
git clone https://github.com/Msingh-207/AUDash.git
cd AUDash

# install requirements
python -m pip install -r requirements.txt
npm install

# terminal 1: run the API server on http://localhost:8000
python api/main.py

# terminal 2: run the React dev server on http://localhost:5173
npm run dev
```

The Vite dev server forwards `/api/*` requests to the Flask server.

## Project layout

- `src/` — React frontend (Vite)
- `public/images/` — icons and static assets
- `api/main.py` — Flask API, deployed as a Vercel Python function
- `subjectsList.json`, `timeTable.json` — timetable data

`npm run build` outputs the production site to `dist/`.
