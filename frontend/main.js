const settingsDiv = document.querySelector('.settings');
const settingsIcon = document.querySelector('.settings-icon');
const buttons = document.querySelectorAll('.btn-div button');

buttons.forEach(button => {
  button.addEventListener('click', function() {
    
    // Change '.btn-group' to '.btn-div' to match your HTML!
    const parentDiv = this.closest('.btn-div'); 
    
    // Safety check: make sure the parent container was actually found
    if (!parentDiv) return;

    const currentActive = parentDiv.querySelector('button.active');
    
    if (currentActive) {
      currentActive.classList.remove('active');
    }
    this.classList.add('active');
  });
});


function hideShow() {
  settingsDiv.classList.toggle('is-visible');
}

settingsIcon.addEventListener('click', hideShow);