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

// Quan es faci clic al botó "Inici", tanquem finestra i obrim una de nova amb el joc (per evitar que després no es pugui tancar)
startButton.addEventListener('click', () => {
    window.close();
    window.open('main.html');
});

// Quan es faci clic al botó "Sortir", tanquem la finestra
exitButton.addEventListener('click', () => {
    window.close();
});