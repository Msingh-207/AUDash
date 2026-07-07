var settingsDiv = document.querySelector('.settings');
var display = 0;
var settingsIcon = document.querySelector('.settings-icon');

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
