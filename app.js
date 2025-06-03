import { CanvasApp } from './canvas-app.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = new CanvasApp(
        'canvas',
        'coords-display',
        'paths-list',
        'draw-mode-btn',
        'clear-paths-btn' // <-- agrega este parámetro
    );
});