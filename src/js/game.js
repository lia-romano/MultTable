// This file contains the main game logic for the multiplication game.
// It handles user interactions, game flow, and updates the UI based on user input and game state.

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentDifficulty = '';
let questionStatus = []; // Track status of each question: 'pending', 'correct', 'incorrect'
let incorrectQuestions = []; // Store indices of questions that were answered incorrectly
let questionsAsked = 0; // Counter for questions asked
let isRetryQuestion = false; // Flag to know if current question is a retry
let questionsAfterLastError = 0; // Count questions answered since last error
let lastIncorrectIndex = -1; // Track the last incorrect question for progression logic

// Define difficulty levels
const difficultyLevels = {
    easy: [1, 2, 3, 10],
    medium: [4, 5, 6],
    hard: [7, 8, 9],
    all: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
};

const difficultyNames = {
    easy: 'קל',
    medium: 'בינוני', 
    hard: 'קשה',
    all: 'הכל'
};

function generateQuestions(difficulty) {
    questions = [];
    const numbers = difficultyLevels[difficulty];
    
    for (let i of numbers) {
        for (let j = 1; j <= 10; j++) {
            questions.push({ 
                question: `${i} × ${j}`, 
                answer: i * j,
                originalIndex: questions.length
            });
        }
    }
    
    // Initialize variables
    questionStatus = new Array(questions.length).fill('pending');
    incorrectQuestions = [];
    questionsAsked = 0;
    isRetryQuestion = false;
    questionsAfterLastError = 0;
    lastIncorrectIndex = -1;
    
    shuffleQuestions();
    createProgressTable();
}

function shuffleQuestions() {
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
}

function createProgressTable() {
    const progressTable = document.getElementById('progress-table');
    progressTable.innerHTML = '';
    
    questions.forEach((q, index) => {
        const cell = document.createElement('div');
        cell.className = 'exercise-cell pending';
        cell.textContent = q.question;
        cell.setAttribute('data-index', index);
        progressTable.appendChild(cell);
    });
    
    updateProgressTable();
}

function updateProgressTable() {
    const cells = document.querySelectorAll('.exercise-cell');
    
    cells.forEach((cell, index) => {
        const status = questionStatus[index];
        cell.className = `exercise-cell ${status}`;
        
        // Highlight current question
        if (index === currentQuestionIndex) {
            cell.classList.add('current');
        }
    });
}

function updateProgressIndicator() {
    const progressElement = document.getElementById('progress-indicator');
    const completedQuestions = questionStatus.filter(status => status === 'correct').length;
    const totalQuestions = questions.length;
    const remainingQuestions = totalQuestions - completedQuestions;
    
    if (remainingQuestions === 0) {
        progressElement.textContent = '🎉 כל התרגילים הושלמו!';
        progressElement.style.backgroundColor = '#d4edda';
        progressElement.style.borderColor = '#28a745';
    } else {
        progressElement.textContent = `נשארו ${remainingQuestions} תרגילים מתוך ${totalQuestions}`;
        progressElement.style.backgroundColor = '#e8f6f3';
        progressElement.style.borderColor = '#28a745';
    }
}

function displayQuestion() {
    const questionElement = document.getElementById('question');
    questionElement.textContent = questions[currentQuestionIndex].question;
    
    // Update progress indicator
    updateProgressIndicator();
    
    // Show retry indicator if this is a retry question
    const retryIndicator = document.getElementById('retry-indicator');
    if (isRetryQuestion) {
        retryIndicator.textContent = '🔄 שאלה לתרגול - הזדמנות לתקן!';
        retryIndicator.classList.add('show');
    } else {
        retryIndicator.classList.remove('show');
    }
    
    // Clear previous feedback
    document.getElementById('feedback').textContent = '';
    const answerInput = document.getElementById('answer');
    answerInput.value = '';
    document.getElementById('submit').style.display = 'inline-block';
    
    // Enhanced focus for mobile devices
    setTimeout(() => {
        const answerInput = document.getElementById('answer');
        if (answerInput) {
            answerInput.focus();
            answerInput.click(); // Trigger mobile keyboard
        }
    }, 150);
    
    // Update progress table to highlight current question
    updateProgressTable();
}

