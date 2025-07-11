// This file contains the main game logic for the multiplication game.
// It handles user interactions, game flow, and updates the UI based on user input and game state.

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let currentDifficulty = '';
let questionStatus = []; // Track status of each question: 'pending', 'correct', 'incorrect'
let incorrectQuestions = []; // Store indices of questions that were answered incorrectly
let questionsAsked = 0; // Counter for questions asked
let mainProgressIndex = 0; // Track main progression through new questions
let isRetryQuestion = false; // Flag to know if current question is a retry

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
    mainProgressIndex = 0;
    isRetryQuestion = false;
    
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
        keepInputFocused();
    }, 150);
    
    // Update progress table to highlight current question
    updateProgressTable();
}

function checkAnswer() {
    const userAnswer = parseInt(document.getElementById('answer').value);
    const correctAnswer = questions[currentQuestionIndex].answer;
    const feedbackElement = document.getElementById('feedback');
    
    if (userAnswer === correctAnswer) {
        score++;
        feedbackElement.textContent = 'נכון! 🎉';
        feedbackElement.className = 'correct';
        questionStatus[currentQuestionIndex] = 'correct';
        
        // Play correct sound
        playSound('correct');
        
        // Remove from incorrect questions if it was there
        const incorrectIndex = incorrectQuestions.indexOf(currentQuestionIndex);
        if (incorrectIndex > -1) {
            incorrectQuestions.splice(incorrectIndex, 1);
        }
    } else {
        feedbackElement.textContent = `לא נכון. התשובה הנכונה היא ${correctAnswer}`;
        feedbackElement.className = 'incorrect';
        questionStatus[currentQuestionIndex] = 'incorrect';
        
        // Play incorrect sound
        playSound('incorrect');
        
        // Add to incorrect questions if not already there
        if (!incorrectQuestions.includes(currentQuestionIndex)) {
            incorrectQuestions.push(currentQuestionIndex);
        }
    }
    
    questionsAsked++;
    
    // Update progress table
    updateProgressTable();
    
    // Hide submit button
    document.getElementById('submit').style.display = 'none';
    
    // Auto-advance to next question after 2 seconds
    setTimeout(() => {
        nextQuestion();
        // Keep focus on input for better mobile experience
        keepInputFocused();
    }, 2000);
}

// Function to maintain input focus across different devices
function keepInputFocused() {
    const answerInput = document.getElementById('answer');
    if (!answerInput) return;
    
    // Clear any existing value and prepare for new input
    answerInput.value = '';
    
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // iOS specific handling - more reliable approach
        setTimeout(() => {
            answerInput.removeAttribute('readonly');
            answerInput.focus();
            // Trigger click to ensure virtual keyboard appears
            answerInput.click();
            answerInput.select();
        }, 50);
    } else if (/Android/i.test(navigator.userAgent)) {
        // Android specific handling - usually more straightforward
        setTimeout(() => {
            answerInput.focus();
            answerInput.click();
            // Force focus with additional event
            const event = new Event('touchstart', { bubbles: true });
            answerInput.dispatchEvent(event);
        }, 50);
    } else {
        // Desktop and other devices
        setTimeout(() => {
            answerInput.focus();
            answerInput.select();
        }, 50);
    }
}

