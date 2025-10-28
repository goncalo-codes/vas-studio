document.addEventListener('DOMContentLoaded', async () => {
    const sonsContainer = document.querySelector('.sons-container');
    const sonsIndividuaisContainer = document.getElementById('sons-individuais');
    const pacotesSonsContainer = document.getElementById('pacotes-sons');
    const searchBar = document.getElementById('search-bar');
    const filtroItens = document.querySelectorAll('.filtro-item');
    document.getElementById('individual-btn').classList.add('active');
    sonsIndividuaisContainer.style.display = 'flex';
    pacotesSonsContainer.style.display = 'none';

    // Inicialize os dados
    const sons = await buscarSonsDaAPI();
    const pacotes = await buscarPacotesDaAPI();

    // Renderiza os sons individuais inicialmente
    renderizarSonsIndividuais(sons);

    // Função para renderizar os sons individuais
    function renderizarSonsIndividuais(sons, pesquisa = '', categoria = 'tudo') {
        sonsIndividuaisContainer.innerHTML = ''; // Limpa a área de sons individuais

        const sonsFiltrados = sons.filter(som =>
            (categoria === 'tudo' || som.categoria === categoria) &&
            (som.nome ?? '').toLowerCase().includes(pesquisa.toLowerCase())
        );

        if (sonsFiltrados.length === 0) {
            sonsIndividuaisContainer.innerHTML = '<p>Nenhum som individual encontrado.</p>';
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
                <div class="comprar-btn-container">
                    <button class="comprar-btn" data-id="${som.id}" data-preco="${som.preco}">Comprar (€${som.preco})</button>
                </div>
            `;
            sonsIndividuaisContainer.appendChild(card);
        });
    }

    // Função para renderizar os pacotes de sons
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
                    <audio controls>
                        <source src="${som.caminho}" type="audio/mpeg">
                        Seu navegador não suporta o elemento de áudio.
                    </audio>
                </ul>
            `).join('');
    
            card.innerHTML = `
                <h3>${pacote.titulo}</h3>
                <div>Categoria: ${pacote.categoria}</div>
                <ul>
                    ${sonsList}
                </ul>
                <div class="comprar-btn-container">
                    <button class="comprar-btn" data-id="${pacote.pacote_id}" data-preco="${pacote.preco}">Comprar (€${pacote.preco})</button>
                </div>
            `;
            pacotesSonsContainer.appendChild(card);
        });
    }

    // Função para buscar os sons da API
    async function buscarSonsDaAPI() {
        try {
            const response = await fetch('/lojaSom/listarSons');
            if (!response.ok) {
                throw new Error('Erro ao buscar sons da API');
            }

            const sons = await response.json();
            return sons.map(som => ({
                ...som,
                caminho: `/ambienteSons/${som.caminho}`
            }));
        } catch (erro) {
            console.error('Erro ao buscar sons:', erro);
            sonsContainer.innerHTML = '<p>Não foi possível carregar os sons disponíveis. Tente novamente mais tarde.</p>';
            return [];
        }
    }

    // Função para buscar pacotes da API
    async function buscarPacotesDaAPI() {
    try {
        const response = await fetch('/lojaSom/listarPacotesComSons');
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
        const pacotes = await buscarPacotesDaAPI();
        renderizarPacotesComSons(pacotes);
    });

    // Lógica da pesquisa
    searchBar.addEventListener('input', async () => {
        const categoria = document.querySelector('.filtro-item.active')?.getAttribute('data-categoria') || 'tudo';
        const pesquisa = searchBar.value;
    
        const sons = await buscarSonsDaAPI();
        const pacotes = await buscarPacotesDaAPI();
    
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
            const sons = await buscarSonsDaAPI();
            await buscarPacotesDaAPI(); // Garanta que a resposta seja completada antes de renderizar
            
            console.log('Sons recebidos:', sons);  // Verifique os sons
            // A função buscarPacotesDaAPI() já vai chamar renderizarPacotesComSons quando os dados estiverem disponíveis
            renderizarSonsIndividuais(sons);  // Renderiza inicialmente os sons individuais
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

    document.addEventListener("click", async (event) => {
        if (event.target.classList.contains("comprar-btn")) {
            window.alert("Você precisa estar logado para comprar um som!");
        }
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
