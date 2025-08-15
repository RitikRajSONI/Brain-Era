const sampleTexts = [
    "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once.",
    "In the realm of technology, innovation drives progress. Software development requires creativity, logic, and persistence.",
    "Programming is like writing poetry with code. Each line should be crafted with purpose and elegance in mind.",
    "The art of typing fast requires practice and dedication. Muscle memory develops through consistent training sessions.",
    "Digital literacy is essential in today's world. Keyboards serve as our primary interface with computer systems."
];

let currentText = '';
let typedText = '';
let currentIndex = 0;
let isGameActive = false;
let startTime = null;
let timeLeft = 60;
let timerInterval = null;
let stats = {
    wpm: 0,
    accuracy: 100,
    correctChars: 0,
    totalChars: 0,
    errors: 0
};

// DOM elements
const textDisplay = document.getElementById('textDisplay');
const typingInput = document.getElementById('typingInput');
const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');
const timerElement = document.getElementById('timer');
const errorsElement = document.getElementById('errors');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultsScreen = document.getElementById('resultsScreen');
const startButton = document.getElementById('startButton');

function initializeGame() {
    currentText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    typedText = '';
    currentIndex = 0;
    isGameActive = false;
    timeLeft = 60;
    startTime = null;
    stats = {
        wpm: 0,
        accuracy: 100,
        correctChars: 0,
        totalChars: 0,
        errors: 0
    };

    updateDisplay();
    renderText();
    resultsScreen.classList.add('hidden');
    startButton.textContent = 'Start Game';
    startButton.style.display = 'inline-block';
}

function startGame() {
    if (!isGameActive) {
        isGameActive = true;
        startTime = Date.now();
        startButton.style.display = 'none';
        typingInput.focus();
        startTimer();
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function calculateStats() {
    const correctChars = typedText.split('').filter((char, i) => char === currentText[i]).length;
    const totalChars = typedText.length;
    const errors = totalChars - correctChars;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;

    if (startTime) {
        const elapsed = Date.now() - startTime;
        const words = correctChars / 5;
        const minutes = elapsed / 60000;
        const wpm = minutes > 0 ? Math.round(words / minutes) : 0;

        stats = {
            wpm,
            accuracy,
            correctChars,
            totalChars,
            errors
        };
    }
}

function updateDisplay() {
    wpmElement.textContent = stats.wpm;
    accuracyElement.textContent = stats.accuracy;
    timerElement.textContent = timeLeft;
    errorsElement.textContent = stats.errors;

    const progress = (currentIndex / currentText.length) * 100;
    progressFill.style.width = progress + '%';
    progressText.textContent = Math.round(progress) + '% Complete';
}

function renderText() {
    textDisplay.innerHTML = '';

    currentText.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = char;

        if (index < typedText.length) {
            if (typedText[index] === char) {
                span.classList.add('correct');
            } else {
                span.classList.add('incorrect');
            }
        } else if (index === currentIndex) {
            span.classList.add('current');
        } else {
            span.classList.add('pending');
        }

        textDisplay.appendChild(span);
    });
}

function endGame() {
    isGameActive = false;
    clearInterval(timerInterval);

    // Final stats calculation
    calculateStats();

    // Show results
    document.getElementById('finalWpm').textContent = stats.wpm;
    document.getElementById('finalAccuracy').textContent = stats.accuracy + '%';
    document.getElementById('finalCorrect').textContent = stats.correctChars;
    document.getElementById('finalErrors').textContent = stats.errors;

    resultsScreen.classList.remove('hidden');
}

function resetGame() {
    clearInterval(timerInterval);
    initializeGame();
    typingInput.value = '';
}

function playAgain() {
    resetGame();
}

// Event listeners
typingInput.addEventListener('input', function (e) {
    if (!isGameActive) {
        startGame();
    }

    typedText = e.target.value;
    currentIndex = typedText.length;

    calculateStats();
    updateDisplay();
    renderText();

    // Check if text is completed
    if (typedText === currentText) {
        endGame();
    }
});

typingInput.addEventListener('keydown', function (e) {
    // Prevent backspace beyond current position
    if (e.key === 'Backspace' && typedText.length === 0) {
        e.preventDefault();
    }
});

// Click on text area to focus input
textDisplay.addEventListener('click', function () {
    if (!resultsScreen.classList.contains('hidden')) return;
    typingInput.focus();
});

// Initialize game on load
window.addEventListener('load', function () {
    initializeGame();
});