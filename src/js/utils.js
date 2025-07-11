// Utility functions for the multiplication game

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function formatNumber(num) {
    return num.toLocaleString('he-IL');
}

// Sound functions using Web Audio API
let audioContext;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!audioContext) {
        initAudio();
    }
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playCorrectSound() {
    initAudio();
    // Happy sound - ascending notes
    setTimeout(() => playTone(523.25, 0.15, 'sine', 0.3), 0);    // C5
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.3), 100);  // E5
    setTimeout(() => playTone(783.99, 0.3, 'sine', 0.3), 200);   // G5
}

function playIncorrectSound() {
    initAudio();
    // Simple "buzzer" sound - classic error sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Low frequency "buzz" sound
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    oscillator.type = 'square'; // Square wave for classic buzzer sound
    
    // Short buzz
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playSound(soundType) {
    try {
        if (soundType === 'correct') {
            playCorrectSound();
        } else if (soundType === 'incorrect') {
            playIncorrectSound();
        }
    } catch (error) {
        console.log('Sound not supported in this browser');
    }
}

function saveScore(difficulty, score, total) {
    // Save score to localStorage for future use
    const scoreData = {
        difficulty,
        score,
        total,
        percentage: Math.round((score / total) * 100),
        date: new Date().toISOString()
    };
    
    let scores = JSON.parse(localStorage.getItem('multiplicationGameScores') || '[]');
    scores.push(scoreData);
    
    // Keep only last 10 scores
    if (scores.length > 10) {
        scores = scores.slice(-10);
    }
    
    localStorage.setItem('multiplicationGameScores', JSON.stringify(scores));
}

function getHighScores() {
    return JSON.parse(localStorage.getItem('multiplicationGameScores') || '[]');
}