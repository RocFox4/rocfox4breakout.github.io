// Inicialització del canvas i el context 2D
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variables globals per a la bola i el paddle
let ballRadius = 10;
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2; // Velocitat de la bola en l'eix X
let dy = -2; // Velocitat de la bola en l'eix Y

const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;

// Gestió de les tecles
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

// Funció per dibuixar la bola
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// Funció per dibuixar el paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

// Funció per dibuixar el canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Neteja el canvas
    drawBall();
    drawPaddle();

    // Moure la bola
    x += dx;
    y += dy;

    // Comprovar col·lisió amb les parets
    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
        dx = -dx; // Invertir direcció en cas de col·lisió
    }
    if (y + dy < ballRadius) {
        dy = -dy; // Invertir direcció si toca la part superior
    } else if (y + dy > canvas.height - ballRadius) {
        if (x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy; // Col·lisió amb el paddle
        } else {
            // Joc acabat, reiniciar
            alert("Has perdut! Reinicia el joc.");
            document.location.reload();
        }
    }

    // Controlar el paddle
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7; // Mou el paddle a la dreta
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7; // Mou el paddle a l'esquerra
    }

    requestAnimationFrame(draw); // Crida la funció de dibuix en el següent frame
}

draw(); // Inicia el joc