// Inicialització del canvas i el context WebGL
const canvas = document.getElementById('gameCanvas');
const gl = canvas.getContext('webgl');

// Verificar que WebGL estigui disponible
if (!gl) {
    console.error("No s'ha pogut inicialitzar WebGL.");
}

// Variables globals per a la bola i el paddle
let ballRadius = 10;
let x = canvas.width / 2; // Posició inicial de la pilota al centre
let y = canvas.height - 30; // Posició inicial de la pilota
let dx = 2; // Velocitat de la bola en l'eix X
let dy = -2; // Velocitat de la bola en l'eix Y

const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;

let isPaused = false; // Estat del joc

// Gestió de les tecles
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

function keyDownHandler(e) {
    if (e.key === 'Escape') {
        togglePause(); // Pausar o continuar el joc
    }
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

// Shaders
const vertexShaderSource = `
    attribute vec2 a_position;
    uniform vec2 u_resolution;
    uniform float u_pointSize; // Afegit per controlar la mida del punt
    void main() {
        vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
        gl_PointSize = u_pointSize; // Utilitzar la mida especificada per al punt
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;
    void main() {
        gl_FragColor = u_color;
    }
`;

// Compile shader
function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    }
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

// Initialize shaders
const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

// Create program
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// Set up position attribute
const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
const colorUniformLocation = gl.getUniformLocation(program, "u_color");
const pointSizeUniformLocation = gl.getUniformLocation(program, "u_pointSize"); // Afegit per a la mida del punt

gl.enableVertexAttribArray(positionAttributeLocation);
gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

// Buffers
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Variables per als punts aleatoris
const randomPoints = [];
const randomColors = [];
const randomSizes = [];
const numPoints = 20; // Nombre de punts aleatoris
let score = 0; // Inicialitzar la puntuació

// Generar punts aleatoris amb colors i mides diferents
for (let i = 0; i < numPoints; i++) {
    const xPos = Math.random() * canvas.width; // Posició aleatòria en l'eix X
    const yPos = Math.random() * (canvas.height / 2); // Posició aleatòria en l'eix Y (meitat superior del canvas)
    const r = Math.random(); // Color aleatori (Red)
    const g = Math.random(); // Color aleatori (Green)
    const b = Math.random(); // Color aleatori (Blue)
    const size = Math.random() * 15 + 5; // Mida aleatòria entre 5 i 20 píxels

    randomPoints.push({ x: xPos, y: yPos });
    randomColors.push({ r, g, b });
    randomSizes.push(size); // Guardar la mida aleatòria
}

// Funció per dibuixar la bola
function drawBall() {
    const numSegments = 30; // Number of segments to make the circle smooth
    const positions = [];

    // Create vertices for the circle
    for (let i = 0; i <= numSegments; i++) {
        const angle = (i / numSegments) * 2 * Math.PI; // Angle in radians
        const dx = ballRadius * Math.cos(angle); // X coordinate
        const dy = ballRadius * Math.sin(angle); // Y coordinate
        positions.push(x + dx, y + dy); // Add the offset
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4f(colorUniformLocation, 0.0, 0.6, 1.0, 1.0); // Color de la bola
    gl.drawArrays(gl.TRIANGLE_FAN, 0, numSegments + 1); // Utilitzant TRIANGLE_FAN
}

// Funció per dibuixar el paddle amb LINES i TRIANGLES
function drawPaddle() {
    // Utilitzar TRIANGLES per al paddle
    const paddlePositions = new Float32Array([
        paddleX, canvas.height - paddleHeight,           // Bottom left
        paddleX + paddleWidth, canvas.height - paddleHeight, // Bottom right
        paddleX, canvas.height,                            // Top left
        paddleX + paddleWidth, canvas.height,             // Top right
    ]);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, paddlePositions, gl.STATIC_DRAW);
    
    // Dibuixar el paddle com a TRIANGLE_STRIP
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4f(colorUniformLocation, ...hexToRgb(document.getElementById('paddleColor').value), 1.0); // Color de la pala
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); // Dibuixar el paddle
}

