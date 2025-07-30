class SwipeCardTask extends BaseTask {
    constructor() {
        super('swipe-card');
        this.card = document.getElementById('idCard');
        this.statusText = document.getElementById('statusText');
        this.speedFill = document.getElementById('speedFill');
        this.cardSlot = document.querySelector('.card-slot');
        
        this.isDragging = false;
        this.dragStartTime = 0;
        this.dragStartX = 0;
        this.dragDistance = 0;
        this.swipeSpeed = 0;
        this.hasStartedSwipe = false;
        this.attempts = 0;
        this.maxAttempts = 3;
        
        // Speed thresholds (pixels per second)
        this.minSpeed = 150;
        this.maxSpeed = 400;
        this.optimalSpeed = 250;
        
        this.initCardSwipe();
    }

    initCardSwipe() {
        this.bindCardEvents();
        this.updateStatus('Please insert card');
    }

    bindCardEvents() {
        // Mouse events
        this.card.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', (e) => this.endDrag(e));

        // Touch events
        this.card.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrag(e.touches[0]);
        });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDragging) {
                this.drag(e.touches[0]);
            }
        });
        
        document.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.endDrag(e.changedTouches[0]);
        });
    }

    startDrag(event) {
        this.isDragging = true;
        this.dragStartTime = Date.now();
        this.dragStartX = event.clientX;
        this.dragDistance = 0;
        this.hasStartedSwipe = false;
        
        this.card.classList.add('dragging');
        this.updateStatus('Swipe the card through the reader');
        this.resetSpeedIndicator();
    }

    drag(event) {
        if (!this.isDragging) return;

        const currentX = event.clientX;
        const deltaX = currentX - this.dragStartX;
        
        // Update card position
        this.card.style.transform = `translateX(${deltaX}px) rotate(-5deg) scale(1.1)`;
        
        // Check if card is in the slot area
        const cardRect = this.card.getBoundingClientRect();
        const slotRect = this.cardSlot.getBoundingClientRect();
        
        const isInSlot = cardRect.right > slotRect.left && 
                        cardRect.left < slotRect.right &&
                        cardRect.bottom > slotRect.top && 
                        cardRect.top < slotRect.bottom;
        
        if (isInSlot && !this.hasStartedSwipe) {
            this.hasStartedSwipe = true;
            this.dragStartTime = Date.now(); // Reset timer when entering slot
            this.dragStartX = currentX; // Reset start position
        }
        
        if (this.hasStartedSwipe) {
            this.dragDistance = Math.abs(currentX - this.dragStartX);
            this.calculateSpeed();
        }
    }

    endDrag(event) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.card.classList.remove('dragging');
        
        if (this.hasStartedSwipe) {
            this.evaluateSwipe();
        } else {
            this.resetCard();
            this.updateStatus('Card not inserted properly');
        }
    }

    calculateSpeed() {
        if (!this.hasStartedSwipe) return;
        
        const currentTime = Date.now();
        const timeDelta = (currentTime - this.dragStartTime) / 1000; // Convert to seconds
        
        if (timeDelta > 0) {
            this.swipeSpeed = this.dragDistance / timeDelta;
            this.updateSpeedIndicator();
        }
    }

    updateSpeedIndicator() {
        const maxDisplaySpeed = 600; // Maximum speed for display purposes
        const speedPercentage = Math.min((this.swipeSpeed / maxDisplaySpeed) * 100, 100);
        this.speedFill.style.width = `${speedPercentage}%`;
    }

    evaluateSwipe() {
        this.attempts++;
        
        // Check if speed is in optimal range
        if (this.swipeSpeed >= this.minSpeed && this.swipeSpeed <= this.maxSpeed) {
            this.successfulSwipe();
        } else {
            this.failedSwipe();
        }
    }

    successfulSwipe() {
        this.updateStatus('Card accepted - Access granted', 'success');
        this.speedFill.style.background = '#2ed573';
        playSound('success');
        
        // Animate card completion
        this.card.style.transform = 'translateX(200px) rotate(0deg) scale(1)';
        this.card.style.opacity = '0.7';
        
        setTimeout(() => {
            this.completeTask();
        }, 1000);
    }

    failedSwipe() {
        let errorMessage;
        
        if (this.swipeSpeed < this.minSpeed) {
            errorMessage = 'Too slow - Please try again';
        } else if (this.swipeSpeed > this.maxSpeed) {
            errorMessage = 'Too fast - Please try again';
        } else {
            errorMessage = 'Error reading card - Please try again';
        }
        
        if (this.attempts >= this.maxAttempts) {
            errorMessage = 'Multiple failed attempts - Card rejected';
            this.speedFill.style.background = '#ff4757';
            playSound('error');
            
            setTimeout(() => {
                this.resetTask();
            }, 2000);
        } else {
            playSound('error');
            setTimeout(() => {
                this.resetCard();
                this.updateStatus('Please insert card');
            }, 1500);
        }
        
        this.updateStatus(errorMessage, 'error');
        this.speedFill.style.background = '#ff4757';
    }

    resetCard() {
        this.card.style.transform = '';
        this.card.style.opacity = '';
        this.resetSpeedIndicator();
    }

    resetSpeedIndicator() {
        this.speedFill.style.width = '0%';
        this.speedFill.style.background = 'linear-gradient(90deg, #ff4757 0%, #ffa502 30%, #2ed573 50%, #ffa502 70%, #ff4757 100%)';
    }

    resetTask() {
        this.attempts = 0;
        this.resetCard();
        this.updateStatus('Please insert card');
    }

    updateStatus(message, type = '') {
        this.statusText.textContent = message;
        this.statusText.className = 'status-line';
        if (type) {
            this.statusText.classList.add(type);
        }
    }
}

// Initialize the card swipe task when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SwipeCardTask();
});