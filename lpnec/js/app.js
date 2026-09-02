// Estado Global da Sessão
let sessionData = {
    participante: {},
    testeSelecionado: '',
    tentativas: [],
    preferencias: { maisGostou: null, menosGostou: null }
};

let currentAttempt = 1;
const maxAttempts = 3;
let sortableTarget, sortablePool;

document.addEventListener('DOMContentLoaded', () => {
    setupFormCadastro();
    setupMascaraData();
    setupMascaraTelefone();
    setupEventListeners();
});

// Máscara e validação automática para o Telefone (DD) 9XXXX-XXXX
function setupMascaraTelefone() {
    const inputTelefone = document.getElementById('telefone');
    
    inputTelefone.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
        
        if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dígitos
        
        if (value.length > 10) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        } else if (value.length > 6) {
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        } else if (value.length > 0) {
            value = value.replace(/^(\d{0,2})/, '($1');
        }
        
        e.target.value = value;
    });
}

// Máscara e validação automática para a Data de Nascimento em PT-BR (DD/MM/AAAA)
function setupMascaraData() {
    const inputData = document.getElementById('data-nascimento');
    
    inputData.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
        if (value.length > 8) value = value.slice(0, 8);

        if (value.length > 4) {
            value = value.replace(/^(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,2})/, '$1/$2');
        }

        e.target.value = value;
    });
}

// Transição entre Etapas
function goToStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    document.getElementById(`step-${stepNumber}`).classList.add('active');
}

// Etapa 1: Cadastro
function setupFormCadastro() {
    document.getElementById('form-cadastro').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const dataInput = document.getElementById('data-nascimento').value;
        if (dataInput.length < 10) {
            alert('Por favor, informe a data de nascimento completa no formato DD/MM/AAAA.');
            return;
        }

        sessionData.participante = {
            nome: document.getElementById('nome').value,
            dataNascimento: dataInput,
            telefone: document.getElementById('telefone').value,
            sexo: document.getElementById('sexo').value
        };
        sessionData.testeSelecionado = document.getElementById('tipo-teste').value;
        goToStep(2);
    });

    document.getElementById('btn-iniciar-execucao').addEventListener('click', () => {
        initTestBoard();
        goToStep(3);
    });
}

// Etapa 3: Inicialização do Teste
function initTestBoard() {
    const palette = COLOR_PALETTES[sessionData.testeSelecionado];
    const fixedContainer = document.getElementById('fixed-container');
    const targetSlots = document.getElementById('target-slots');
    const piecesPool = document.getElementById('pieces-pool');

    fixedContainer.innerHTML = '';
    targetSlots.innerHTML = '';
    piecesPool.innerHTML = '';

    // Peça Fixa 0
    fixedContainer.appendChild(createPieceElement(palette[0]));

    // 15 peças móveis embaralhadas
    const shuffled = [...palette.slice(1)].sort(() => Math.random() - 0.5);
    shuffled.forEach(data => piecesPool.appendChild(createPieceElement(data)));

    if (sortableTarget) sortableTarget.destroy();
    if (sortablePool) sortablePool.destroy();

    const sortableOptions = {
        group: 'colors',
        animation: 150,
        forceFallback: true,      
        fallbackOnBody: true,     
        fallbackTolerance: 5,
        delay: 150,
        delayOnTouchOnly: true
    };

    sortableTarget = new Sortable(targetSlots, { group: 'colors', animation: 150 });
    sortablePool = new Sortable(piecesPool, { group: 'colors', animation: 150 });
}

