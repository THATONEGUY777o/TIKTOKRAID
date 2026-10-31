document.addEventListener('DOMContentLoaded', () => {
    // Configuração oficial do seu banco Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyAWcHshhQWnGPIOBPRe__UyS4B9QKw3Jg8",
        authDomain: "://firebaseapp.com",
        databaseURL: "https://firebaseio.com",
        projectId: "tiktokliveanunciamento",
        storageBucket: "tiktokliveanunciamento.firebasestorage.app",
        messagingSenderId: "565264297620",
        appId: "1:565264297620:web:765ec6e871e5fa7de84e81"
    };

    // Inicializando a conexão externa
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    // ELEMENTOS DA TELA DE SPLASH
    const splashScreen = document.getElementById('splashScreen');
    const enterBtn = document.getElementById('enterBtn');
    const mainContent = document.getElementById('mainContent');
    const bgMusic = document.getElementById('bgMusic');

    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            bgMusic.play().catch(error => console.log("Música travada pelo navegador:", error));
            splashScreen.style.opacity = '0';
            setTimeout(() => {
                splashScreen.style.display = 'none';
                mainContent.style.display = 'block';
            }, 500);
        });
    }

    // SISTEMA DE VALIDAÇÃO DO ANÚNCIO DE LIVES
    const startBtn = document.getElementById('startBtn');
    const listaLives = document.getElementById('listaLives');
    const containerLives = document.getElementById('containerLives');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const inputVal = document.getElementById('tiktokInput').value.trim();
            const codigoDigitado = document.getElementById('validationCodeInput').value.trim().toUpperCase();

            if (!inputVal) return alert('Por favor, insira o criador da live.');
            if (!codigoDigitado) return alert('Por favor, insira o código de validação.');

            // Consulta os códigos ativos no banco Firebase
            database.ref('codigos_gerados').once('value', (snapshot) => {
                let codigoValido = false;
                let chaveDoCodigo = null;

                if (snapshot.exists()) {
                    const dados = snapshot.val();
                    for (let id in dados) {
                        if (dados[id].codigo === codigoDigitado) {
                            codigoValido = true;
                            chaveDoCodigo = id;
                            break;
                        }
                    }
                }

                // Se o código bater com o banco de dados
                if (codigoValido && chaveDoCodigo) {
                    // Remove do Firebase na mesma hora (Garante o Uso Único)
                    database.ref('codigos_gerados/' + chaveDoCodigo).remove();
                    containerLives.style.display = 'block';

                    // Trata a formatação do @ com segurança
                    let username = inputVal;
                    if (!username.startsWith('@')) {
                        username = '@' + username;
                    }

                    // Constrói a linha do anúncio
                    const liveCard = document.createElement('div');
                    liveCard.className = 'live-item';
                    const timerId = 'timer_' + Date.now();

                    liveCard.innerHTML = `
                        <div class="live-info">
                            <img class="avatar" src="https://picsum.photos" alt="Avatar">
                            <div>
                                <strong>Live Ativa</strong><br>
                                <span class="user-text"></span>
                            </div>
                        </div>
                        <div class="timer-display" id="${timerId}">02:00</div>
                    `;

                    liveCard.querySelector('.user-text').textContent = username;
                    listaLives.appendChild(liveCard);

                    // Limpa as caixas de texto
                    document.getElementById('tiktokInput').value = '';
                    document.getElementById('validationCodeInput').value = '';

                    // Dispara o cronômetro independente de 2 minutos
                    let tempoRestante = 120;
                    const liveCountdown = setInterval(() => {
                        tempoRestante--;
                        let minutos = Math.floor(tempoRestante / 60);
                        let segundos = tempoRestante % 60;
                        segundos = segundos < 10 ? '0' + segundos : segundos;
                        minutos = minutos < 10 ? '0' + minutos : minutos;

                        const timerElement = document.getElementById(timerId);
                        if (timerElement) {
                            timerElement.innerText = minutos + ':' + segundos;
                        }

                        if (tempoRestante <= 0) {
                            clearInterval(liveCountdown);
                            liveCard.remove();
                            if (listaLives.children.length === 0) {
                                containerLives.style.display = 'none';
                            }
                        }
                    }, 1000);

                } else {
                    alert('Código inválido ou já utilizado por outra pessoa!');
                }
            });
        });
    }
});
