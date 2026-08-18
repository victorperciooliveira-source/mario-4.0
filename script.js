
const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe'); 
const clouds = document.querySelector('.clouds'); 
const gameBoard = document.querySelector('.game-board');
const restartButton = document.getElementById('restartButton');
const orientationWarning = document.getElementById('orientationWarning');
const touchArea = document.getElementById('touchArea');

// Detectar orientação do dispositivo
const checkOrientation = () => {
    const isMobile = window.innerWidth <= 768;
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    
    if (isMobile && isPortrait) {
        orientationWarning.classList.add('show');
        gameBoard.style.display = 'none';
        touchArea.classList.remove('show');
    } else {
        orientationWarning.classList.remove('show');
        gameBoard.style.display = 'block';
        if (isMobile && !isPortrait) {
            touchArea.classList.add('show');
        } else {
            touchArea.classList.remove('show');
        }
    }
};

// Verificar orientação ao carregar e quando mudar
window.addEventListener('load', checkOrientation);
window.addEventListener('orientationchange', checkOrientation);
window.addEventListener('resize', checkOrientation);

// Sons
const jumpSound = new Audio('./maro-jump-sound-effect_1.mp3');
jumpSound.volume = 1.0;
const gameOverSound = new Audio('./mp3/mario-bros.mp3');

// Música de fundo
const backgroundMusic = new Audio('./mp3/mario_3.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 1.0;

// Som de mudança de fase
const faseSound = new Audio('./mp3/super-mario-64-yahoo-sound.mp3');
faseSound.volume = 1.0;

// Inicia a música após a primeira interação do usuário
const iniciarMusica = () => {
    backgroundMusic.play();
    document.removeEventListener('keydown', iniciarMusica);
    document.removeEventListener('click', iniciarMusica);
    document.removeEventListener('touchstart', iniciarMusica);
};
document.addEventListener('keydown', iniciarMusica);
document.addEventListener('click', iniciarMusica);
document.addEventListener('touchstart', iniciarMusica);

// Pular
const jump = () => {
    if (!mario.classList.contains('jump')) {
        mario.classList.add('jump');
        jumpSound.currentTime = 0;
        jumpSound.play();

        setTimeout(() => {
            mario.classList.remove('jump');
        }, 500);
    }
};

document.addEventListener('keydown', jump);

// Suporte a toque (touch) para mobile
document.addEventListener('touchstart', jump);
if (touchArea) {
    touchArea.addEventListener('click', jump);
    touchArea.addEventListener('touchstart', jump);
}

// Pontuação e fase
let pontos = 0;
let fase = 1;
let pontosAtivos = true;
const pontosDisplay = document.getElementById('pontos');
const faseDisplay = document.getElementById('fase');

// Trocar clima baseado na fase
const atualizarClima = () => {
    if (!gameBoard) return;
    gameBoard.classList.remove('day', 'night', 'rainy');

    const clima = fase % 3;
    if (clima === 1) {
        gameBoard.classList.add('day');
    } else if (clima === 2) {
        gameBoard.classList.add('night');
    } else {
        gameBoard.classList.add('rainy');
    }
};

// Ajustar velocidade do cano conforme fase (suave)
const ajustarVelocidadeDoCano = () => {
    const novaDuracao = Math.max(0.6, 1.5 - (fase - 1) * 0.1);
    pipe.style.setProperty("--pipe-speed", `${novaDuracao}s`);
};

const atualizarPontuacao = () => {
    if (!pontosAtivos) return;

    pontos++;
    if (pontosDisplay) pontosDisplay.textContent = String(pontos);

    if (pontos % 600 === 0) {
        fase++;
        if (faseDisplay) faseDisplay.textContent = String(fase);

        // muda clima com pequeno delay para suavizar
        setTimeout(atualizarClima, 300);

        // ajusta velocidade suave
        ajustarVelocidadeDoCano();

        // toca o som da fase
        faseSound.currentTime = 0;
        faseSound.play();
    }

    // ULTRA RÁPIDO: pontuação sobe a cada 5ms no início, ainda mais rápido depois
    const novaVelocidade = Math.max(2, 80 - (fase - 1) * 6);
    setTimeout(atualizarPontuacao, novaVelocidade);
};

atualizarPontuacao();

// Colisão com o cano
const loop = setInterval(() => {
    const pipePosition = pipe.offsetLeft;
    const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

    if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {
        pipe.style.animation = 'none';
        pipe.style.left = `${pipePosition}px`;

        mario.style.animation = 'none';
        mario.style.bottom = `${marioPosition}px`;
        mario.src = './img/game-over.png';
        mario.style.width = '75px';
        mario.style.marginLeft = '50px';

        clearInterval(loop);
        pontosAtivos = false;
        gameOverSound.play();

        // Pausar música de fundo ao morrer
        backgroundMusic.pause();

        // Mostrar botão de reinício
        restartButton.style.display = 'block';
    }
}, 10);

// Reinício
restartButton.addEventListener('click', () => location.reload());

// Tela cheia (quando possível)
document.addEventListener('click', () => {
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
    }
}, { once: true });
