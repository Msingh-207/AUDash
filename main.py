import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

with open('subjectsList.json', 'r') as f:
    subject_list = json.load(f)

with open('timeTable.json', 'r') as f:
    timetable_data = json.load(f)

@app.route('/')
def index():
    return send_from_directory('frontend', 'index.html')

@app.route('/subjects', methods=['POST'])
def get_subjects():
    try:
        data = request.get_json()
        semester_id = data.get('semester')
        filtered_subjects = [sub for sub in subject_list if sub.get('semester') == semester_id]
        return jsonify(filtered_subjects)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/timetable', methods=['POST'])
def get_timetable():
    try:
        data = request.get_json()
        selected_subjects = data.get('subjects', [])
        print("Frontend sent these full subject names:", selected_subjects)
        
        # Lowercase and clean up incoming selection names
        cleaned_selections = [str(s).strip().lower() for s in selected_subjects if s]
        
        filtered_timetable = []
        for entry in timetable_data:
            s_title = str(entry.get('subject', '')).strip().lower()
            c_code = str(entry.get('courseCode', '')).strip().lower()
            
            is_match = False
            for selection in cleaned_selections:
                if selection in s_title or selection in c_code:
                    is_match = True
                    break
            
            if is_match:
                filtered_timetable.append(entry)
        
        print(f"Found {len(filtered_timetable)} total matches for all selections.")
        return jsonify(filtered_timetable)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)