function checkAnswer() {
    console.log('checkAnswer called - user submitted an answer');
    const userAnswer = parseInt(document.getElementById('answer').value);
    const correctAnswer = questions[currentQuestionIndex].answer;
    const feedbackElement = document.getElementById('feedback');
    let delayTime = 2000; // Default delay for incorrect answers
    
    if (userAnswer === correctAnswer) {
        score++;
        feedbackElement.textContent = 'נכון! 🎉';
        feedbackElement.className = 'correct';
        questionStatus[currentQuestionIndex] = 'correct';
        delayTime = 800; // Shorter delay for correct answers
        
        // Play correct sound
        playSound('correct');
        
        // Remove from incorrect questions if it was there
        const incorrectIndex = incorrectQuestions.indexOf(currentQuestionIndex);
        if (incorrectIndex > -1) {
            incorrectQuestions.splice(incorrectIndex, 1);
            console.log('Removed from incorrect questions:', currentQuestionIndex);
        }
        
        // Count questions after last error (for progression logic)
        questionsAfterLastError++;
        console.log('Correct answer! questionsAfterLastError now:', questionsAfterLastError);
    } else {
        feedbackElement.textContent = `לא נכון. התשובה הנכונה היא ${correctAnswer}`;
        feedbackElement.className = 'incorrect';
        questionStatus[currentQuestionIndex] = 'incorrect';
        
        // Play incorrect sound
        playSound('incorrect');
        
        // Add to incorrect questions if not already there
        if (!incorrectQuestions.includes(currentQuestionIndex)) {
            incorrectQuestions.push(currentQuestionIndex);
            console.log('Added to incorrect questions:', currentQuestionIndex);
        }
        
        // Reset progression counter and mark this as last error
        questionsAfterLastError = 0;
        lastIncorrectIndex = currentQuestionIndex;
        console.log('Reset questionsAfterLastError to 0, incorrect questions now:', incorrectQuestions);
    }
    
    questionsAsked++;
    
    // Increment global exercise counter for every exercise (correct or incorrect)
    if (typeof incrementExerciseCount === 'function') {
        incrementExerciseCount();
    }
    
    // Increment personal exercise counter for every exercise
    if (typeof incrementPersonalCount === 'function') {
        incrementPersonalCount();
    }
    
    // Update progress table
    updateProgressTable();
    
    // Hide submit button
    document.getElementById('submit').style.display = 'none';
    
    // Auto-advance to next question with dynamic delay
    setTimeout(() => {
        nextQuestion();
        // Keep focus on input
        setTimeout(() => {
            const answerInput = document.getElementById('answer');
            if (answerInput) {
                answerInput.focus();
                answerInput.click();
            }
        }, 100);
    }, delayTime);
}

// Function removed - using simpler approach now

function nextQuestion() {
    // Check if we have completed all questions correctly
    const allCorrect = questionStatus.every(status => status === 'correct');
    
    if (allCorrect) {
        endGame();
        return;
    }
    
    // Debug information
    const pendingQuestions = [];
    for (let i = 0; i < questionStatus.length; i++) {
        if (questionStatus[i] === 'pending') {
            pendingQuestions.push(i);
        }
    }
    
    console.log('=== Next Question Logic ===');
    console.log('- Pending questions:', pendingQuestions.length, pendingQuestions);
    console.log('- Incorrect questions:', incorrectQuestions.length, incorrectQuestions);
    console.log('- Questions after last error:', questionsAfterLastError);
    console.log('- Current question index:', currentQuestionIndex);
    
    let nextIndex = -1;
    
    // Simple logic: 
    // 1. If we haven't progressed 5 questions after an error AND have pending questions -> continue with new
    // 2. Otherwise if we have incorrect questions -> go back to them
    // 3. Otherwise continue with pending
    
    if (questionsAfterLastError < 5 && pendingQuestions.length > 0) {
        nextIndex = pendingQuestions[0];
        isRetryQuestion = false;
        console.log('-> Continuing with new question (need more progress):', nextIndex);
    } else if (incorrectQuestions.length > 0) {
        nextIndex = incorrectQuestions[0];
        isRetryQuestion = true;
        console.log('-> Going back to incorrect question:', nextIndex);
    } else if (pendingQuestions.length > 0) {
        nextIndex = pendingQuestions[0];
        isRetryQuestion = false;
        console.log('-> Continuing with pending question (no incorrect):', nextIndex);
    }
    
    console.log('=== Selected next index:', nextIndex, '===');
    
    // If we found a question to show
    if (nextIndex !== -1) {
        currentQuestionIndex = nextIndex;
        displayQuestion();
    } else {
        console.log('No more questions found, ending game');
        endGame();
    }
}

