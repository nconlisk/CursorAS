// Multiplayer game management system
class MultiplayerManager {
    constructor() {
        this.gameState = {
            isActive: false,
            players: [],
            currentPlayer: null,
            meetingActive: false,
            gameStartTime: null
        };
        this.init();
    }

    init() {
        this.loadGameState();
        this.bindEvents();
        this.startMeetingListener();
    }

    // Player management
    generatePlayers(playerCount) {
        const players = [];
        const impostorCount = this.calculateImpostorCount(playerCount);
        
        // Create player IDs
        for (let i = 1; i <= playerCount; i++) {
            players.push({
                id: `P${i.toString().padStart(2, '0')}`,
                role: 'crewmate',
                tasksCompleted: 0,
                totalTasks: 12,
                isAlive: true,
                joinedAt: null
            });
        }

        // Randomly assign impostor roles
        const shuffledPlayers = [...players];
        for (let i = shuffledPlayers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledPlayers[i], shuffledPlayers[j]] = [shuffledPlayers[j], shuffledPlayers[i]];
        }

        for (let i = 0; i < impostorCount; i++) {
            shuffledPlayers[i].role = 'impostor';
            shuffledPlayers[i].totalTasks = 0; // Impostors don't do tasks
        }

        return players;
    }

    calculateImpostorCount(playerCount) {
        if (playerCount < 4) return 1;
        if (playerCount >= 5 && playerCount <= 8) return 2;
        return Math.floor(playerCount / 4); // For larger groups
    }

    startGame(players) {
        this.gameState = {
            isActive: true,
            players: players,
            currentPlayer: null,
            meetingActive: false,
            gameStartTime: Date.now()
        };
        this.saveGameState();
        this.broadcastGameUpdate();
    }

    loginPlayer(playerId) {
        const player = this.gameState.players.find(p => p.id === playerId);
        if (player && this.gameState.isActive) {
            player.joinedAt = Date.now();
            this.gameState.currentPlayer = player;
            this.saveGameState();
            return player;
        }
        return null;
    }

    updatePlayerProgress(playerId, taskId) {
        const player = this.gameState.players.find(p => p.id === playerId);
        if (player && player.role === 'crewmate') {
            player.tasksCompleted++;
            this.saveGameState();
            this.broadcastGameUpdate();
            
            // Check for crew victory
            this.checkWinConditions();
        }
    }

    // Emergency meeting system
    callEmergencyMeeting(callerId = null) {
        this.gameState.meetingActive = true;
        this.gameState.meetingCaller = callerId;
        this.gameState.meetingStartTime = Date.now();
        this.saveGameState();
        
        // Broadcast to all screens
        this.broadcastMeetingAlert();
        
        // Auto-end meeting after 5 minutes
        setTimeout(() => {
            if (this.gameState.meetingActive) {
                this.endEmergencyMeeting();
            }
        }, 300000); // 5 minutes
    }

    endEmergencyMeeting() {
        this.gameState.meetingActive = false;
        this.gameState.meetingCaller = null;
        this.saveGameState();
        this.broadcastMeetingEnd();
    }

    // Local storage persistence
    saveGameState() {
        try {
            localStorage.setItem('amongus_gamestate', JSON.stringify(this.gameState));
            // Also broadcast to other tabs/devices on same network
            window.dispatchEvent(new CustomEvent('gameStateUpdate', {
                detail: this.gameState
            }));
        } catch (e) {
            console.error('Error saving game state:', e);
        }
    }

    loadGameState() {
        try {
            const saved = localStorage.getItem('amongus_gamestate');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Validate game state
                if (parsed.isActive && Array.isArray(parsed.players)) {
                    this.gameState = parsed;
                }
            }
        } catch (e) {
            console.error('Error loading game state:', e);
        }
    }

    // Cross-tab communication
    startMeetingListener() {
        // Listen for storage changes (cross-tab communication)
        window.addEventListener('storage', (e) => {
            if (e.key === 'amongus_gamestate') {
                this.handleGameStateChange(e.newValue);
            } else if (e.key === 'amongus_meeting_alert') {
                this.showMeetingAlert();
            }
        });

        // Listen for custom events (same-tab communication)
        window.addEventListener('gameStateUpdate', (e) => {
            this.handleGameStateUpdate(e.detail);
        });
    }

    broadcastMeetingAlert() {
        // Use localStorage to communicate across tabs
        const meetingData = {
            timestamp: Date.now(),
            caller: this.gameState.meetingCaller,
            active: true
        };
        
        localStorage.setItem('amongus_meeting_alert', JSON.stringify(meetingData));
        
        // Also trigger for current tab
        this.showMeetingAlert();
    }

    broadcastMeetingEnd() {
        const meetingData = {
            timestamp: Date.now(),
            active: false
        };
        
        localStorage.setItem('amongus_meeting_alert', JSON.stringify(meetingData));
        this.hideMeetingAlert();
    }

    broadcastGameUpdate() {
        // Broadcast game state changes
        window.dispatchEvent(new CustomEvent('gameProgressUpdate', {
            detail: {
                players: this.gameState.players,
                timestamp: Date.now()
            }
        }));
    }

    showMeetingAlert() {
        // Create or show meeting modal
        let modal = document.getElementById('emergencyMeetingModal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'emergencyMeetingModal';
            modal.className = 'meeting-modal';
            modal.innerHTML = `
                <div class="meeting-content">
                    <h2>🚨 EMERGENCY MEETING</h2>
                    <p>All players must stop what they're doing and gather for discussion!</p>
                    <div class="meeting-timer" id="meetingTimer">Meeting in progress...</div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        modal.style.display = 'flex';
        
        // Play alert sound
        this.playMeetingSound();
        
        // Start timer if this is a new meeting
        if (this.gameState.meetingActive) {
            this.startMeetingTimer();
        }
    }

    hideMeetingAlert() {
        const modal = document.getElementById('emergencyMeetingModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    startMeetingTimer() {
        const timerElement = document.getElementById('meetingTimer');
        if (!timerElement) return;

        const startTime = this.gameState.meetingStartTime || Date.now();
        
        const updateTimer = () => {
            const elapsed = Date.now() - startTime;
            const remaining = 300000 - elapsed; // 5 minutes max
            
            if (remaining <= 0) {
                timerElement.textContent = 'Meeting ended';
                return;
            }
            
            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            timerElement.textContent = `Time remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (this.gameState.meetingActive) {
                setTimeout(updateTimer, 1000);
            }
        };
        
        updateTimer();
    }

    playMeetingSound() {
        try {
            // Create dramatic meeting sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Play a sequence of alert tones
            [800, 600, 800, 600, 800].forEach((freq, i) => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.value = freq;
                    oscillator.type = 'square';
                    
                    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                }, i * 400);
            });
        } catch (e) {
            console.log('Audio not available:', e);
        }
    }

    // Game state handlers
    handleGameStateChange(newStateString) {
        if (!newStateString) return;
        
        try {
            const newState = JSON.parse(newStateString);
            this.gameState = newState;
            
            // Handle meeting state changes
            if (newState.meetingActive && !document.getElementById('emergencyMeetingModal')?.style.display) {
                this.showMeetingAlert();
            } else if (!newState.meetingActive) {
                this.hideMeetingAlert();
            }
        } catch (e) {
            console.error('Error handling game state change:', e);
        }
    }

    handleGameStateUpdate(gameState) {
        // Update UI elements based on game state
        this.updateProgressDisplay();
    }

    updateProgressDisplay() {
        // Update progress displays across the interface
        const event = new CustomEvent('multiplayerProgressUpdate', {
            detail: {
                players: this.gameState.players,
                currentPlayer: this.gameState.currentPlayer
            }
        });
        window.dispatchEvent(event);
    }

    // Win condition checking
    checkWinConditions() {
        const crewmates = this.gameState.players.filter(p => p.role === 'crewmate' && p.isAlive);
        const totalCrewTasks = crewmates.reduce((sum, p) => sum + p.totalTasks, 0);
        const completedCrewTasks = crewmates.reduce((sum, p) => sum + p.tasksCompleted, 0);
        
        // Crew wins if all tasks completed
        if (totalCrewTasks > 0 && completedCrewTasks >= totalCrewTasks) {
            this.declareCrewVictory();
        }
    }

    declareCrewVictory() {
        // Create victory screen
        const modal = document.createElement('div');
        modal.className = 'meeting-modal';
        modal.innerHTML = `
            <div class="meeting-content" style="background: linear-gradient(135deg, #2ed573 0%, #27ae60 100%);">
                <h2>🎉 CREWMATES WIN!</h2>
                <p>All tasks have been completed! The crew successfully maintained the ship!</p>
                <button class="action-btn primary" onclick="location.reload()">Play Again</button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    // Utility methods
    getPlayerProgress() {
        return this.gameState.players.map(player => ({
            id: player.id,
            role: player.role,
            progress: player.role === 'crewmate' ? 
                Math.round((player.tasksCompleted / player.totalTasks) * 100) : 0,
            tasksCompleted: player.tasksCompleted,
            totalTasks: player.totalTasks
        }));
    }

    getCurrentPlayer() {
        return this.gameState.currentPlayer;
    }

    isGameActive() {
        return this.gameState.isActive;
    }

    isMeetingActive() {
        return this.gameState.meetingActive;
    }

    resetGame() {
        this.gameState = {
            isActive: false,
            players: [],
            currentPlayer: null,
            meetingActive: false,
            gameStartTime: null
        };
        this.saveGameState();
        localStorage.removeItem('amongus_meeting_alert');
        
        // Hide any active meeting modals
        this.hideMeetingAlert();
        
        // Reload page to reset everything
        setTimeout(() => location.reload(), 500);
    }

    bindEvents() {
        // Emergency meeting button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'emergencyMeeting' || e.target.closest('#emergencyMeeting')) {
                this.callEmergencyMeeting(this.gameState.currentPlayer?.id);
            }
            
            if (e.target.id === 'endMeeting') {
                this.endEmergencyMeeting();
            }
        });
    }
}

// Global multiplayer manager instance
window.multiplayerManager = new MultiplayerManager();

// Export for use in other scripts
window.MultiplayerManager = MultiplayerManager;