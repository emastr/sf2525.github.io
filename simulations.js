// Random Walk Simulation Module
// This module handles all random walk simulation functionality

// Generate random normal (Gaussian) number using Box-Muller transform
function randomNormal() {
    let u1 = Math.random();
    let u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// RandomWalk class to handle individual walk simulations
class RandomWalk {
    constructor(canvasId, timeDisplayId, stepSizeDisplayId, options = {}) {
        this.canvasId = canvasId;
        this.timeDisplayId = timeDisplayId;
        this.stepSizeDisplayId = stepSizeDisplayId;
        
        // Simulation state
        this.animation = null;
        this.isRunning = false;
        this.currentTime = 0;
        this.stepCount = 0;
        this.currentStepSize = 1;
        this.currentTimeDelta = 1;
        
        // Trajectory data
        this.trajectories = [];
        
        // Options
        this.options = {
            updateInterval: 50,
            baseSpeed: 1,
            speedMultiplier: 1,
            viewHeightScale: 2,
            colors: ['#66b3ff', '#66ff66', '#ff6666', '#ffcc66'],
            ...options
        };
        
        // Initialize trajectories based on options
        this.initializeTrajectories();
    }
    
    initializeTrajectories() {
        if (this.options.trajectoryTypes) {
            this.options.trajectoryTypes.forEach((type, index) => {
                this.trajectories.push({
                    type: type, // 'discrete' or 'normal'
                    data: [],
                    position: 0,
                    color: this.options.colors[index % this.options.colors.length]
                });
            });
        } else {
            // Default single discrete trajectory
            this.trajectories.push({
                type: 'discrete',
                data: [],
                position: 0,
                color: this.options.colors[0]
            });
        }
    }
    
    initialize(startBtnId, stopBtnId, resetBtnId, speedBtnId) {
        const canvas = document.getElementById(this.canvasId);
        if (!canvas) return;
        
        const startBtn = document.getElementById(startBtnId);
        const stopBtn = document.getElementById(stopBtnId);
        const resetBtn = document.getElementById(resetBtnId);
        const speedBtn = document.getElementById(speedBtnId);
        
        if (startBtn) startBtn.addEventListener('click', () => this.start());
        if (stopBtn) stopBtn.addEventListener('click', () => this.stop());
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
        if (speedBtn) speedBtn.addEventListener('click', () => this.doubleSpeed());
        
        this.draw();
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateButtons(true);
        
        const interval = this.options.updateInterval / this.options.speedMultiplier;
        this.animation = setInterval(() => {
            this.step();
        }, interval);
    }
    
    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        clearInterval(this.animation);
        this.updateButtons(false);
    }
    
    reset() {
        this.stop();
        
        this.currentTime = 0;
        this.stepCount = 0;
        this.currentStepSize = 1;
        this.currentTimeDelta = 1;
        this.options.speedMultiplier = 1;
        
        this.trajectories.forEach(trajectory => {
            trajectory.data = [];
            trajectory.position = 0;
        });
        
        this.updateDisplays();
        this.draw();
    }
    
    step() {
        this.stepCount++;
        
        this.currentTime += this.currentTimeDelta;
        
        // Update each trajectory
        this.trajectories.forEach(trajectory => {
            let step;
            if (trajectory.type === 'discrete') {
                step = (Math.random() < 0.5 ? -1 : 1) * this.currentStepSize;
            } else if (trajectory.type === 'normal') {
                step = randomNormal() * this.currentStepSize;
            }
            
            trajectory.position += step;
            trajectory.data.push({
                time: this.currentTime,
                position: trajectory.position
            });
        });
        
        this.updateDisplays();
        this.draw();
    }
    
    updateButtons(isRunning) {
        // Map canvas IDs to button IDs
        const idMap = {
            'randomWalkCanvas': { start: 'startBtn', stop: 'stopBtn', speed: 'speedBtn' },
            'randomWalkCanvas2': { start: 'startBtn2', stop: 'stopBtn2', speed: 'speedBtn2' }
        };
        
        const buttons = idMap[this.canvasId];
        if (!buttons) return;
        
        const startBtn = document.getElementById(buttons.start);
        const stopBtn = document.getElementById(buttons.stop);
        
        if (startBtn) startBtn.disabled = isRunning;
        if (stopBtn) stopBtn.disabled = !isRunning;
    }
    
    doubleSpeed() {
        this.options.speedMultiplier *= 2;
        if (this.isRunning) {
            this.stop();
            this.start();
        }
        this.updateSpeedDisplay();
    }
    
    doubleSpeed() {
        this.options.speedMultiplier *= 2;
        if (this.isRunning) {
            this.stop();
            this.start();
        }
        this.updateSpeedDisplay();
    }
    
    updateSpeedDisplay() {
        // Map canvas IDs to speed display IDs
        const idMap = {
            'randomWalkCanvas': 'speedDisplay',
            'randomWalkCanvas2': 'speedDisplay2'
        };
        
        const speedDisplay = document.getElementById(idMap[this.canvasId]);
        if (speedDisplay) {
            speedDisplay.textContent = `${this.options.speedMultiplier}x`;
        }
    }
    
    updateDisplays() {
        const timeDisplay = document.getElementById(this.timeDisplayId);
        const stepSizeDisplay = document.getElementById(this.stepSizeDisplayId);
        
        if (timeDisplay) timeDisplay.textContent = Math.round(this.currentTime * 10) / 10;
        if (stepSizeDisplay) stepSizeDisplay.textContent = Math.round(this.currentStepSize * 100) / 100;
        
        this.updateSpeedDisplay();
    }
    
    draw() {
        const canvas = document.getElementById(this.canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.fillStyle = '#121212';
        ctx.fillRect(0, 0, width, height);
        
        // Calculate view bounds
        const viewHeight = Math.max(20, Math.sqrt(Math.max(1, this.currentTime)) * this.options.viewHeightScale);
        const timeRange = Math.max(100, this.currentTime + 20);
        
        // Draw axes and grid
        this.drawAxes(ctx, width, height, viewHeight, 0, timeRange);
        
        if (this.trajectories.every(t => t.data.length === 0)) {
            // Draw initial points
            this.trajectories.forEach((trajectory, index) => {
                ctx.fillStyle = trajectory.color;
                ctx.beginPath();
                const offset = (index - (this.trajectories.length - 1) / 2) * 20;
                ctx.arc(width / 2 + offset, height / 2, 5, 0, 2 * Math.PI);
                ctx.fill();
            });
            return;
        }
        
        // Draw each trajectory
        this.trajectories.forEach(trajectory => {
            if (trajectory.data.length > 1) {
                ctx.strokeStyle = trajectory.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                
                for (let i = 0; i < trajectory.data.length; i++) {
                    const point = trajectory.data[i];
                    const x = (point.time / timeRange) * width;
                    const y = height / 2 - (point.position / viewHeight) * (height / 2);
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                
                ctx.stroke();
            }
            
            // Draw current position
            if (trajectory.data.length > 0) {
                const lastPoint = trajectory.data[trajectory.data.length - 1];
                const x = (lastPoint.time / timeRange) * width;
                const y = height / 2 - (lastPoint.position / viewHeight) * (height / 2);
                
                ctx.fillStyle = trajectory.color;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            }
        });
        
        // Draw theoretical bounds (±sqrt(t))
        if (this.currentTime > 0) {
            ctx.strokeStyle = '#95a5a6';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            
            // Upper bound
            ctx.beginPath();
            for (let t = 1; t <= this.currentTime; t += Math.max(1, this.currentTime / 100)) {
                const x = (t / timeRange) * width;
                const y = height / 2 - (Math.sqrt(t) / viewHeight) * (height / 2);
                if (t === 1) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            
            // Lower bound
            ctx.beginPath();
            for (let t = 1; t <= this.currentTime; t += Math.max(1, this.currentTime / 100)) {
                const x = (t / timeRange) * width;
                const y = height / 2 - (-Math.sqrt(t) / viewHeight) * (height / 2);
                if (t === 1) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            
            ctx.setLineDash([]);
        }
    }
    
    drawAxes(ctx, width, height, viewHeight, minTime, maxTime) {
        ctx.strokeStyle = '#404040';
        ctx.lineWidth = 1;
        
        // Draw horizontal center line (y=0)
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        
        // Add axis labels
        ctx.fillStyle = '#cccccc';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        // Position axis labels (simplified)
        ctx.textAlign = 'right';
        const maxPos = viewHeight / 2;
        ctx.fillText(Math.round(maxPos).toString(), width - 5, 15);
        ctx.fillText('0', width - 5, height / 2 + 5);
        ctx.fillText((-Math.round(maxPos)).toString(), width - 5, height - 5);
    }
}

// Global simulation instances
let simulation1, simulation2;

// Initialize all simulations
function initializeSimulations() {
    // Simulation 1: Single discrete trajectory
    simulation1 = new RandomWalk(
        'randomWalkCanvas',
        'timeDisplay',
        'stepSizeDisplay',
        {
            trajectoryTypes: ['discrete'],
            viewHeightScale: 2
        }
    );
    simulation1.initialize('startBtn', 'stopBtn', 'resetBtn', 'speedBtn');
    
    // Simulation 2: Discrete and normal trajectories
    simulation2 = new RandomWalk(
        'randomWalkCanvas2',
        'timeDisplay2',
        'stepSizeDisplay2',
        {
            trajectoryTypes: ['discrete', 'normal'],
            viewHeightScale: 2
        }
    );
    simulation2.initialize('startBtn2', 'stopBtn2', 'resetBtn2', 'speedBtn2');
}