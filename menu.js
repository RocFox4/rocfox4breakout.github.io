// Crear els elements visuals del menú dinàmicament
const menu = document.createElement('div');
menu.id = 'menu';

const title = document.createElement('h1');
title.textContent = 'Benvingut!';
menu.appendChild(title);

const startButton = document.createElement('button');
startButton.id = 'startButton';
startButton.textContent = 'Inici';
menu.appendChild(startButton);

const exitButton = document.createElement('button');
exitButton.id = 'exitButton';
exitButton.textContent = 'Sortir';
menu.appendChild(exitButton);

// Afegir el menú al document
document.body.appendChild(menu);

// Quan es faci clic al botó "Inici", redirigim a la pàgina main.html
startButton.addEventListener('click', () => {
    window.location.href = 'main.html'; // Redirigeix a la pàgina principal
});

// Quan es faci clic al botó "Sortir", intentem tancar la pestanya
exitButton.addEventListener('click', () => {
    window.close(); 
});