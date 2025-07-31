// Task management system
class TaskManager {
    constructor() {
        this.tasks = [
            'fix-wiring', 'calibrate-distributor', 'divert-power',
            'chart-course', 'stabilize-steering',
            'align-engine', 'fuel-engines',
            'submit-scan', 'prime-shields',
            'clean-o2-filter', 'empty-garbage', 'swipe-card'
        ];
        this.completedTasks = this.loadCompletedTasks();
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
    }

    bindEvents() {
        // Task button clicks
        const taskButtons = document.querySelectorAll('.task-btn');
        console.log(`Found ${taskButtons.length} task buttons to bind events to`);
        
        taskButtons.forEach((btn, index) => {
            console.log(`Binding event to button ${index + 1}: ${btn.dataset.task}`);
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.task;
                console.log(`Task button clicked: ${taskId}`);
                this.navigateToTask(taskId);
            });
            
            // Also add a test click handler to see if the button is clickable
            btn.addEventListener('click', (e) => {
                console.log(`Button ${btn.dataset.task} was clicked!`);
            }, { capture: true });
        });

        // Reset button
        document.getElementById('resetProgress')?.addEventListener('click', () => {
            this.resetAllTasks();
        });

        // Listen for task completion from individual task pages
        window.addEventListener('storage', () => {
            this.completedTasks = this.loadCompletedTasks();
            this.updateUI();
        });

        // Listen for custom task completion events
        window.addEventListener('taskCompleted', (e) => {
            this.markTaskComplete(e.detail.taskId);
        });
    }

    navigateToTask(taskId) {
        console.log(`Navigating to task: ${taskId}`);
        window.location.href = `tasks/${taskId}.html`;
    }

    markTaskComplete(taskId) {
        if (!this.completedTasks.includes(taskId)) {
            this.completedTasks.push(taskId);
            this.saveCompletedTasks();
            this.updateUI();
        }
    }

    resetAllTasks() {
        this.completedTasks = [];
        this.saveCompletedTasks();
        this.updateUI();
        
        // Dispatch event to notify other pages
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'completedTasks',
            newValue: JSON.stringify([])
        }));
    }

    updateUI() {
        // Update task buttons
        document.querySelectorAll('.task-btn').forEach(btn => {
            const taskId = btn.dataset.task;
            if (this.completedTasks.includes(taskId)) {
                btn.classList.add('completed');
            } else {
                btn.classList.remove('completed');
            }
        });

        // Update progress bar
        const progress = (this.completedTasks.length / this.tasks.length) * 100;
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${this.completedTasks.length}/${this.tasks.length} Tasks Complete`;
        }
    }

    loadCompletedTasks() {
        try {
            const stored = localStorage.getItem('completedTasks');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading completed tasks:', e);
            return [];
        }
    }

    saveCompletedTasks() {
        try {
            localStorage.setItem('completedTasks', JSON.stringify(this.completedTasks));
        } catch (e) {
            console.error('Error saving completed tasks:', e);
        }
    }
}

// Common task functionality for individual task pages
class BaseTask {
    constructor(taskId) {
        this.taskId = taskId;
        this.isCompleted = false;
        this.init();
    }

    init() {
        this.addBackButton();
        this.bindBackButton();
    }

    addBackButton() {
        if (!document.querySelector('.back-btn')) {
            const backBtn = document.createElement('button');
            backBtn.className = 'back-btn';
            backBtn.innerHTML = '← Back to Tasks';
            document.body.appendChild(backBtn);
        }
    }

    bindBackButton() {
        document.querySelector('.back-btn')?.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
    }

    completeTask() {
        if (this.isCompleted) return;
        
        this.isCompleted = true;
        
        // Save to localStorage
        try {
            const completedTasks = JSON.parse(localStorage.getItem('completedTasks') || '[]');
            if (!completedTasks.includes(this.taskId)) {
                completedTasks.push(this.taskId);
                localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
            }
        } catch (e) {
            console.error('Error saving task completion:', e);
        }

        // Update multiplayer progress if player is logged in
        if (window.multiplayerManager && window.multiplayerManager.getCurrentPlayer()) {
            const currentPlayer = window.multiplayerManager.getCurrentPlayer();
            window.multiplayerManager.updatePlayerProgress(currentPlayer.id, this.taskId);
        }

        // Show completion message
        this.showCompletionMessage();

        // Auto-redirect after delay
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
    }

    showCompletionMessage() {
        const message = document.createElement('div');
        message.className = 'task-complete';
        message.innerHTML = '✓ TASK COMPLETE!';
        document.body.appendChild(message);

        // Remove message after animation
        setTimeout(() => {
            message.remove();
        }, 2500);
    }
}

// Utility functions
function getRandomColor() {
    const colors = ['#ff4757', '#70a1ff', '#5352ed', '#ff6b7a', '#7bed9f', '#2ed573', '#ffa502', '#ff7675'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function playSound(type) {
    // Simple beep sounds using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = type === 'success' ? 800 : 400;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        // Silent fail if audio not supported
    }
}

// Touch event enhancements
function addTouchFeedback() {
    document.addEventListener('touchstart', (e) => {
        if (e.target.matches('button, .task-btn')) {
            e.target.style.transform = 'scale(0.95)';
        }
    });

    document.addEventListener('touchend', (e) => {
        if (e.target.matches('button, .task-btn')) {
            setTimeout(() => {
                e.target.style.transform = '';
            }, 150);
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the main page
    if (document.querySelector('.task-grid')) {
        window.taskManager = new TaskManager();
        console.log('TaskManager initialized and available as window.taskManager');
    }
    
    // Add touch feedback to all pages
    addTouchFeedback();
    
    // Prevent zoom on double tap for mobile
    document.addEventListener('touchend', (e) => {
        e.preventDefault();
    }, { passive: false });
});

// Export for use in task pages
window.BaseTask = BaseTask;
window.playSound = playSound;
window.getRandomColor = getRandomColor;
window.shuffleArray = shuffleArray;