function createPieceElement(data) {
    const div = document.createElement('div');
    div.className = 'color-piece' + (data.fixed ? ' fixed' : '');
    div.style.backgroundColor = data.hex;
    div.dataset.id = data.id; // ID Oculto do participante

    // Adiciona o evento de clique (se não for a peça fixa)
    if (!data.fixed) {
        div.addEventListener('click', function() {
            const targetSlots = document.getElementById('target-slots');
            const pool = document.getElementById('pieces-pool');

            if (this.parentNode === pool) {
                targetSlots.appendChild(this);
                
                const wrapper = document.querySelector('.target-slots-wrapper');
                if (wrapper) {
                    setTimeout(() => {
                        wrapper.scrollTo({
                            left: wrapper.scrollWidth,
                            behavior: 'smooth'
                        });
                    }, 50); // Breve atraso para o navegador desenhar a peça antes de medir o espaço
                }
            } 
            // Se a peça já estiver no trilho de cima, devolve para o painel de baixo
            else if (this.parentNode === targetSlots) {
                pool.appendChild(this);
            }
        });
    }

    return div;
}

// Validação silenciosa (sem expor erros)
function validateTest() {
    const targetSlots = document.getElementById('target-slots');
    const piecesInTarget = targetSlots.querySelectorAll('.color-piece');

    if (piecesInTarget.length < 15) {
        showModal('Atenção', 'Por favor, arraste todas as 15 peças coloridas para a sequência antes de finalizar.', 'OK');
        return;
    }

    const userSeq = [0];
    piecesInTarget.forEach(p => userSeq.push(parseInt(p.dataset.id)));

    let isCorrect = userSeq.every((val, index) => val === index);

    sessionData.tentativas.push({
        tentativa: currentAttempt,
        sequencia: userSeq,
        correto: isCorrect,
        timestamp: new Date().toISOString()
    });

    if (isCorrect || currentAttempt >= maxAttempts) {
        setupPreferenciasPage();
        goToStep(4);
    } else {
        const remaining = maxAttempts - currentAttempt;
        
        showModal('Atenção', `Você tem mais ${remaining} tentativa(s).`, 'Tentar novamente');
        
        currentAttempt++;
        document.getElementById('attempt-counter').innerText = `Tentativa ${currentAttempt} de 3`;
    }
}

// Etapa 4: Preferências de Cores
function setupPreferenciasPage() {
    const palette = COLOR_PALETTES[sessionData.testeSelecionado];
    const likeGrid = document.getElementById('pref-like-grid');
    const dislikeGrid = document.getElementById('pref-dislike-grid');

    likeGrid.innerHTML = '';
    dislikeGrid.innerHTML = '';

    palette.forEach(data => {
        const p1 = createPieceElement(data);
        p1.onclick = () => {
            likeGrid.querySelectorAll('.color-piece').forEach(el => el.style.border = 'none');
            p1.style.border = '3px solid var(--color-primary)';
            sessionData.preferencias.maisGostou = data.id;
        };
        likeGrid.appendChild(p1);

        const p2 = createPieceElement(data);
        p2.onclick = () => {
            dislikeGrid.querySelectorAll('.color-piece').forEach(el => el.style.border = 'none');
            p2.style.border = '3px solid var(--color-text-muted)';
            sessionData.preferencias.menosGostou = data.id;
        };
        dislikeGrid.appendChild(p2);
    });
}

function setupEventListeners() {
    document.getElementById('btn-submit').addEventListener('click', validateTest);
    document.getElementById('btn-reset').addEventListener('click', initTestBoard);
    document.getElementById('modal-btn').addEventListener('click', () => {
        document.getElementById('feedback-modal').classList.remove('active');
    });
    
    document.getElementById('btn-salvar-preferencias').addEventListener('click', () => {
        if (sessionData.preferencias.maisGostou === null || sessionData.preferencias.menosGostou === null) {
            alert('Por favor, selecione as duas preferências antes de continuar.');
            return;
        }
        console.log('Payload Final do Participante:', JSON.stringify(sessionData, null, 2));
        goToStep(5);
    });
}

function showModal(title, msg, btn) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = msg;
    document.getElementById('modal-btn').innerText = btn;
    document.getElementById('feedback-modal').classList.add('active');
}