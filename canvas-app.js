export class CanvasApp {
    constructor(canvasId, coordsDisplayId, pathsListId, drawModeBtnId, clearPathsBtnId, gridSize = 10) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext("2d");
        this.coordsDisplay = document.getElementById(coordsDisplayId);
        this.pathsList = document.getElementById(pathsListId);
        this.drawModeBtn = document.getElementById(drawModeBtnId);
        this.clearPathsBtn = document.getElementById(clearPathsBtnId);

        this.gridSize = gridSize; // <-- Tamaño de la cuadrícula

        this.isDrawing = false;
        this.drawMode = false;
        this.paths = [];
        this.currentPath = [];
        this.hoveredPathIdx = null;

        this.resizeCanvas();
        this.render();
        this.updatePathsList();

        // Eventos
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseout', this.onMouseOut.bind(this));
        window.addEventListener('resize', this.onResize.bind(this));
        this.drawModeBtn.addEventListener('click', this.toggleDrawMode.bind(this));
        this.clearPathsBtn.addEventListener('click', this.clearAllPaths.bind(this));
    }

    toggleDrawMode() {
        this.drawMode = !this.drawMode;
        this.drawModeBtn.classList.toggle('bg-green-600', this.drawMode);
        this.drawModeBtn.classList.toggle('bg-blue-500', !this.drawMode);
        // Cambia solo el texto, no el ícono
        const textSpan = this.drawModeBtn.querySelector('#draw-mode-text');
        if (textSpan) {
            textSpan.textContent = this.drawMode ? 'Modo trazo activo' : 'Dibujar trazo';
        }
    }

    onMouseDown(event) {
        if (!this.drawMode) return;
        this.isDrawing = true;
        this.currentPath = [];
        const mousePos = this.getMousePos(event);
        this.currentPath.push(mousePos);
    }

    finishCurrentPath() {
        this.isDrawing = false;
        if (this.drawMode && this.currentPath.length > 1) {
            this.paths.push(this.currentPath);
            this.updatePathsList();
        }
        this.currentPath = [];
        this.render();
    }

    onMouseUp(event) {
        if (!this.drawMode) return;
        this.finishCurrentPath();
    }

    onMouseMove(event) {
        const mousePos = this.getMousePos(event);
        this.coordsDisplay.textContent = `Coordenadas: (x: ${Math.round(mousePos.x)}, y: ${Math.round(mousePos.y)})`;
        if (this.isDrawing && this.drawMode) {
            this.currentPath.push(mousePos);
        }
        this.render(mousePos);
    }

    onMouseOut(event) {
        this.coordsDisplay.textContent = 'Coordenadas: (x: 0, y: 0)';
        if (!this.drawMode) return;
        this.finishCurrentPath();
    }

    onResize() {
        this.resizeCanvas();
        this.render();
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    drawGrid() {
        const ctx = this.context;
        ctx.fillStyle = '#041e47';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.strokeStyle = 'silver';
        ctx.lineWidth = 0.1;
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
    }

    drawPath(path, color = 'white') {
        if (path.length < 2) return;
        const ctx = this.context;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
        ctx.restore();
    }

    drawAllPaths() {
        this.paths.forEach((path, idx) => {
            if (idx === this.hoveredPathIdx) {
                this.drawPath(path, 'red');
            } else {
                this.drawPath(path, 'white');
            }
        });
        if (this.isDrawing && this.currentPath.length > 1) {
            this.drawPath(this.currentPath);
        }
    }

    render(mousePos = null) {
        this.drawGrid();
        this.drawAllPaths();
        // Puedes agregar drawTracker aquí si lo deseas
    }

    getMousePos(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    updatePathsList() {
        this.pathsList.innerHTML = '';

        const clearBtn = this.clearPathsBtn;
        if (this.paths.length === 0) {
            clearBtn.classList.add('hidden');

            // Card de "Aún no hay trazos"
            const emptyCard = document.createElement('li');
            emptyCard.className = 'bg-white text-gray-700 px-4 py-3 rounded shadow text-center';
            emptyCard.textContent = 'Aún no hay trazos';
            this.pathsList.appendChild(emptyCard);
            return;
        } else {
            clearBtn.classList.remove('hidden');
        }

        // Recorre los trazos del más nuevo al más antiguo
        for (let idx = this.paths.length - 1; idx >= 0; idx--) {
            const path = this.paths[idx];
            const li = document.createElement('li');
            li.className = 'flex items-center justify-between bg-white px-4 py-2 rounded shadow cursor-pointer transition-colors duration-200';

            // Evento para resaltar el trazo al pasar el mouse
            li.addEventListener('mouseenter', () => {
                this.hoveredPathIdx = idx;
                li.classList.add('bg-blue-600');
                li.classList.remove('text-white');
                this.render();
            });
            li.addEventListener('mouseleave', () => {
                this.hoveredPathIdx = null;
                li.classList.remove('bg-blue-600');
                this.render();
            });

            li.innerHTML = `
                <span class="text-sm text-black">Trazo ${idx + 1}</span>
                <button 
                    data-idx="${idx}" 
                    class="delete-path-btn text-gray-400 hover:text-red-600 transition-colors duration-200 relative group"
                    aria-label="Eliminar trazo"
                >
                    <i class="fas fa-trash"></i>
                    <span class="absolute left-1/2 -translate-x-1/2 -top-8 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10">
                        Eliminar trazo
                    </span>
                </button>
            `;
            this.pathsList.appendChild(li);
        }

        // Listeners para eliminar
        this.pathsList.querySelectorAll('.delete-path-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-idx'));
                this.paths.splice(idx, 1);
                this.updatePathsList();
                this.render();
            });
        });
    }

    clearAllPaths() {
        this.paths = [];
        this.currentPath = [];
        this.hoveredPathIdx = null;
        this.updatePathsList();
        this.render();
    }
}