// Funció per dibuixar punts aleatoris
function drawRandomPoints() {
    for (let i = 0; i < randomPoints.length; i++) {
        const { x: pointX, y: pointY } = randomPoints[i];
        const size = randomSizes[i];

        // Configurar color i mida
        gl.uniform4f(colorUniformLocation, randomColors[i].r, randomColors[i].g, randomColors[i].b, 1.0); // Color del punt
        gl.uniform1f(pointSizeUniformLocation, size); // Mida del punt

        // Dibuixar el punt
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const pointPositions = new Float32Array([pointX, pointY]);
        gl.bufferData(gl.ARRAY_BUFFER, pointPositions, gl.STATIC_DRAW);
        gl.drawArrays(gl.POINTS, 0, 1); // Dibuixar el punt
    }
}

// Funció per comprovar les col·lisions entre la bola i els punts
function checkBallCollisionWithPoints() {
    for (let i = 0; i < randomPoints.length; i++) {
        const { x: pointX, y: pointY } = randomPoints[i];
        const size = randomSizes[i];

        // Comprovar col·lisió
        if (
            x + ballRadius >= pointX - size / 2 &&
            x - ballRadius <= pointX + size / 2 &&
            y + ballRadius >= pointY - size / 2 &&
            y - ballRadius <= pointY + size / 2
        ) {
            // Incrementar la puntuació i eliminar el punt
            score++;

            // Comprovar si la puntuació és múltiple de 5
            if (score % 5 === 0) {
                dx *= 1.1; // Augmentar la velocitat de la pilota en un 10%
                dy *= 1.1;
            }

            // Reiniciar el punt
            randomPoints[i] = {
                x: Math.random() * canvas.width,
                y: Math.random() * (canvas.height / 2),
            };
            randomColors[i] = {
                r: Math.random(),
                g: Math.random(),
                b: Math.random(),
            };
            randomSizes[i] = Math.random() * 15 + 5; // Nova mida
        }
    }
}

// Funció per dibuixar el canvas
function draw() {
    gl.clearColor(1.0, 1.0, 1.0, 1.0); // Neteja el canvas amb blanc
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    drawBall();
    drawPaddle();
    drawRandomPoints();
    checkBallCollisionWithPoints(); // Comprovar col·lisió

    // Mostrar la puntuació a la part superior
    document.getElementById('score').innerText = `Puntuació: ${score}`;

    // Moure la bola si no està en pausa
    if (!isPaused) {
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
                resetGame(); // Reiniciar joc
            }
        }

        // Controlar el paddle
        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7; // Mou el paddle a la dreta
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 7; // Mou el paddle a l'esquerra
        }
    }

    requestAnimationFrame(draw); // Crida la funció de dibuix en el següent frame
}

// Funció per reiniciar el joc
function resetGame() {
    // Reiniciar la posició de la pilota al centre
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 2; // Restablir velocitat
    dy = -2;
    paddleX = (canvas.width - paddleWidth) / 2; // Restablir la posició del paddle
    score = 0; // Reiniciar la puntuació
}

// Funció per alternar entre pausa i continuació
function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseMenu').style.display = isPaused ? 'block' : 'none'; // Mostrar o amagar el menú de pausa
}

// Funció per continuar el joc
document.getElementById('continueButton').addEventListener('click', function() {
    togglePause(); // Tornar a continuar el joc
});

// Funció per reiniciar el joc des del menú de pausa
document.getElementById('restartButton').addEventListener('click', function() {
    resetGame(); // Reiniciar el joc
    togglePause(); // Tornar a continuar el joc
});
// Funció per sortir al menú
document.getElementById('exitButton').addEventListener('click', function() {
    window.close();
    window.open('index.html');
});

// Funció per canviar el color de la pala
document.getElementById('paddleColor').addEventListener('input', function() {
    // Actualitzar el color de la pala immediatament
    drawPaddle();
});

// Funció per convertir hex a RGB
function hexToRgb(hex) {
    const bigint = parseInt(hex.replace(/^#/, ''), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r / 255, g / 255, b / 255]; // Retornar com a valors entre 0 i 1
}

// Iniciar el joc
draw();