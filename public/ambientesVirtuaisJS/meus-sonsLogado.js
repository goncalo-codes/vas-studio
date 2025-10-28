document.addEventListener('DOMContentLoaded', async () => {
    const sonsContainer = document.querySelector('.sons-container');
    const sonsIndividuaisContainer = document.getElementById('sons-individuais');
    const pacotesSonsContainer = document.getElementById('pacotes-sons');
    const searchBar = document.getElementById('search-bar');
    const filtroItens = document.querySelectorAll('.filtro-item');
    document.getElementById('individual-btn').classList.add('active');
    sonsIndividuaisContainer.style.display = 'flex';
    pacotesSonsContainer.style.display = 'none';

    let usuarioId = null;


    // Função para obter o ID do usuário logado
    async function obterUsuarioLogado() {
        try {
            const response = await fetch("/lojaSom/usuarioLogado"); // Rota para obter o usuário logado
            if (!response.ok) {
                throw new Error("Usuário não autenticado.");
            }
            const data = await response.json();
            usuarioId = data.usuarioId;  // Atualiza o ID do usuário no frontend
        } catch (erro) {
            console.error("Erro ao obter o usuário logado:", erro);
            alert("Erro ao obter o usuário logado. Faça login novamente.");
        }
    }

// Função para renderizar os sons individuais
    function renderizarSons(sons, pesquisa = '', categoria = 'tudo') {
    sonsContainer.innerHTML = ''; // Limpa o container

    // Remove duplicatas, considerando o ID do som
    const sonsUnicos = sons.filter((som, index, self) =>
        index === self.findIndex((s) => (
            s.id === som.id // Considera a duplicação com base no ID do áudio
        ))
    );

    const sonsFiltrados = sonsUnicos.filter(som => 
        (categoria === 'tudo' || som.categoria === categoria) && 
        (som.nome ?? '').toLowerCase().includes(pesquisa.toLowerCase())
    );

    // Se não houver sons filtrados, mostra a mensagem de "Nenhum som encontrado"
    if (sonsFiltrados.length === 0) {
        const mensagem = document.createElement('p');
        mensagem.textContent = 'Nenhum som encontrado.';
        sonsContainer.appendChild(mensagem); // Adiciona a mensagem ao container
        return;
    }

    // Renderiza os sons filtrados
    sonsFiltrados.forEach(som => {
        const card = document.createElement('div');
        card.classList.add('son-card');
        card.innerHTML = `
            <h3>${som.nome}</h3>
            <audio controls>
                <source src="${som.caminho}" type="audio/mpeg">
                Seu navegador não suporta o elemento de áudio.
            </audio>
        `;
        sonsContainer.appendChild(card);
    });
}

function renderizarPacotesComSons(pacotes, pesquisa = '', categoria = 'tudo') {
    pacotesSonsContainer.innerHTML = ''; // Limpa a área de pacotes

    if (!pacotes || pacotes.length === 0) {
        pacotesSonsContainer.innerHTML = '<p>Nenhum pacote de som encontrado.</p>';
        return;
    }

    const pacotesFiltrados = pacotes.filter(pacote => {
        const pacoteCategoria = pacote.categoria ? pacote.categoria.toLowerCase() : '';
        return (
            (categoria === 'tudo' || pacoteCategoria === categoria.toLowerCase()) &&
            (pacote.titulo ?? '').toLowerCase().includes(pesquisa.toLowerCase())
        );
    });

    if (pacotesFiltrados.length === 0) {
        pacotesSonsContainer.innerHTML = '<p>Nenhum pacote correspondente encontrado.</p>';
        return;
    }

    pacotesFiltrados.forEach(pacote => {
        const card = document.createElement('div');
        card.classList.add('son-card');

        const sonsList = pacote.sons.map(som => `
            <ul>
                <h4>${som.nome}</h4>
                <audio class="audio-som" data-id="${som.id}" controls>
                    <source src="${som.caminho}" type="audio/mpeg">
                    Seu navegador não suporta o elemento de áudio.
                </audio>
            </ul>
        `).join('');

        card.innerHTML = `
            <h3>${pacote.titulo}</h3>
            <div>Categoria: ${pacote.categoria}</div>
            <div>Preço: €${pacote.preco}</div>
            <ul style="margin-top: 20px;">
                ${sonsList}
            </ul>
            <div class="controle-btn-container">
                <button class="controle-btn" data-id="${pacote.pacote_id}" data-action="play">Reproduzir Todos</button>
            </div>
        `;

        pacotesSonsContainer.appendChild(card);
    });

    // Adiciona a funcionalidade ao botão de Play/Pause
    const controleBtns = document.querySelectorAll('.controle-btn');
    controleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            const audios = btn.closest('.son-card').querySelectorAll('.audio-som');

            if (action === 'play') {
                // Reproduz todos os áudios
                audios.forEach(audio => {
                    audio.play();
                });
                btn.setAttribute('data-action', 'pause');
                btn.textContent = 'Pausar Todos';
            } else if (action === 'pause') {
                // Pausa todos os áudios
                audios.forEach(audio => {
                    audio.pause();
                });
                btn.setAttribute('data-action', 'play');
                btn.textContent = 'Reproduzir Todos';
            }
        });
    });
}

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
            sonsContainer.innerHTML = '<p>Não foi possível carregar os sons comprados. Tente novamente mais tarde.</p>';
            return [];
        }
    }

    async function buscarPacotesCompradosDaAPI() {
        try {
            const response = await fetch('/lojaSom/listarPacotesComprados');
            if (!response.ok) {
                console.error(`Erro na API: ${response.status}`);
                return [];
            }
    
            const data = await response.json(); // Pode lançar erro se o JSON for inválido
            console.log('Pacotes recebidos:', data);
            return data;
        } catch (error) {
            console.error('Erro ao buscar pacotes da API:', error.message || error);
            return [];
        }
    }

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
                const pacotes = await buscarPacotesCompradosDaAPI();
                renderizarPacotesComSons(pacotes);
            });

       // Lógica da pesquisa
       searchBar.addEventListener('input', async () => {
        const categoria = document.querySelector('.filtro-item.active')?.getAttribute('data-categoria') || 'tudo';
        const pesquisa = searchBar.value;

        const pacotes = await buscarPacotesCompradosDaAPI();
    
        // Renderiza sons ou pacotes dependendo da seção ativa
        if (sonsIndividuaisContainer.style.display === 'flex') {
            renderizarSonsIndividuais(sons, pesquisa, categoria);
        } else {
            renderizarPacotesComSons(pacotes, pesquisa, categoria);
        }
    });

