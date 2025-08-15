class NeonJigsawPuzzle {
    constructor() {
        this.GRID_SIZE = 4;
        this.TILE_COUNT = 16;
        this.puzzleImages = [
            'p1.jpg',
            'p2.jpg',
            'p3.jpg',
            'p4.jpg',
            'p5.jpg',
            'p6.jpg'
        ];

        this.currentImageIndex = 0;
        this.tiles = [];
        this.moves = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.isGameActive = false;
        this.isSolved = false;

        this.draggedTile = null;

        this.initializeElements();
        this.setupEventListeners();
        this.initializeGame();
    }

    initializeElements() {
        this.puzzleContainer = document.getElementById('puzzle-container');
        this.movesDisplay = document.getElementById('moves');
        this.timerDisplay = document.getElementById('timer');
        this.statusDisplay = document.getElementById('status');
        this.shuffleBtn = document.getElementById('shuffle-btn');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.toast = document.getElementById('toast');
        this.confettiCanvas = document.getElementById('confetti-canvas');
        this.confettiCtx = this.confettiCanvas.getContext('2d');

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    setupEventListeners() {
        this.shuffleBtn.addEventListener('click', () => this.shufflePuzzle());
        this.newGameBtn.addEventListener('click', () => this.newGame());
    }

    resizeCanvas() {
        this.confettiCanvas.width = window.innerWidth;
        this.confettiCanvas.height = window.innerHeight;
    }

    initializeGame() {
        this.createTiles();
        this.shufflePuzzle();
        this.resetStats();
    }

    createTiles() {
        this.puzzleContainer.innerHTML = '';
        this.tiles = [];

        const currentImage = this.puzzleImages[this.currentImageIndex];

        for (let i = 0; i < this.TILE_COUNT; i++) {
            const tile = document.createElement('div');
            tile.className = 'puzzle-tile';
            tile.draggable = true;

            const row = Math.floor(i / this.GRID_SIZE);
            const col = i % this.GRID_SIZE;

            tile.style.backgroundImage = `url("${currentImage}")`;
            tile.style.backgroundPosition = `-${col * 100}px -${row * 100}px`;

            tile.dataset.correctIndex = i;
            tile.dataset.currentIndex = i;

            this.setupTileEvents(tile);

            this.puzzleContainer.appendChild(tile);
            this.tiles.push(tile);
        }
    }

    setupTileEvents(tile) {
        tile.addEventListener('dragstart', (e) => this.handleDragStart(e, tile));
        tile.addEventListener('dragover', (e) => this.handleDragOver(e, tile));
        tile.addEventListener('drop', (e) => this.handleDrop(e, tile));
        tile.addEventListener('dragend', (e) => this.handleDragEnd(e, tile));
        tile.addEventListener('dragleave', (e) => this.handleDragLeave(e, tile));
    }

    handleDragStart(e, tile) {
        if (this.isSolved) return;

        this.draggedTile = tile;
        tile.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    handleDragOver(e, tile) {
        if (this.isSolved || tile === this.draggedTile) return;

        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        tile.classList.add('drag-over');
    }

    handleDrop(e, tile) {
        if (this.isSolved || tile === this.draggedTile) return;

        e.preventDefault();
        tile.classList.remove('drag-over');

        this.swapTiles(this.draggedTile, tile);
        this.incrementMoves();
        this.checkWin();
    }

    handleDragEnd(e, tile) {
        tile.classList.remove('dragging');
        this.tiles.forEach(t => t.classList.remove('drag-over'));
        this.draggedTile = null;
    }

    handleDragLeave(e, tile) {
        tile.classList.remove('drag-over');
    }

    swapTiles(tile1, tile2) {
        const tile1Index = Array.from(this.puzzleContainer.children).indexOf(tile1);
        const tile2Index = Array.from(this.puzzleContainer.children).indexOf(tile2);

        // Swap positions in DOM
        const tile1NextSibling = tile1.nextSibling;
        const tile2NextSibling = tile2.nextSibling;

        if (tile1NextSibling) {
            this.puzzleContainer.insertBefore(tile2, tile1NextSibling);
        } else {
            this.puzzleContainer.appendChild(tile2);
        }

        if (tile2NextSibling) {
            this.puzzleContainer.insertBefore(tile1, tile2NextSibling);
        } else {
            this.puzzleContainer.appendChild(tile1);
        }

        // Update current indices
        const tempIndex = tile1.dataset.currentIndex;
        tile1.dataset.currentIndex = tile2.dataset.currentIndex;
        tile2.dataset.currentIndex = tempIndex;
    }

    shufflePuzzle() {
        if (this.isSolved) return;

        // Create array of indices and shuffle
        const indices = Array.from({ length: this.TILE_COUNT }, (_, i) => i);

        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        // Rearrange tiles based on shuffled indices
        const fragment = document.createDocumentFragment();
        indices.forEach((originalIndex, newPosition) => {
            const tile = this.tiles[originalIndex];
            tile.dataset.currentIndex = newPosition;
            fragment.appendChild(tile);
        });

        this.puzzleContainer.appendChild(fragment);

        this.startTimer();
        this.showToast('Puzzle shuffled! Start solving!');
    }

    checkWin() {
        const isWin = this.tiles.every((tile, index) => {
            return parseInt(tile.dataset.correctIndex) === parseInt(tile.dataset.currentIndex);
        });

        if (isWin && !this.isSolved) {
            this.handleWin();
        }
    }

    handleWin() {
        this.isSolved = true;
        this.isGameActive = false;
        clearInterval(this.timerInterval);

        this.tiles.forEach(tile => {
            tile.classList.add('solved');
            tile.draggable = false;
        });

        this.puzzleContainer.classList.add('celebrating');
        this.statusDisplay.textContent = 'Game Completed';
        this.shuffleBtn.disabled = true;

        this.showToast('Puzzle completed! Well done!');
        this.createConfetti();

        setTimeout(() => {
            this.animateConfetti();
        }, 500);
    }

    newGame() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.puzzleImages.length;
        this.isSolved = false;
        this.isGameActive = false;

        this.puzzleContainer.classList.remove('celebrating');
        this.shuffleBtn.disabled = false;
        this.statusDisplay.textContent = '';

        this.stopConfetti();
        this.createTiles();
        this.resetStats();
        this.showToast('New puzzle loaded!');
    }

    resetStats() {
        this.moves = 0;
        this.movesDisplay.textContent = '0';
        this.timerDisplay.textContent = '00:00';
        this.startTime = null;
        clearInterval(this.timerInterval);
    }

    incrementMoves() {
        if (!this.isGameActive) {
            this.isGameActive = true;
            this.startTimer();
        }

        this.moves++;
        this.movesDisplay.textContent = this.moves.toString();
    }

    startTimer() {
        if (this.startTime) return;

        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            this.timerDisplay.textContent =
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    showToast(message) {
        this.toast.textContent = message;
        this.toast.classList.add('show');

        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    createConfetti() {
        this.confettiParticles = [];
        const colors = ['#00ff99', '#00ffcc', '#ff0080', '#00ccff', '#ffff00'];

        for (let i = 0; i < 100; i++) {
            this.confettiParticles.push({
                x: Math.random() * this.confettiCanvas.width,
                y: -10,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }
    }

    animateConfetti() {
        if (!this.confettiParticles || this.confettiParticles.length === 0) return;

        this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);

        this.confettiParticles = this.confettiParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1; // gravity
            particle.rotation += particle.rotationSpeed;

            this.confettiCtx.save();
            this.confettiCtx.translate(particle.x, particle.y);
            this.confettiCtx.rotate(particle.rotation * Math.PI / 180);
            this.confettiCtx.fillStyle = particle.color;
            this.confettiCtx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            this.confettiCtx.restore();

            return particle.y < this.confettiCanvas.height + 10;
        });

        if (this.confettiParticles.length > 0) {
            requestAnimationFrame(() => this.animateConfetti());
        }
    }

    stopConfetti() {
        this.confettiParticles = [];
        this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NeonJigsawPuzzle();
});