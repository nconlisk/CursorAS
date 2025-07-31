class WasteDisposalTask extends BaseTask {
    constructor() {
        super('empty-garbage');
        this.disposalArea = document.getElementById('disposalArea');
        this.disposalBtn = document.getElementById('disposalBtn');
        this.statusText = document.getElementById('statusText');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.disposalZone = document.getElementById('disposalZone');
        
        this.disposalItems = [];
        this.totalItems = 9;
        this.disposedItems = 0;
        this.isDisposing = false;
        
        this.initWasteDisposal();
    }

    initWasteDisposal() {
        this.bindDragEvents();
        this.bindDisposalEvents();
        this.updateProgress();
        this.updateStatus('Drag waste items to disposal zone');
    }

    bindDragEvents() {
        // Bind drag events to waste items
        const wasteItems = document.querySelectorAll('.waste-item');
        wasteItems.forEach(item => {
            item.addEventListener('dragstart', (e) => this.startDrag(e));
            item.addEventListener('dragend', (e) => this.endDrag(e));
        });

        // Bind drop zone events
        this.disposalArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.disposalArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.disposalArea.addEventListener('dragenter', (e) => this.handleDragEnter(e));
        this.disposalArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    }

    bindDisposalEvents() {
        this.disposalBtn.addEventListener('click', () => this.disposeWaste());
    }

    startDrag(event) {
        event.dataTransfer.setData('text/plain', event.target.textContent);
        event.target.classList.add('dragging');
        this.updateStatus('Dragging waste item...');
    }

    endDrag(event) {
        event.target.classList.remove('dragging');
    }

    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(event) {
        event.preventDefault();
        this.disposalZone.classList.add('drag-over');
    }

    handleDragLeave(event) {
        if (!this.disposalArea.contains(event.relatedTarget)) {
            this.disposalZone.classList.remove('drag-over');
        }
    }

    handleDrop(event) {
        event.preventDefault();
        this.disposalZone.classList.remove('drag-over');
        
        const wasteType = event.dataTransfer.getData('text/plain');
        this.addWasteToDisposal(wasteType);
        
        // Remove the original item
        const draggingItem = document.querySelector('.waste-item.dragging');
        if (draggingItem) {
            draggingItem.remove();
        }
    }

    addWasteToDisposal(wasteType) {
        const disposalItem = document.createElement('div');
        disposalItem.className = 'disposal-item';
        disposalItem.textContent = wasteType;
        disposalItem.dataset.type = this.getWasteType(wasteType);
        
        this.disposalArea.appendChild(disposalItem);
        this.disposalItems.push(disposalItem);
        
        // Update disposal area state
        this.disposalArea.classList.add('has-items');
        
        // Enable disposal button if we have items
        if (this.disposalItems.length > 0) {
            this.disposalBtn.disabled = false;
        }
        
        this.updateStatus(`${this.disposalItems.length} items ready for disposal`);
        playSound('success');
    }

    getWasteType(emoji) {
        const wasteTypes = {
            '🍎': 'organic', '🥕': 'organic', '🥬': 'organic',
            '🥤': 'plastic', '📦': 'plastic', '🛍️': 'plastic',
            '🔧': 'metal', '⚙️': 'metal', '🔩': 'metal'
        };
        return wasteTypes[emoji] || 'unknown';
    }

    disposeWaste() {
        if (this.isDisposing || this.disposalItems.length === 0) return;
        
        this.isDisposing = true;
        this.disposalBtn.classList.add('active');
        this.updateStatus('Opening airlock...');
        
        // Animate airlock doors opening
        const leftDoor = document.querySelector('.left-door');
        const rightDoor = document.querySelector('.right-door');
        
        setTimeout(() => {
            leftDoor.classList.add('open');
            rightDoor.classList.add('open');
            this.updateStatus('Disposing waste to space...');
            
            // Animate items being disposed
            this.disposalItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.animation = 'disposeToSpace 1s ease forwards';
                    
                    setTimeout(() => {
                        item.remove();
                        this.disposedItems++;
                        this.updateProgress();
                        
                        if (this.disposedItems >= this.totalItems) {
                            this.completeDisposal();
                        }
                    }, 1000);
                }, index * 200);
            });
            
            // Clear disposal items array
            this.disposalItems = [];
            this.disposalArea.classList.remove('has-items');
            this.disposalBtn.disabled = true;
            
        }, 1000);
        
        // Close airlock after disposal
        setTimeout(() => {
            leftDoor.classList.remove('open');
            rightDoor.classList.remove('open');
            this.disposalBtn.classList.remove('active');
            this.isDisposing = false;
            
            if (this.disposedItems < this.totalItems) {
                this.updateStatus('Airlock closed. Continue disposing waste.');
            }
        }, 3000);
        
        playSound('success');
    }

    completeDisposal() {
        this.updateStatus('All waste disposed successfully!', 'success');
        playSound('success');
        
        setTimeout(() => {
            this.completeTask();
        }, 2000);
    }

    updateProgress() {
        const progress = (this.disposedItems / this.totalItems) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `${this.disposedItems}/${this.totalItems} items disposed`;
    }

    updateStatus(message, type = '') {
        this.statusText.textContent = message;
        this.statusText.className = 'status-line';
        if (type) {
            this.statusText.classList.add(type);
        }
    }
}

// Initialize the waste disposal task when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WasteDisposalTask();
});