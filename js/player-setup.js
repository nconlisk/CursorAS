class PlayerSetup {
    constructor() {
        this.playerCount = 4;
        this.players = [];
        this.currentStep = 'config'; // config, players, login
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateImpostorCount();
        this.checkExistingGame();
    }

    bindEvents() {
        // Player count controls
        document.getElementById('decreasePlayer')?.addEventListener('click', () => {
            if (this.playerCount > 3) {
                this.playerCount--;
                this.updatePlayerCount();
            }
        });

        document.getElementById('increasePlayer')?.addEventListener('click', () => {
            if (this.playerCount < 15) {
                this.playerCount++;
                this.updatePlayerCount();
            }
        });

        // Role generation
        document.getElementById('generateRoles')?.addEventListener('click', () => {
            this.generatePlayerRoles();
        });

        document.getElementById('regenerateRoles')?.addEventListener('click', () => {
            this.generatePlayerRoles();
        });

        // Game start
        document.getElementById('startGame')?.addEventListener('click', () => {
            this.startGame();
        });

        // Player login
        document.getElementById('loginPlayer')?.addEventListener('click', () => {
            this.loginPlayer();
        });

        // Admin controls
        document.getElementById('resetGame')?.addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('viewProgress')?.addEventListener('click', () => {
            this.viewAllProgress();
        });

        // Emergency meeting
        document.getElementById('emergencyMeeting')?.addEventListener('click', () => {
            window.multiplayerManager.callEmergencyMeeting();
        });

        document.getElementById('endMeeting')?.addEventListener('click', () => {
            window.multiplayerManager.endEmergencyMeeting();
        });
    }

    updatePlayerCount() {
        document.getElementById('playerCount').textContent = this.playerCount;
        this.updateImpostorCount();
    }

    updateImpostorCount() {
        const impostorCount = window.multiplayerManager.calculateImpostorCount(this.playerCount);
        document.getElementById('impostorCount').textContent = impostorCount;
    }

    generatePlayerRoles() {
        this.players = window.multiplayerManager.generatePlayers(this.playerCount);
        this.displayPlayerRoles();
        this.showSection('playerList');
    }

    displayPlayerRoles() {
        const grid = document.getElementById('playersGrid');
        grid.innerHTML = '';

        this.players.forEach(player => {
            const card = document.createElement('div');
            card.className = `player-card ${player.role}`;
            card.innerHTML = `
                <div class="player-id">${player.id}</div>
                <div class="player-role ${player.role}">
                    ${player.role === 'impostor' ? '🔴 IMPOSTOR' : '👥 CREWMATE'}
                </div>
            `;
            grid.appendChild(card);
        });
    }

    startGame() {
        window.multiplayerManager.startGame(this.players);
        this.populatePlayerSelect();
        this.showSection('playerLogin');
        
        // Show success message
        this.showNotification('Game started! Players can now log in with their assigned IDs.', 'success');
    }

    populatePlayerSelect() {
        const select = document.getElementById('playerSelect');
        select.innerHTML = '<option value="">Select Your Player ID</option>';

        this.players.forEach(player => {
            const option = document.createElement('option');
            option.value = player.id;
            option.textContent = `${player.id} (${player.role === 'impostor' ? 'Impostor' : 'Crewmate'})`;
            select.appendChild(option);
        });
    }

    loginPlayer() {
        const playerId = document.getElementById('playerSelect').value;
        if (!playerId) {
            this.showNotification('Please select a Player ID', 'error');
            return;
        }

        const player = window.multiplayerManager.loginPlayer(playerId);
        if (player) {
            this.showPlayerRole(player);
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        } else {
            this.showNotification('Invalid Player ID or game not active', 'error');
        }
    }

    showPlayerRole(player) {
        const roleDiv = document.getElementById('currentRole');
        roleDiv.className = `current-role ${player.role}`;
        roleDiv.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 10px;">
                ${player.role === 'impostor' ? '🔴' : '👥'}
            </div>
            <div>You are: <strong>${player.role.toUpperCase()}</strong></div>
            <div style="margin-top: 10px; font-size: 1rem;">
                ${player.role === 'impostor' ? 
                    'Sabotage the crew and eliminate them without being caught!' : 
                    'Complete all your tasks and find the impostors!'}
            </div>
            <div style="margin-top: 15px; font-size: 0.9rem; opacity: 0.8;">
                Redirecting to game in 3 seconds...
            </div>
        `;
        roleDiv.style.display = 'block';

        // Play role reveal sound
        this.playRoleRevealSound(player.role);
    }

    playRoleRevealSound(role) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            if (role === 'impostor') {
                // Dramatic impostor sound
                [200, 150, 100].forEach((freq, i) => {
                    setTimeout(() => {
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.value = freq;
                        oscillator.type = 'sawtooth';
                        
                        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.8);
                    }, i * 300);
                });
            } else {
                // Positive crewmate sound
                [400, 500, 600].forEach((freq, i) => {
                    setTimeout(() => {
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.value = freq;
                        oscillator.type = 'sine';
                        
                        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.4);
                    }, i * 150);
                });
            }
        } catch (e) {
            console.log('Audio not available:', e);
        }
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.setup-section').forEach(section => {
            section.style.display = 'none';
        });

        // Show requested section
        document.getElementById(sectionId)?.style.display = 'block';
        this.currentStep = sectionId;
    }

    checkExistingGame() {
        if (window.multiplayerManager.isGameActive()) {
            // Game is already active, show login
            this.players = window.multiplayerManager.gameState.players;
            this.populatePlayerSelect();
            this.showSection('playerLogin');
        }
    }

    resetGame() {
        if (confirm('Are you sure you want to reset the entire game? This will clear all progress.')) {
            window.multiplayerManager.resetGame();
        }
    }

    viewAllProgress() {
        const players = window.multiplayerManager.getPlayerProgress();
        
        let progressHtml = `
            <div class="progress-modal">
                <div class="progress-content">
                    <h3>🎯 All Player Progress</h3>
                    <div class="progress-list">
        `;

        players.forEach(player => {
            const progressPercent = player.progress;
            progressHtml += `
                <div class="progress-item">
                    <div class="progress-header">
                        <span class="player-id">${player.id}</span>
                        <span class="player-role ${player.role}">${player.role}</span>
                    </div>
                    <div class="progress-bar-small">
                        <div class="progress-fill-small" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-text-small">${player.tasksCompleted}/${player.totalTasks} tasks</div>
                </div>
            `;
        });

        progressHtml += `
                    </div>
                    <button onclick="this.closest('.progress-modal').remove()" class="action-btn primary">Close</button>
                </div>
            </div>
        `;

        // Add styles for progress modal
        const style = document.createElement('style');
        style.textContent = `
            .progress-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 3000;
            }
            .progress-content {
                background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                border-radius: 20px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            }
            .progress-content h3 {
                color: #70a1ff;
                text-align: center;
                margin-bottom: 20px;
            }
            .progress-item {
                margin-bottom: 15px;
                padding: 15px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 10px;
            }
            .progress-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
            }
            .progress-bar-small {
                height: 8px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 5px;
            }
            .progress-fill-small {
                height: 100%;
                background: linear-gradient(90deg, #ff4757 0%, #2ed573 100%);
                transition: width 0.3s ease;
            }
            .progress-text-small {
                font-size: 0.9rem;
                color: #bbb;
                text-align: center;
            }
        `;
        document.head.appendChild(style);

        const modal = document.createElement('div');
        modal.innerHTML = progressHtml;
        document.body.appendChild(modal);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 4000;
            background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#2ed573' : '#70a1ff'};
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize player setup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PlayerSetup();
});

// Add slide-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translate(-50%, -100%);
            opacity: 0;
        }
        to {
            transform: translate(-50%, 0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);