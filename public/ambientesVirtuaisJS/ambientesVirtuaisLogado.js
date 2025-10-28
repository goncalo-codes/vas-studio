document.addEventListener('DOMContentLoaded', () => {
    const sonsContainer = document.querySelector('.sons-container');
    const dropdownMenu = document.querySelector('.dropdownn-menu');
    const playAllButton = document.createElement('button');
    const customizeButton = document.querySelector('.customize-button'); // Botão "Personalizado"
    playAllButton.id = 'play-all-button';
    playAllButton.textContent = 'Play All';
    const popup = document.getElementById('popup2'); // Popup
    const closePopupButton = document.getElementById('close-popup2'); // Botão de fechar popup
    const sonListContainer = document.getElementById('son-list'); // Contêiner da lista de sons
    sonsContainer.appendChild(playAllButton);

    let usuarioId = null;
    let pacotesComprados = [];

    // Função para buscar os sons comprados da API
    async function buscarSonsCompradosDaAPI() {
        try {
            const response = await fetch('/lojaSom/listarSonsComprados'); // Rota para listar sons comprados
            if (!response.ok) {
                throw new Error('Erro ao buscar sons comprados da API');
            }

            const sons = await response.json();
            return sons.map(som => ({
                ...som,
                caminho: `/ambienteSons/${som.caminho}` // Adiciona o prefixo correto ao caminho
            }));
        } catch (erro) {
            console.error('Erro ao buscar sons comprados:', erro);
            sonListContainer.innerHTML = '<p>Não foi possível carregar os sons comprados. Tente novamente mais tarde.</p>';
            return [];
        }
    }

    // Função para exibir os sons comprados no popup
    async function exibirSonsComprados() {
        const sons = await buscarSonsCompradosDaAPI();

        // Verifica se o array de sons não está vazio
        if (Array.isArray(sons) && sons.length > 0) {
            const sonListContainer = document.getElementById('son-list');
            sonListContainer.innerHTML = ''; // Limpa a lista de sons antes de adicionar novos

            // Itera sobre os sons e cria um botão para cada um
            sons.forEach(som => {
                const sonDiv = document.createElement('div');
                sonDiv.classList.add('son-item');

                // Verifica se o som já foi adicionado à lista no .sons-container
                const isSoundAdded = document.querySelector(`.sons-container .son-card[data-som-id="${som.id}"]`);

                // Se o som já foi adicionado, desabilita o botão "Adicionar"
                const addButtonText = isSoundAdded ? 'Já Adicionado' : 'Adicionar';
                const addButtonDisabled = isSoundAdded ? 'disabled' : '';

                sonDiv.innerHTML = `
                    <h3>${som.nome}</h3>
                    <button class="play-button" data-som-id="${som.id}" data-som-caminho="${som.caminho}">Play</button>
                    <button class="add-button" data-som-id="${som.id}" data-som-caminho="${som.caminho}" ${addButtonDisabled}>
                        ${addButtonText}
                    </button>
                    <audio class="audio-player" data-som-id="${som.id}" style="display: none;">
                        <source src="${som.caminho}" type="audio/mpeg">
                        Seu navegador não suporta o elemento de áudio.
                    </audio>
                `;

                // Adiciona o item à lista
                sonListContainer.appendChild(sonDiv);

                // Adiciona evento para o botão "Play"
                const playButton = sonDiv.querySelector('.play-button');
                const audio = sonDiv.querySelector('.audio-player');

                playButton.addEventListener('click', () => {
                    if (audio.paused) {
                        audio.play();
                        playButton.textContent = 'Pause'; // Muda o texto para "Pause"
                    } else {
                        audio.pause();
                        playButton.textContent = 'Play'; // Muda o texto de volta para "Play"
                    }
                });

                // Adiciona evento para o botão "Adicionar"
                const addButton = sonDiv.querySelector('.add-button');
                addButton.addEventListener('click', () => {
                    if (!addButton.disabled) {
                        adicionarSomNoContainer(som);
                        addButton.disabled = true; // Desabilita o botão "Adicionar" após ser clicado
                        addButton.textContent = 'Já Adicionado'; // Muda o texto para "Já Adicionado"
                    }
                });
            });
        } else {
            const sonListContainer = document.getElementById('son-list');
            sonListContainer.innerHTML = '<p>Você não comprou nenhum som ainda.</p>';
        }
    }

    // Função para adicionar o som ao container principal
    function adicionarSomNoContainer(som) {
        const sonsContainer = document.querySelector('.sons-container');

        // Verifica se o som já foi adicionado ao container
        const existingSound = sonsContainer.querySelector(`.son-card[data-som-id="${som.id}"]`);
        if (existingSound) {
            return; // Impede a adição se o som já estiver presente
        }

        // Cria o card do som para exibição
        const card = document.createElement('div');
        card.classList.add('son-card');
        card.setAttribute('data-som-id', som.id);
        card.innerHTML = `
            <h3>${som.nome}</h3>
            <audio class="audio-player" loop>
                <source src="${som.caminho}" type="audio/mpeg">
                Seu navegador não suporta o elemento de áudio.
            </audio>
            <div>
                <label for="volume-slider-${som.id}">Volume:</label>
                <input type="range" class="volume-slider" id="volume-slider-${som.id}" min="0" max="1" step="0.01" value="1">
            </div>
            <div>
                <label for="speed-slider-${som.id}">Velocidade:</label>
                <input type="range" class="speed-slider" id="speed-slider-${som.id}" min="0.5" max="2" step="0.1" value="1">
            </div>
        `;

        // Adiciona o card no container
        sonsContainer.appendChild(card);

        // Manipulação de volume e velocidade após o áudio estar carregado
        const audioPlayer = card.querySelector('.audio-player');
        audioPlayer.addEventListener('canplay', () => {
            const volumeSlider = card.querySelector(`#volume-slider-${som.id}`);
            const speedSlider = card.querySelector(`#speed-slider-${som.id}`);

            volumeSlider.addEventListener('input', () => {
                audioPlayer.volume = volumeSlider.value;
            });

            speedSlider.addEventListener('input', () => {
                audioPlayer.playbackRate = speedSlider.value;
            });
        });
    }

    // Função para controlar o play all e stop all
    function controlarPlayAll() {
        const audioPlayers = sonsContainer.querySelectorAll('.audio-player'); // Modificado para buscar apenas dentro de .sons-container
        const playAll = playAllButton.textContent === 'Play All';
    
        audioPlayers.forEach(audio => {
            if (playAll) {
                audio.play();
            } else {
                audio.pause();
            }
        });
    
        playAllButton.textContent = playAll ? 'Stop All' : 'Play All';
    }

    playAllButton.addEventListener('click', controlarPlayAll);

    // Função para limpar o .sons-container
    function limparSonsContainer() {
        sonsContainer.innerHTML = ''; // Limpa todo o conteúdo do container
    }

    if (customizeButton) {
        customizeButton.addEventListener('click', limparSonsContainer);
    }

    // Abrir o popup ao clicar no botão "+" 
    customizeButton.addEventListener('click', () => {
        sonsContainer.appendChild(playAllButton);
        const plusButton = document.createElement('button');
        plusButton.id = 'plus-button';
        plusButton.textContent = '+';
        plusButton.classList.add('plus-button');
        sonsContainer.appendChild(plusButton);

        // Evento de clique no botão "+" para abrir o popup
        plusButton.addEventListener('click', () => {
            popup.style.display = 'flex'; // Exibir o popup
            exibirSonsComprados(); // Carregar e exibir os sons
        });
    });

    // Fechar o popup ao clicar no botão de fechar
    closePopupButton.addEventListener('click', () => {
        popup.style.display = 'none'; // Esconder o popup
    });

    // Fechar o popup se clicar fora do conteúdo do popup
    window.addEventListener('click', (event) => {
        if (event.target === popup) {
            popup.style.display = 'none'; // Esconder o popup
        }
    });

    // Função para obter o ID do usuário logado
    async function obterUsuarioLogado() {
        try {
            const response = await fetch("/lojaSom/usuarioLogado"); 
            if (!response.ok) {
                throw new Error("Usuário não autenticado.");
            }
            const data = await response.json();
            usuarioId = data.usuarioId;
        } catch (erro) {
            console.error("Erro ao obter o usuário logado:", erro);
            alert("Erro ao obter o usuário logado. Faça login novamente.");
        }
    }

    async function buscarPacotesCompradosDaAPI() {
        try {
            const response = await fetch('/lojaSom/listarPacotesComprados');
            if (!response.ok) {
                console.error(`Erro na API: ${response.status}`);
                return [];
            }

            const data = await response.json(); 
            console.log('Pacotes recebidos:', data);
            pacotesComprados = data;

            // Preenche o dropdown com os títulos dos pacotes
            dropdownMenu.innerHTML = ''; 
            data.forEach(pacote => {
                const option = document.createElement('a');
                option.href = "#";
                option.textContent = pacote.titulo;
                option.addEventListener('click', () => exibirSonsDoPacote(pacote));
                dropdownMenu.appendChild(option);
            });

            return data;
        } catch (error) {
            console.error('Erro ao buscar pacotes da API:', error.message || error);
            return [];
        }
    }

    function exibirSonsDoPacote(pacote) {
        sonsContainer.innerHTML = '';  

        // Exibe o botão Play All
        sonsContainer.appendChild(playAllButton);

        // Exibe os sons em formato de card
        pacote.sons.forEach(son => {
            adicionarSomNoContainer(son);
        });
    }

    // Inicializa o processo de autenticação e pacotes
    obterUsuarioLogado();
    buscarPacotesCompradosDaAPI();
});
