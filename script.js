
const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe'); 
const clouds = document.querySelector('.clouds'); 
const gameBoard = document.querySelector('.game-board');
const restartButton = document.getElementById('restartButton');

// Sons
const jumpSound = new Audio('./mp3/wolfy_sanic-jump-15984.mp3');
jumpSound.volume = 0.4; // volume mais baixo para o pulo
const gameOverSound = new Audio('./mp3/mario-bros.mp3');

// Música de fundo
const backgroundMusic = new Audio('./mp3/super-mario-bros-music.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 1.0;

// Som de mudança de fase
const faseSound = new Audio('./mp3/super-mario-64-yahoo-sound.mp3');
faseSound.volume = 1.0; // ajusta volume se precisar

// Inicia a música após a primeira interação do usuário
const iniciarMusica = () => {
    backgroundMusic.play();
    document.removeEventListener('keydown', iniciarMusica);
    document.removeEventListener('click', iniciarMusica);
};
document.addEventListener('keydown', iniciarMusica);
document.addEventListener('click', iniciarMusica);

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
