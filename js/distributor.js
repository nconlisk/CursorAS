class DistributorTask extends BaseTask {
    constructor() {
        super('calibrate-distributor');
        this.dials = [];
        this.powerLevel = 0;
        this.initDistributor();
    }

    initDistributor() {
        this.setupDials();
        this.bindDialEvents();
        this.updateDisplay();
    }

    setupDials() {
        const dialElements = document.querySelectorAll('.power-dial');
        dialElements.forEach((dialElement, index) => {
            const targetAngle = parseInt(dialElement.querySelector('.dial-target').dataset.angle);
            this.dials.push({
                element: dialElement,
                needle: dialElement.querySelector('.dial-needle'),
                targetAngle: targetAngle,
                currentAngle: Math.random() * 360, // Random starting position
                isAligned: false,
                index: index
            });
            
            // Set initial random position
            this.updateDialNeedle(this.dials[index]);
            
            // Position target indicator
            const target = dialElement.querySelector('.dial-target');
            target.style.transform = `translate(-50%, -50%) rotate(${targetAngle}deg)`;
        });
    }

    bindDialEvents() {
        this.dials.forEach(dial => {
            let isDragging = false;
            let startAngle = 0;
            let currentAngle = dial.currentAngle;

            const handleStart = (e) => {
                isDragging = true;
                const rect = dial.element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
                startAngle = Math.atan2(clientY - centerY, clientX - centerX) * 180 / Math.PI;
                
                document.body.style.userSelect = 'none';
                e.preventDefault();
            };

            const handleMove = (e) => {
                if (!isDragging) return;
                
                const rect = dial.element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
                const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
                const mouseAngle = Math.atan2(clientY - centerY, clientX - centerX) * 180 / Math.PI;
                
                const deltaAngle = mouseAngle - startAngle;
                currentAngle = (currentAngle + deltaAngle) % 360;
                if (currentAngle < 0) currentAngle += 360;
                
                dial.currentAngle = currentAngle;
                this.updateDialNeedle(dial);
                this.checkAlignment(dial);
                this.updateDisplay();
                
                startAngle = mouseAngle;
                e.preventDefault();
            };

            const handleEnd = (e) => {
                isDragging = false;
                document.body.style.userSelect = '';
                e.preventDefault();
            };

            // Mouse events
            dial.element.addEventListener('mousedown', handleStart);
            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);

            // Touch events
            dial.element.addEventListener('touchstart', handleStart);
            document.addEventListener('touchmove', handleMove);
            document.addEventListener('touchend', handleEnd);
        });
    }

    updateDialNeedle(dial) {
        dial.needle.style.transform = `translate(-50%, -100%) rotate(${dial.currentAngle}deg)`;
    }

    checkAlignment(dial) {
        const tolerance = 15; // degrees
        const angleDiff = Math.abs(dial.currentAngle - dial.targetAngle);
        const isAligned = angleDiff <= tolerance || (360 - angleDiff) <= tolerance;
        
        if (isAligned && !dial.isAligned) {
            dial.isAligned = true;
            dial.element.classList.add('aligned');
            playSound('success');
        } else if (!isAligned && dial.isAligned) {
            dial.isAligned = false;
            dial.element.classList.remove('aligned');
        }
    }

    updateDisplay() {
        const alignedCount = this.dials.filter(dial => dial.isAligned).length;
        this.powerLevel = Math.round((alignedCount / this.dials.length) * 100);
        
        const powerLevelElement = document.getElementById('powerLevel');
        const statusElement = document.getElementById('calibrationStatus');
        
        if (powerLevelElement) {
            powerLevelElement.textContent = `${this.powerLevel}%`;
            powerLevelElement.style.color = this.powerLevel === 100 ? '#2ed573' : '#70a1ff';
        }
        
        if (statusElement) {
            if (this.powerLevel === 100) {
                statusElement.textContent = 'Calibration complete!';
                statusElement.classList.add('success');
                setTimeout(() => this.completeTask(), 1000);
            } else if (this.powerLevel > 0) {
                statusElement.textContent = `${alignedCount}/${this.dials.length} dials aligned`;
                statusElement.classList.remove('success');
            } else {
                statusElement.textContent = 'Awaiting calibration...';
                statusElement.classList.remove('success');
            }
        }
    }
}

// Initialize the distributor task when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DistributorTask();
});