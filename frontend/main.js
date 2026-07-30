const settingsDiv = document.querySelector('.settings');
const settingsIcon = document.querySelector('.settings-icon');
const buttons = document.querySelectorAll('.btn-div button');

buttons.forEach(button => {
  button.addEventListener('click', (e) => {
    const parentDiv = e.currentTarget.closest('.btn-div'); 
    if (!parentDiv) return;

    // The '?.' operator ensures .classList only runs if an active button is found
    parentDiv.querySelector('button.active')?.classList.remove('active');
    e.currentTarget.classList.add('active');
  });
});

settingsIcon.addEventListener('click', () => {
  settingsDiv.classList.toggle('is-visible');
});