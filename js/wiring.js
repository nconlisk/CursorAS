class WiringTask extends BaseTask {
    constructor() {
        super('fix-wiring');
        this.wires = [
            { id: 1, color: 'red', connected: false },
            { id: 2, color: 'blue', connected: false },
            { id: 3, color: 'yellow', connected: false },
            { id: 4, color: 'green', connected: false }
        ];
        this.selectedWire = null;
        this.connectedWires = 0;
        this.colorMap = {
            red: '#ff4757',
            blue: '#70a1ff',
            yellow: '#ffa502',
            green: '#2ed573'
        };
        this.initWiring();
    }

    initWiring() {
        this.bindWireEvents();
        this.updateProgress();
        this.randomizeEndPositions();
    }

    randomizeEndPositions() {
        // Shuffle the wire end positions to make it more challenging
        const endSection = document.querySelector('.wire-end-section');
        const wireEnds = Array.from(endSection.children);
        const shuffled = shuffleArray(wireEnds);
        
        endSection.innerHTML = '';
        shuffled.forEach(end => endSection.appendChild(end));
    }

    bindWireEvents() {
        // Wire start events
        document.querySelectorAll('.wire-start').forEach(wireStart => {
            wireStart.addEventListener('click', (e) => this.selectWire(e));
            wireStart.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.selectWire(e);
            });
        });

        // Wire end events
        document.querySelectorAll('.wire-end').forEach(wireEnd => {
            wireEnd.addEventListener('click', (e) => this.connectWire(e));
            wireEnd.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.connectWire(e);
            });
            
            // Hover effect for highlighting compatible ends
            wireEnd.addEventListener('mouseenter', () => this.highlightCompatibleEnd(wireEnd));
            wireEnd.addEventListener('mouseleave', () => this.removeHighlight(wireEnd));
        });
    }

    selectWire(e) {
        const wireElement = e.currentTarget;
        const wireId = parseInt(wireElement.dataset.wire);
        const wire = this.wires.find(w => w.id === wireId);

        // Don't select already connected wires
        if (wire.connected) return;

        // Clear previous selection
        document.querySelectorAll('.wire-start').forEach(w => w.classList.remove('selected'));
        
        // Select new wire
        wireElement.classList.add('selected');
        this.selectedWire = wire;

        // Highlight compatible end points
        this.highlightCompatibleEnds();
        
        playSound('click');
    }

    connectWire(e) {
        if (!this.selectedWire) return;

        const wireEndElement = e.currentTarget;
        const endColor = wireEndElement.dataset.color;
        const endWireId = parseInt(wireEndElement.dataset.wire);

        // Check if this is the correct matching wire
        if (this.selectedWire.id === endWireId && this.selectedWire.color === endColor) {
            this.makeConnection(this.selectedWire, wireEndElement);
            playSound('success');
        } else {
            this.showWrongConnection();
            playSound('error');
        }
    }

    makeConnection(wire, endElement) {
        // Mark wire as connected
        wire.connected = true;
        this.connectedWires++;

        // Get start and end positions
        const startElement = document.querySelector(`.wire-start[data-wire="${wire.id}"]`);
        const startRect = startElement.getBoundingClientRect();
        const endRect = endElement.getBoundingClientRect();
        const svgRect = document.querySelector('.wire-svg').getBoundingClientRect();

        // Calculate positions relative to SVG
        const startX = (startRect.left + startRect.width / 2) - svgRect.left;
        const startY = (startRect.top + startRect.height / 2) - svgRect.top;
        const endX = (endRect.left + endRect.width / 2) - svgRect.left;
        const endY = (endRect.top + endRect.height / 2) - svgRect.top;

        // Create SVG path
        this.drawWire(startX, startY, endX, endY, wire.color);

        // Update UI
        startElement.classList.remove('selected');
        startElement.classList.add('connected');
        endElement.classList.add('connected');
        
        this.selectedWire = null;
        this.clearHighlights();
        this.updateProgress();

        // Check if task is complete
        if (this.connectedWires === this.wires.length) {
            setTimeout(() => this.completeTask(), 500);
        }
    }

    drawWire(startX, startY, endX, endY, color) {
        const svg = document.querySelector('.wire-svg');
        
        // Create wire group for better organization
        const wireGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        wireGroup.classList.add('wire-group');
        
        // Create the main wire path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Create a more realistic curved path with multiple control points
        const midX = (startX + endX) / 2;
        const variance = Math.random() * 40 - 20; // Add some randomness to wire path
        const controlX1 = startX + (midX - startX) * 0.3;
        const controlY1 = startY + variance;
        const controlX2 = endX - (endX - midX) * 0.3;
        const controlY2 = endY + variance;
        
        const pathData = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
        
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', this.colorMap[color]);
        path.setAttribute('stroke-width', '6');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.classList.add('wire-line', 'connected');
        
        // Add wire glow effect
        const glowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        glowPath.setAttribute('d', pathData);
        glowPath.setAttribute('stroke', this.colorMap[color]);
        glowPath.setAttribute('stroke-width', '12');
        glowPath.setAttribute('fill', 'none');
        glowPath.setAttribute('stroke-linecap', 'round');
        glowPath.setAttribute('opacity', '0.3');
        glowPath.setAttribute('filter', 'url(#glow)');
        glowPath.classList.add('wire-glow');
        
        // Add electrical spark animation
        const sparkGroup = this.createElectricalSparks(startX, startY, endX, endY, color);
        
        // Assemble the wire
        wireGroup.appendChild(glowPath);
        wireGroup.appendChild(path);
        wireGroup.appendChild(sparkGroup);
        
        svg.appendChild(wireGroup);
        
        // Animate the wire connection
        this.animateWireConnection(path);
    }

    createElectricalSparks(startX, startY, endX, endY, color) {
        const sparkGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        sparkGroup.classList.add('electrical-sparks');
        
        // Create small spark circles along the wire path
        for (let i = 0; i < 3; i++) {
            const progress = (i + 1) / 4; // Position along the wire
            const sparkX = startX + (endX - startX) * progress;
            const sparkY = startY + (endY - startY) * progress;
            
            const spark = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            spark.setAttribute('cx', sparkX);
            spark.setAttribute('cy', sparkY);
            spark.setAttribute('r', '2');
            spark.setAttribute('fill', this.colorMap[color]);
            spark.setAttribute('opacity', '0');
            spark.classList.add('spark');
            
            // Animate spark
            spark.style.animation = `sparkle 1.5s ease-in-out infinite`;
            spark.style.animationDelay = `${i * 0.3}s`;
            
            sparkGroup.appendChild(spark);
        }
        
        return sparkGroup;
    }

    animateWireConnection(path) {
        const pathLength = path.getTotalLength();
        
        // Set up the starting positions
        path.style.strokeDasharray = pathLength + ' ' + pathLength;
        path.style.strokeDashoffset = pathLength;
        
        // Trigger the animation
        path.getBoundingClientRect(); // Force reflow
        path.style.transition = 'stroke-dashoffset 0.8s ease-in-out';
        path.style.strokeDashoffset = '0';
        
        // After animation, remove dash properties for clean wire
        setTimeout(() => {
            path.style.strokeDasharray = 'none';
            path.style.transition = '';
        }, 800);
    }

    highlightCompatibleEnds() {
        if (!this.selectedWire) return;

        document.querySelectorAll('.wire-end').forEach(end => {
            const endColor = end.dataset.color;
            const endWireId = parseInt(end.dataset.wire);
            
            if (this.selectedWire.color === endColor && this.selectedWire.id === endWireId) {
                end.classList.add('highlight');
            }
        });
    }

    highlightCompatibleEnd(endElement) {
        if (!this.selectedWire) return;
        
        const endColor = endElement.dataset.color;
        const endWireId = parseInt(endElement.dataset.wire);
        
        if (this.selectedWire.color === endColor && this.selectedWire.id === endWireId) {
            endElement.classList.add('highlight');
        }
    }

    removeHighlight(endElement) {
        endElement.classList.remove('highlight');
    }

    clearHighlights() {
        document.querySelectorAll('.wire-end').forEach(end => {
            end.classList.remove('highlight');
        });
    }

    showWrongConnection() {
        // Flash red background briefly
        document.body.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
        setTimeout(() => {
            document.body.style.backgroundColor = '';
        }, 200);
    }

    updateProgress() {
        const progressElement = document.getElementById('wiresConnected');
        if (progressElement) {
            progressElement.textContent = this.connectedWires;
        }
    }
}

// Initialize the wiring task when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WiringTask();
});