function endGame() {
    const correctCount = questionStatus.filter(status => status === 'correct').length;
    const percentage = Math.round((correctCount / questions.length) * 100);
    
    document.getElementById('feedback').innerHTML = `
        <div style="font-size: 2rem; margin: 20px 0;">🎊 כל הכבוד! 🎊</div>
        <div style="font-size: 1.2rem; margin: 10px 0;">ענית נכון על ${correctCount} מתוך ${questions.length} תרגילים</div>
        <div style="font-size: 1.1rem;">אחוז הצלחה: ${percentage}%</div>
        <div style="font-size: 0.9rem; margin-top: 10px; color: #666;">שאלות שחזרו: ${questionsAsked - questions.length > 0 ? questionsAsked - questions.length : 0}</div>
    `;
    document.getElementById('question').textContent = '';
    document.getElementById('submit').style.display = 'none';
}

function resetGame() {
    currentQuestionIndex = 0;
    score = 0;
    questions = [];
    questionStatus = [];
    incorrectQuestions = [];
    questionsAsked = 0;
    isRetryQuestion = false;
    questionsAfterLastError = 0;
    lastIncorrectIndex = -1;
}

function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // Show the requested screen
    document.getElementById(screenId).classList.remove('hidden');
}

function startGame(difficulty) {
    currentDifficulty = difficulty;
    resetGame();
    generateQuestions(difficulty);
    
    // Reset session counter when starting new game
    if (typeof resetSessionCounter === 'function') {
        resetSessionCounter();
    }
    
    // Start with the first question (index 0)
    currentQuestionIndex = 0;
    isRetryQuestion = false;
    
    // Update difficulty display
    document.getElementById('current-difficulty').textContent = `רמת קושי: ${difficultyNames[difficulty]}`;
    
    showScreen('game-screen');
    displayQuestion();
    
    // Activate game mode for focus management
    if (window.setGameActive) {
        window.setGameActive(true);
    }
}

function backToMenu() {
    // Deactivate game mode
    if (window.setGameActive) {
        window.setGameActive(false);
    }
    showScreen('opening-screen');
    resetGame();
}

document.addEventListener('DOMContentLoaded', () => {
    // Difficulty selection buttons
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const difficulty = e.target.getAttribute('data-level');
            // Initialize audio context on user interaction
            initAudio();
            startGame(difficulty);
        });
    });

    // Game controls - simplified approach
    const answerForm = document.getElementById('answer-form');
    const answerInput = document.getElementById('answer');
    const submitButton = document.getElementById('submit');
    const backButton = document.getElementById('back-to-menu');

    // Form submission - this handles Enter key naturally
    answerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (submitButton.style.display !== 'none' && answerInput.value.trim() !== '') {
            initAudio();
            checkAnswer();
        }
        return false;
    });

    // Button click
    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (answerInput.value.trim() !== '') {
            initAudio();
            checkAnswer();
        }
    });
    
    backButton.addEventListener('click', backToMenu);

    // Simple input validation - only allow numbers
    answerInput.addEventListener('input', (e) => {
        // Remove non-numeric characters
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        // Limit length
        if (e.target.value.length > 3) {
            e.target.value = e.target.value.substring(0, 3);
        }
    });

    // Simple focus management for mobile
    let isGameActive = false;
    
    function maintainFocus() {
        if (isGameActive && submitButton.style.display !== 'none') {
            setTimeout(() => {
                answerInput.focus();
            }, 100);
        }
    }

    answerInput.addEventListener('blur', () => {
        if (isGameActive) {
            maintainFocus();
        }
    });

    // Update game state management
    window.setGameActive = function(active) {
        isGameActive = active;
        if (active) {
            maintainFocus();
        }
    };

    // Start with opening screen
    showScreen('opening-screen');
});