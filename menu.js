// Quan es faci clic al botó "Inici", redirigim a la pàgina main.html
document.getElementById('startButton').addEventListener('click', () => {
    window.location.href = 'main.html';  // Redirigeix a la pàgina en blanc
});

// Quan es faci clic al botó "Sortir", intentem tancar la pestanya
document.getElementById('exitButton').addEventListener('click', () => {
    window.close();  
});