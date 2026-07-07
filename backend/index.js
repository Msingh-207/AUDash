// DOM Element Selectors
const subjectDropdowns = [
    document.getElementById('subject-1'),
    document.getElementById('subject-2'),
    document.getElementById('subject-3'),
    document.getElementById('subject-4'),
    document.getElementById('subject-5')
];
const generateTimetableBtn = document.getElementById("generateTimetable");
const classesDiv = document.getElementById('classes');

let currentSubjectsTimetable = [];

// --- EVENT DELEGATION CONTAINER ---
document.addEventListener('click', async (event) => {
    const target = event.target;

    // 1. Handle Day Selection Click
    if (target.classList.contains('day-btn') || target.closest('.day-btn')) {
        const dayBtn = target.closest('.day-btn');
        const chosenDay = dayBtn.textContent.trim();
        
        // NEW: Save the clicked day to localStorage
        localStorage.setItem('selectedDay', chosenDay);
        filterTimetableByDay(chosenDay);
    }

    // 2. Handle Semester Selection Click
    if (target.classList.contains('sem-btn') || target.closest('.sem-btn')) {
        const semBtn = target.closest('.sem-btn');
        const semId = semBtn.id;
        localStorage.setItem('selectedSem', semId);
        
        semBtn.disabled = true;
        await fetchSubjects(parseInt(semId));
        semBtn.disabled = false;
    }
});

// --- CORE FUNCTIONS ---

function saveSubjectsToStorage() {
    const selectedSubjects = subjectDropdowns
        .map(dropdown => dropdown?.value?.trim())
        .filter(val => val && val !== "");
    
    localStorage.setItem('audSelectedSubjects', JSON.stringify(selectedSubjects));
}

async function generateTimetableFlow() {
    saveSubjectsToStorage();
    const savedSubjects = JSON.parse(localStorage.getItem('audSelectedSubjects'));

    if (!savedSubjects || savedSubjects.length === 0) {
        alert("Please select your subjects first!");
        return;
    }

    try {
        generateTimetableBtn.disabled = true;
        const response = await fetch('/api/timetable', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subjects: savedSubjects })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        currentSubjectsTimetable = await response.json();
        localStorage.setItem('cachedTimetableData', JSON.stringify(currentSubjectsTimetable));

        // NEW: Fetch the saved day, or default to Monday if they haven't picked one yet
        const savedDay = localStorage.getItem('selectedDay') || 'Monday';
        filterTimetableByDay(savedDay);
    } catch (error) {
        console.error("Failed to generate timetable:", error);
    } finally {
        generateTimetableBtn.disabled = false;
    }
}

generateTimetableBtn?.addEventListener('click', generateTimetableFlow);

function filterTimetableByDay(selectedDay) {
    if (!currentSubjectsTimetable || currentSubjectsTimetable.length === 0) return;

    const dailySchedule = currentSubjectsTimetable.filter(slot => {
        const dayValue = slot.day || slot.dayName;
        return dayValue && dayValue.toLowerCase().trim() === selectedDay.toLowerCase().trim();
    });

    classesDiv.innerHTML = dailySchedule.map(item => `
        <div class="output">
            <div><img src="../frontend/images/book_5_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg" alt="Icon"> Subject: ${item.subject}</div>
            <div><img src="../frontend/images/sensor_door_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg" alt="Icon"> Room: ${item.room}</div>
            <div><img src="../frontend/images/clock_loader_10_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg" alt="Icon"> Time: ${item.time}</div>
            <div><img src="../frontend/images/calendar_month_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg" alt="Icon"> Day: ${item.day}</div>
        </div>
    `).join('');
}

async function fetchSubjects(semesterId) {
    try {
        const resSubjects = await fetch(`/api/subjects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ semester: semesterId })
        });
        if (!resSubjects.ok) throw new Error('Failed to fetch subjects');
        const filteredSem = await resSubjects.json();
        const baseSubjectNames = filteredSem.map(sub => sub.subjectName);

        const resTimetable = await fetch(`/api/timetable`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subjects: baseSubjectNames })
        });
        if (!resTimetable.ok) throw new Error('Failed to fetch timetable');
        const semesterTimetable = await resTimetable.json();

        const uniqueSectionNames = new Set(
            semesterTimetable.map(entry => entry.subject?.trim()).filter(Boolean)
        );

        const optionsToRender = uniqueSectionNames.size > 0
            ? Array.from(uniqueSectionNames).sort()
            : baseSubjectNames.sort();

        subjectDropdowns.forEach(dropdown => {
            if (!dropdown) return;
            dropdown.innerHTML = '<option value="">Select Subject</option>';
            optionsToRender.forEach(subjectName => {
                const option = document.createElement('option');
                option.value = subjectName;
                option.textContent = subjectName;
                dropdown.appendChild(option);
            });
        });
    } catch (error) {
        console.error("Error fetching subject flow:", error);
    }
}

async function initAppPersistence() {
    const savedSem = localStorage.getItem('selectedSem');
    const savedSubjects = JSON.parse(localStorage.getItem('audSelectedSubjects'));
    const cachedTimetable = localStorage.getItem('cachedTimetableData');
    
    // NEW: Retrieve the day from local storage, defaulting to Monday
    const savedDay = localStorage.getItem('selectedDay') || 'Monday';

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
        // NEW: Render the previously saved day instead of hardcoded 'Monday'
        filterTimetableByDay(savedDay);
    }
}

document.addEventListener('DOMContentLoaded', initAppPersistence);
