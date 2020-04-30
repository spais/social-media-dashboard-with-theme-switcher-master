// DOMcache
const 
toggleBtn = document.querySelector(".toggle-state"),
changeTheme = document.querySelector(".theme-mode");


toggleTheme = e => {
    changeTheme.classList.toggle('theme-mode--light');
}

// EventListener
toggleBtn.addEventListener('click', toggleTheme);