function nextQuestion() {
    // Decision logic for next question
    const hasMoreNewQuestions = mainProgressIndex < questions.length - 1;
    const remainingNewQuestions = questions.length - 1 - mainProgressIndex;
    
    // Only retry incorrect questions if:
    // 1. There are incorrect questions
    // 2. We have fewer than 5 remaining new questions OR random chance (25%)
    // 3. We're not currently doing a retry question
    const shouldRetryIncorrect = incorrectQuestions.length > 0 && 
                                !isRetryQuestion && 
                                hasMoreNewQuestions &&
                                (remainingNewQuestions <= 5 || Math.random() < 0.25);
    
    if (isRetryQuestion) {
        // If we just did a retry question, return to main progression at the NEXT question
        isRetryQuestion = false;
        if (hasMoreNewQuestions) {
            mainProgressIndex++;
            currentQuestionIndex = mainProgressIndex;
            displayQuestion();
        } else {
            // No more new questions, continue with incorrect ones
            if (incorrectQuestions.length > 0) {
                const randomIncorrectIndex = Math.floor(Math.random() * incorrectQuestions.length);
                currentQuestionIndex = incorrectQuestions[randomIncorrectIndex];
                isRetryQuestion = true;
                displayQuestion();
            } else {
                endGame();
            }
        }
    } else if (shouldRetryIncorrect) {
        // Sometimes retry an incorrect question during main progression
        const randomIncorrectIndex = Math.floor(Math.random() * incorrectQuestions.length);
        currentQuestionIndex = incorrectQuestions[randomIncorrectIndex];
        isRetryQuestion = true;
        displayQuestion();
    } else if (hasMoreNewQuestions) {
        // Continue with next new question in main progression
        mainProgressIndex++;
        currentQuestionIndex = mainProgressIndex;
        displayQuestion();
    } else if (incorrectQuestions.length > 0) {
        // If no more new questions, focus on incorrect ones
        const randomIncorrectIndex = Math.floor(Math.random() * incorrectQuestions.length);
        currentQuestionIndex = incorrectQuestions[randomIncorrectIndex];
        isRetryQuestion = true;
        displayQuestion();
    } else {
        // All questions answered correctly
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
    mainProgressIndex = 0;
    isRetryQuestion = false;
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
    
    // Start with the first question
    currentQuestionIndex = 0;
    mainProgressIndex = 0;
    isRetryQuestion = false;
    
    // Update difficulty display
    document.getElementById('current-difficulty').textContent = `רמת קושי: ${difficultyNames[difficulty]}`;
    
    showScreen('game-screen');
    displayQuestion();
    
    // Ensure input gets focus immediately after showing game screen
    setTimeout(() => {
        keepInputFocused();
    }, 200);
}

function backToMenu() {
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

    // Game controls
    const answerInput = document.getElementById('answer');
    const submitButton = document.getElementById('submit');
    const backButton = document.getElementById('back-to-menu');

    submitButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default behavior that might close keyboard
        // Ensure audio is initialized on first interaction
        initAudio();
        checkAnswer();
        
        // Keep keyboard open on mobile devices
        setTimeout(() => {
            const answerInput = document.getElementById('answer');
            if (answerInput) {
                // Different approach for different mobile platforms
                if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                    // iOS specific handling
                    answerInput.focus();
                    answerInput.blur();
                    setTimeout(() => answerInput.focus(), 50);
                } else if (/Android/i.test(navigator.userAgent)) {
                    // Android specific handling
                    answerInput.focus();
                    // Android usually handles focus better, but ensure it's maintained
                    setTimeout(() => {
                        if (document.activeElement !== answerInput) {
                            answerInput.focus();
                        }
                    }, 100);
                } else {
                    // Desktop or other devices
                    answerInput.focus();
                }
            }
        }, 100);
    });
    
    backButton.addEventListener('click', backToMenu);

    // Allow Enter key to submit answer
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && submitButton.style.display !== 'none') {
            e.preventDefault(); // Prevent form submission
            e.stopPropagation(); // Stop event bubbling
            initAudio();
            checkAnswer();
        }
    });

    // Additional Enter key handling for mobile
    answerInput.addEventListener('input', (e) => {
        // On mobile, sometimes Enter triggers input event
        if (e.inputType === 'insertLineBreak' && submitButton.style.display !== 'none') {
            e.preventDefault();
            initAudio();
            checkAnswer();
        }
    });

    // Better mobile keyboard handling
    answerInput.addEventListener('keydown', (e) => {
        // Handle Enter key specifically
        if (e.key === 'Enter' && submitButton.style.display !== 'none') {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        
        // Allow: backspace, delete, tab, escape, enter
        if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true) ||
            // Allow: home, end, left, right, down, up
            (e.keyCode >= 35 && e.keyCode <= 40)) {
            return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });

    // Additional mobile-specific event handlers
    answerInput.addEventListener('blur', (e) => {
        // Prevent input from losing focus accidentally on mobile
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            setTimeout(() => {
                if (document.getElementById('game-screen').style.display !== 'none' && 
                    document.getElementById('submit').style.display !== 'none') {
                    answerInput.focus();
                }
            }, 100);
        }
    });

    // Handle touch events for mobile devices
    answerInput.addEventListener('touchstart', (e) => {
        // Ensure input is focused when touched
        setTimeout(() => {
            answerInput.focus();
        }, 10);
    });

    // Handle virtual keyboard "go/send" button  
    answerInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
            if (submitButton.style.display !== 'none') {
                e.preventDefault();
                initAudio();
                checkAnswer();
            }
        }
    });

    // Remove any non-numeric characters on paste
    answerInput.addEventListener('paste', (e) => {
        setTimeout(() => {
            const value = answerInput.value.replace(/[^0-9]/g, '');
            answerInput.value = value;
        }, 10);
    });

    // Start with opening screen
    showScreen('opening-screen');
});