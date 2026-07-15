// === CONFIGURAÇÃO DO FIREBASE ===
// ATENÇÃO: Substitua os valores abaixo pelos dados do seu projeto no Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyBHx4Dpg-aBImLq1xuANXjIwZvhq0kK_98",
    authDomain: "aamontagens-c2933.firebaseapp.com",
    projectId: "aamontagens-c2933",
    storageBucket: "aamontagens-c2933.firebasestorage.app",
    messagingSenderId: "216223851243",
    appId: "1:216223851243:web:fd5e8fea33e11cf9e854ae"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);

// Instâncias
const auth = firebase.auth();
const db = firebase.firestore();

// Elementos da Interface
const loginContainer = document.getElementById('login-container');
const geradorContainer = document.getElementById('gerador-container');
const historicoContainer = document.getElementById('historico-container');
const formLogin = document.getElementById('form-login');
const btnLogout = document.getElementById('btn-logout');
const btnShowHistorico = document.getElementById('btn-show-historico');
const btnCloseHistorico = document.getElementById('btn-close-historico');
const historicoList = document.getElementById('historico-list');
const btnPrint = document.getElementById('btn-print');

// === AUTENTICAÇÃO ===

// Observar estado de login
auth.onAuthStateChanged(user => {
    if (user) {
        // Usuário logado
        if (loginContainer) loginContainer.style.display = 'none';
        if (geradorContainer) geradorContainer.style.display = 'flex';
        carregarHistorico();
    } else {
        // Usuário deslogado
        if (loginContainer) loginContainer.style.display = 'flex';
        if (geradorContainer) geradorContainer.style.display = 'none';
        if (historicoContainer) historicoContainer.style.display = 'none';
    }
});

// Fazer Login
if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                // Sucesso
                alert("Login efetuado com sucesso!");
            })
            .catch(error => {
                alert("Erro ao fazer login. Verifique seu e-mail e senha.\nLembre-se de configurar o Firebase no firebase-app.js!\nErro: " + error.message);
            });
    });
}

// Fazer Logout
if (btnLogout) {
    btnLogout.addEventListener('click', () => {
        auth.signOut();
    });
}

// === BANCO DE DADOS (HISTÓRICO) ===

// Salvar Orçamento ao clicar em Imprimir/Gerar
if (btnPrint) {
    // Nós adicionamos um listener extra, além do print que já existe
    btnPrint.addEventListener('click', () => {
        // Não salva se não estiver logado (segurança)
        if (!auth.currentUser) return;

        // Pegar dados atuais da tela para salvar absolutamente tudo
        const orcamentoData = {
            numero: document.getElementById('input-orc-num').value,
            dataStr: document.getElementById('input-orc-data').value,
            cliente: document.getElementById('input-cliente-nome').value || "Cliente sem nome",
            endereco: document.getElementById('input-cliente-endereco').value,
            telefone: document.getElementById('input-cliente-telefone').value,
            validade: document.getElementById('input-orc-validade').value,
            contatoNome: document.getElementById('input-contato-nome').value,
            contatoTel: document.getElementById('input-contato-tel').value,
            contatoInstagram: document.getElementById('input-contato-instagram').value,
            deslocamentoMarcado: document.getElementById('chk-deslocamento').checked,
            deslocamentoOrigem: document.getElementById('input-deslocamento-origem').value,
            deslocamentoDestino: document.getElementById('input-deslocamento-destino').value,
            deslocamentoKm: document.getElementById('input-deslocamento-km').value,
            total: document.getElementById('preview-total-value').textContent,
            items: window.items || [],
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        db.collection("orcamentos").add(orcamentoData)
            .then(() => {
                console.log("Orçamento salvo no histórico!");
                carregarHistorico();
            })
            .catch(error => {
                console.error("Erro ao salvar no Firebase:", error);
            });
    });
}

// Carregar Histórico
function carregarHistorico() {
    if (!auth.currentUser || !historicoList) return;

    // Busca do mais recente para o mais antigo
    db.collection("orcamentos")
        .orderBy("timestamp", "desc")
        .limit(50)
        .get()
        .then(snapshot => {
            historicoList.innerHTML = ''; // Limpa a lista

            if (snapshot.empty) {
                historicoList.innerHTML = '<p class="empty-msg">Nenhum orçamento salvo ainda.</p>';
                return;
            }

            snapshot.forEach(doc => {
                const data = doc.data();

                const card = document.createElement('div');
                card.className = 'historico-card';
                card.innerHTML = `
                    <div class="h-head">
                        <strong>Nº ${data.numero || '---'}</strong>
                        <span>${data.dataStr || ''}</span>
                    </div>
                    <div class="h-client">${data.cliente}</div>
                    <div class="h-total">${data.total}</div>
                `;
                historicoList.appendChild(card);
                
                // Re-preencher formulário ao clicar
                card.addEventListener('click', () => {
                    const fieldMapping = {
                        'input-orc-num': data.numero,
                        'input-orc-data': data.dataStr,
                        'input-cliente-nome': data.cliente,
                        'input-cliente-endereco': data.endereco,
                        'input-cliente-telefone': data.telefone,
                        'input-orc-validade': data.validade,
                        'input-contato-nome': data.contatoNome,
                        'input-contato-tel': data.contatoTel,
                        'input-contato-instagram': data.contatoInstagram,
                        'input-deslocamento-origem': data.deslocamentoOrigem,
                        'input-deslocamento-destino': data.deslocamentoDestino,
                        'input-deslocamento-km': data.deslocamentoKm,
                    };

                    for (const [id, value] of Object.entries(fieldMapping)) {
                        const element = document.getElementById(id);
                        if (element) element.value = value || '';
                    }

                    const chkDeslocamento = document.getElementById('chk-deslocamento');
                    chkDeslocamento.checked = data.deslocamentoMarcado || false;
                    
                    chkDeslocamento.dispatchEvent(new Event('change'));
                    
                    window.items = data.items || [];
                    
                    if (window.render) {
                        window.render();
                    }
                    
                    if (historicoContainer) {
                        historicoContainer.classList.remove('active');
                        historicoContainer.style.display = 'none';
                    }
                });
                card.style.cursor = 'pointer'; // Mantém o cursor como ponteiro
            });
        })
        .catch(error => {
            console.error("Erro ao buscar histórico:", error);
            if (historicoList) {
                historicoList.innerHTML = '<p class="empty-msg" style="color:red;">Erro ao carregar o histórico. Verifique as regras do Firestore.</p>';
            }
        });
}

// UI do Histórico (Abrir/Fechar Sidebar)
if (btnShowHistorico && historicoContainer) {
    btnShowHistorico.addEventListener('click', () => {
        historicoContainer.classList.add('active');
        historicoContainer.style.display = 'block';
    });
}
if (btnCloseHistorico && historicoContainer) {
    btnCloseHistorico.addEventListener('click', () => {
        historicoContainer.classList.remove('active');
        historicoContainer.style.display = 'none';
    });
}
