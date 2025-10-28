document.addEventListener('DOMContentLoaded', async () => {
    const sonsContainer = document.querySelector('.sons-container');
    const sonsIndividuaisContainer = document.getElementById('sons-individuais');
    const pacotesSonsContainer = document.getElementById('pacotes-sons');
    const searchBar = document.getElementById('search-bar');
    const filtroItens = document.querySelectorAll('.filtro-item');
    document.getElementById('individual-btn').classList.add('active');
    sonsIndividuaisContainer.style.display = 'flex';
    pacotesSonsContainer.style.display = 'none';

    // Lógica para alternar entre "Individuais" e "Pacotes"
    document.getElementById('individual-btn').addEventListener('click', () => {
        // Alterar a visibilidade das seções
        sonsIndividuaisContainer.style.display = 'flex';
        pacotesSonsContainer.style.display = 'none';
    
        // Atualizar o estado visual dos botões
        document.getElementById('individual-btn').classList.add('active');
        document.getElementById('pacote-btn').classList.remove('active');
    });
    
    document.getElementById('pacote-btn').addEventListener('click', async () => {
        // Alterar a visibilidade das seções
        sonsIndividuaisContainer.style.display = 'none';
        pacotesSonsContainer.style.display = 'flex';
    
        // Atualizar o estado visual dos botões
        document.getElementById('pacote-btn').classList.add('active');
        document.getElementById('individual-btn').classList.remove('active');
    
        // Buscar e renderizar os pacotes
        const pacotes = await buscarPacotesDaAPI();
        renderizarPacotesComSons(pacotes);
    });

    document.getElementById('individual-btn').addEventListener('click', () => {
        sonsIndividuaisContainer.style.display = 'flex';
        pacotesSonsContainer.style.display = 'none';
    });
    
    document.getElementById('pacote-btn').addEventListener('click', () => {
        sonsIndividuaisContainer.style.display = 'none';
        pacotesSonsContainer.style.display = 'flex';
    });


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
});
