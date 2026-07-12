const days = [
    document.getElementById('monday'),
    document.getElementById('tuesday'),
    document.getElementById('wednesday'),
    document.getElementById('thursday'),
    document.getElementById('friday'),
    document.getElementById('saturday')
];

const subjectDropdowns = [
    document.getElementById('subject-1'),
    document.getElementById('subject-2'),
    document.getElementById('subject-3'),
    document.getElementById('subject-4'),
    document.getElementById('subject-5')
];

const generateTimetable = document.getElementById("generateTimetable");
const semesters = [
    document.getElementById('1'),
    document.getElementById('3'),
    document.getElementById('5'),
    document.getElementById('7')
];

let currentSubjectsTimetable = [];

days.forEach(day => {
    day.addEventListener('click', () => {
        const chosenDay = day.textContent.trim();
        filterTimetableByDay(chosenDay);
    });
});

semesters.forEach(semester => {
    semester.addEventListener('click', () => {
        localStorage.setItem('selectedSem', semester.id);
        fetchSubjects(parseInt(semester.id));
    });
});

function saveSubjectsToStorage() {
    const selectedSubjects = [];
    subjectDropdowns.forEach(dropdown => {
        if (dropdown && dropdown.value && dropdown.value !== "") {
            selectedSubjects.push(dropdown.value.trim());
        }
    });
    localStorage.setItem('audSelectedSubjects', JSON.stringify(selectedSubjects));
}

async function generateTimetableFlow() {
    saveSubjectsToStorage();
    const savedSubjects = JSON.parse(localStorage.getItem('audSelectedSubjects'));

    if (!savedSubjects || savedSubjects.length === 0 || savedSubjects.every(val => !val || val === "")) {
        alert("Please select your subjects first!");
        return;
    }

    try {
        const response = await fetch('/api/timetable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subjects: savedSubjects })
        });

        currentSubjectsTimetable = await response.json();
        localStorage.setItem('cachedTimetableData', JSON.stringify(currentSubjectsTimetable));

        filterTimetableByDay('Monday');

    } catch (error) {
        console.error(error);
    }
}

generateTimetable.addEventListener('click', generateTimetableFlow);

function filterTimetableByDay(selectedDay) {
    if (!currentSubjectsTimetable || currentSubjectsTimetable.length === 0) {
        return;
    }

    const dailySchedule = currentSubjectsTimetable.filter(slot => {
        const dayValue = slot.day || slot.dayName;
        return dayValue && dayValue.toLowerCase().trim() === selectedDay.toLowerCase().trim();
    });
    const classesDiv = document.getElementById('classes');
    let outputHTML = '';

    outputHTML += dailySchedule.map(item => `
        <div class="output">
            <div>
            <img src="../frontend/images/book_5_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg" alt="Book Icon"> Subject: ${item.subject} <br>
            </div>
            <div>
            <img src="../frontend/images/sensor_door_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg" alt="Room Icon"> Room: ${item.room} 
            </div>
            <div>
            <img src="../frontend/images/clock_loader_10_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg" alt="Time Icon"> Time: ${item.time} 
            </div>
            <div>
            <img src="../frontend/images/calendar_month_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg" alt="Calendar Icon"> Day: ${item.day}
            </div>
        </div>
    `).join('');
    classesDiv.innerHTML = outputHTML;
    console.log(dailySchedule);
}

async function fetchSubjects(semesterId) {
    try {
        const response = await fetch(`/api/subjects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ semester: semesterId })
        });

        const filteredSem = await response.json();
        const baseSubjectNames = filteredSem.map(sub => sub.subjectName);

        const ttResponse = await fetch(`/api/timetable`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subjects: baseSubjectNames })
        });
        const semesterTimetable = await ttResponse.json();

        const uniqueSectionNames = new Set();
        semesterTimetable.forEach(entry => {
            if (entry.subject) {
                uniqueSectionNames.add(entry.subject.trim());
            }
        });

        const optionsToRender = uniqueSectionNames.size > 0
            ? Array.from(uniqueSectionNames).sort()
            : baseSubjectNames.sort();

        subjectDropdowns.forEach(dropdown => {
            if (dropdown) dropdown.innerHTML = '<option value="">Select Subject</option>';
        });

        optionsToRender.forEach(subjectName => {
            subjectDropdowns.forEach(dropdown => {
                if (dropdown) {
                    const option = document.createElement('option');
                    option.value = subjectName;
                    option.textContent = subjectName;
                    dropdown.appendChild(option);
                }
            });
        });
    } catch (error) {
        console.error(error);
    }
}

async function initAppPersistence() {
    const savedSem = localStorage.getItem('selectedSem');
    const savedSubjects = JSON.parse(localStorage.getItem('audSelectedSubjects'));
    const cachedTimetable = localStorage.getItem('cachedTimetableData');

    if (savedSem) {
        await fetchSubjects(parseInt(savedSem));

        if (savedSubjects && savedSubjects.length > 0) {
            savedSubjects.forEach((subjectName, index) => {
                if (subjectDropdowns[index]) {
                    subjectDropdowns[index].value = subjectName;
                }
            });
        }
    }

    if (cachedTimetable) {
        currentSubjectsTimetable = JSON.parse(cachedTimetable);
        filterTimetableByDay('Monday');
    }
}

document.addEventListener('DOMContentLoaded', initAppPersistence);

// merged it 