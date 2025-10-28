document.addEventListener('DOMContentLoaded', () => {


    // Lógica para pop-ups de Login e Registro
    const loginPopup = document.getElementById('login-popup');
    const registerPopup = document.getElementById('register-popup');
    const loginButtons = document.querySelectorAll('.open-login');
    const registerButtons = document.querySelectorAll('.open-register');
    const closeButtons = document.querySelectorAll('.close');

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






/*Newsletter pop-up*/
document.addEventListener('DOMContentLoaded', () => {
    const newsletterForm = document.querySelector('.newsletter-form');
    const subscribePopup = document.getElementById('subscribe-popup');
    const closeSubscribePopup = subscribePopup.querySelector('.close');

    // Mostrar pop-up ao enviar formulário
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Previne envio real do formulário
        subscribePopup.style.display = 'flex'; // Exibe a pop-up
        newsletterForm.reset(); // Limpa os campos do formulário
    });

    // Fechar pop-up ao clicar no "X" ou fora da pop-up
    closeSubscribePopup.addEventListener('click', () => {
        subscribePopup.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === subscribePopup) {
            subscribePopup.style.display = 'none';
        }
    });
});
