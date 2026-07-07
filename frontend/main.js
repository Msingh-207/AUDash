var settingsDiv = document.querySelector('.settings');
var display = 0;
var settingsIcon = document.querySelector('.settings-icon');

const dayContainer = document.querySelector('.days-container');

const semesterContainer = document.querySelector('.semester-container')

semesterContainer.addEventListener('click', function(event) {
  // 2. Check if what the user clicked actually is one of our filter buttons
  const clickedSem = event.target.closest('.semesters');
  
  // If they clicked the empty space inside the div instead of a button, do nothing
  if (!clickedSem) return;

  // 3. Find the button that currently has the 'active' class inside this container
  const currentActiveSem = semesterContainer.querySelector('.semesters.active');

  // 4. If there is an active button, remove the 'active' class from it
  if (currentActiveSem) {
    currentActiveSem.classList.remove('active');
  }

  // 5. Add the 'active' class to the newly clicked button
  clickedSem.classList.add('active');
});

dayContainer.addEventListener('click', function(event) {
  // 2. Check if what the user clicked actually is one of our filter buttons
  const clickedDay = event.target.closest('.day');
  
  // If they clicked the empty space inside the div instead of a button, do nothing
  if (!clickedDay) return;

  // 3. Find the button that currently has the 'active' class inside this container
  const currentActiveDay = dayContainer.querySelector('.day.active');

  // 4. If there is an active button, remove the 'active' class from it
  if (currentActiveDay) {
    currentActiveDay.classList.remove('active');
  }

  // 5. Add the 'active' class to the newly clicked button
  clickedDay.classList.add('active');
});

function hideShow (){
  if(display == 1){
    settingsDiv.style.display = 'block';
    display = 0;
    settingsDiv.classList.toggle('is-visible')
  } else {
    settingsDiv.style.display = 'none';
    display = 1;
    settingsDiv.classList.toggle('is-visible')
  }
}

settingsIcon.addEventListener('click', hideShow);