class ChartCourseTask extends BaseTask {
    constructor() {
        super('chart-course');
        this.ship = document.getElementById('ship');
        this.destination = document.getElementById('destination');
        this.shipPath = document.getElementById('shipPath');
        this.destinationPath = document.getElementById('destinationPath');
        this.courseStatus = document.getElementById('courseStatus');
        this.resetBtn = document.getElementById('resetPath');
        
        this.isDragging = false;
        this.shipPositions = [];
        this.destinationPositions = [];
        this.accuracy = 0;
        
        this.initChartCourse();
    }

    initChartCourse() {
        this.generateDestinationPath();
        this.bindEvents();
        this.updateStatus('Drag the ship to chart your course');
    }

    generateDestinationPath() {
        // Generate a random destination path
        const pathPoints = [];
        const startX = 50;
        const startY = 50;
        let currentX = startX;
        let currentY = startY;
        
        for (let i = 0; i < 5; i++) {
            const deltaX = (Math.random() - 0.5) * 40;
            const deltaY = (Math.random() - 0.5) * 40;
            currentX = Math.max(10, Math.min(90, currentX + deltaX));
            currentY = Math.max(10, Math.min(90, currentY + deltaY));
            pathPoints.push({ x: currentX, y: currentY });
        }
        
        this.destinationPositions = pathPoints;
        this.drawDestinationPath();
        
        // Position destination at the end
        const lastPoint = pathPoints[pathPoints.length - 1];
        this.destination.style.left = `${lastPoint.x}%`;
        this.destination.style.top = `${lastPoint.y}%`;
    }

    drawDestinationPath() {
        if (this.destinationPath && this.destinationPositions.length > 0) {
            const pathData = this.destinationPositions.map((point, index) => {
                return `${index === 0 ? 'M' : 'L'} ${point.x}% ${point.y}%`;
            }).join(' ');
            
            this.destinationPath.innerHTML = `<path d="${pathData}" stroke="#70a1ff" stroke-width="3" fill="none" stroke-dasharray="5,5"/>`;
        }
    }

    bindEvents() {
        // Ship drag events
        this.ship.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', (e) => this.endDrag(e));

        // Touch events
        this.ship.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrag(e.touches[0]);
        });
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.drag(e.touches[0]);
        });
        document.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.endDrag(e.changedTouches[0]);
        });

        // Reset button
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.resetPath());
        }
    }

    startDrag(event) {
        this.isDragging = true;
        this.shipPositions = [];
        this.ship.classList.add('dragging');
        this.updateStatus('Charting course...');
        playSound('click');
    }

    drag(event) {
        if (!this.isDragging) return;

        const rect = this.ship.parentElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        
        // Constrain to bounds
        const constrainedX = Math.max(5, Math.min(95, x));
        const constrainedY = Math.max(5, Math.min(95, y));
        
        this.ship.style.left = `${constrainedX}%`;
        this.ship.style.top = `${constrainedY}%`;
        
        this.shipPositions.push({ x: constrainedX, y: constrainedY });
        this.drawShipPath();
    }

    endDrag(event) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.ship.classList.remove('dragging');
        this.evaluateCourse();
    }

    drawShipPath() {
        if (this.shipPath && this.shipPositions.length > 1) {
            const pathData = this.shipPositions.map((point, index) => {
                return `${index === 0 ? 'M' : 'L'} ${point.x}% ${point.y}%`;
            }).join(' ');
            
            this.shipPath.innerHTML = `<path d="${pathData}" stroke="#ff4757" stroke-width="3" fill="none"/>`;
        }
    }

    evaluateCourse() {
        if (this.shipPositions.length < 2) {
            this.updateStatus('Path too short - try again');
            return;
        }

        // Calculate accuracy by comparing ship path to destination path
        let totalAccuracy = 0;
        let comparisons = 0;

        for (let i = 0; i < this.shipPositions.length; i++) {
            const shipPoint = this.shipPositions[i];
            let minDistance = Infinity;
            
            for (let j = 0; j < this.destinationPositions.length; j++) {
                const destPoint = this.destinationPositions[j];
                const distance = Math.sqrt(
                    Math.pow(shipPoint.x - destPoint.x, 2) + 
                    Math.pow(shipPoint.y - destPoint.y, 2)
                );
                minDistance = Math.min(minDistance, distance);
            }
            
            totalAccuracy += Math.max(0, 100 - minDistance);
            comparisons++;
        }

        this.accuracy = Math.round(totalAccuracy / comparisons);

        if (this.accuracy >= 70) {
            this.updateStatus('Course charted successfully!', 'success');
            playSound('success');
            setTimeout(() => this.completeTask(), 1500);
        } else {
            this.updateStatus(`Accuracy: ${this.accuracy}% - Try to follow the blue path more closely`);
            playSound('error');
        }
    }

    resetPath() {
        this.shipPositions = [];
        this.ship.style.left = '50%';
        this.ship.style.top = '50%';
        if (this.shipPath) {
            this.shipPath.innerHTML = '';
        }
        this.updateStatus('Path reset - try again');
        playSound('click');
    }

    updateStatus(message, type = '') {
        if (this.courseStatus) {
            this.courseStatus.textContent = message;
            this.courseStatus.className = 'course-status';
            if (type) {
                this.courseStatus.classList.add(type);
            }
        }
    }
}

// Initialize the chart course task when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChartCourseTask();
});