// Lógica para quando o filtro for clicado
    filtroItens.forEach(item => {
        item.addEventListener('click', async () => {
            // Remove a classe 'active' do filtro anterior, se houver
            document.querySelector('.filtro-item.active')?.classList.remove('active');
    
            // Adiciona a classe 'active' no filtro atual
            item.classList.add('active');
    
            // Obtem a categoria associada ao filtro clicado
            const categoria = item.getAttribute('data-categoria');
            console.log('Categoria selecionada:', categoria); // LOG AQUI
    
            const pesquisa = searchBar.value;
    
            const sons = await buscarSonsDaAPI();
    
            // Renderiza sons ou pacotes dependendo da seção ativa
            if (sonsIndividuaisContainer.style.display === 'flex') {
                renderizarSonsIndividuais(sons, pesquisa, categoria);
            } else {
                const pacotes = await buscarPacotesDaAPI();
                renderizarPacotesComSons(pacotes, pesquisa, categoria);
            }
        });
    });

    // Carrega os sons ao carregar a página
    async function inicializar() {
        await obterUsuarioLogado(); // Obtém o ID do usuário logado
        await buscarPacotesCompradosDaAPI();
        const sons = await buscarSonsCompradosDaAPI(); // Busca os sons comprados
        const urlParams = new URLSearchParams(window.location.search);
        const categoria = urlParams.get('categoria') || 'tudo';

        renderizarSons(sons, '', 'tudo'); // Renderiza todos os sons inicialmente
    }

    inicializar();

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



    document.getElementById('individual-btn').addEventListener('click', () => {
        sonsIndividuaisContainer.style.display = 'flex';
        pacotesSonsContainer.style.display = 'none';
    });
    
    document.getElementById('pacote-btn').addEventListener('click', () => {
        sonsIndividuaisContainer.style.display = 'none';
        pacotesSonsContainer.style.display = 'flex';
    });
});
