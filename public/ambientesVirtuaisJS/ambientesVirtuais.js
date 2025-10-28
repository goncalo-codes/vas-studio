document.addEventListener('DOMContentLoaded', () => {
    const sonsContainer = document.querySelector('.sons-container');
    const playAllButton = document.createElement('button');
    const loginPopup = document.getElementById('login-popup');
    const registerPopup = document.getElementById('register-popup');
    const loginButtons = document.querySelectorAll('.open-login');
    const registerButtons = document.querySelectorAll('.open-register');
    const closeButtons = document.querySelectorAll('.close')
    playAllButton.id = 'play-all-button';
    playAllButton.textContent = 'Play All';

    loginButtons.forEach(button => {
        button.addEventListener('click', () => loginPopup.style.display = 'flex');
    });

    registerButtons.forEach(button => {
        button.addEventListener('click', () => registerPopup.style.display = 'flex');
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            loginPopup.style.display = 'none';
            registerPopup.style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === loginPopup) loginPopup.style.display = 'none';
        if (e.target === registerPopup) registerPopup.style.display = 'none';
    });
});