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

// N-Particle Periodic Box Simulation
class ParticleBoxSimulation {
    constructor(canvasId, timeDisplayId, particleCountDisplayId, options = {}) {
        this.canvasId = canvasId;
        this.timeDisplayId = timeDisplayId;
        this.particleCountDisplayId = particleCountDisplayId;
        
        // Simulation state
        this.animation = null;
        this.isRunning = false;
        this.currentTime = 0;
        this.particles = [];
        this.bigParticle = null;
        
        // Time-based displacement tracking
        this.deltaTime = 2; // Fixed delta_t for histogram sampling
        this.lastSampleTime = 0;
        this.lastSamplePosition = null;
        this.histogramData = []; // Total x-displacements over delta_t intervals
        this.histogramBins = 19;
        this.maxHistogramValue = 0;
        this.particlesVisible = false; // Track whether small particles should be drawn
        this.histogramVisible = true; // Track whether histogram should be drawn
        this.trailUpdateCounter = 0; // Counter for less frequent trail updates
        
        // Box parameters
        this.boxWidth = 400;
        this.boxHeight = 300;
        
        // Options
        this.options = {
            updateInterval: 20,
            baseSpeed: 1,
            speedMultiplier: 1,
            initialParticleCount: 64,
            minParticles: 1,
            maxParticles: 4096,
            particleRadius: 3,
            bigParticleRadius: 30,
            minSpeed: 1.0,
            maxSpeed: 4.0,
            bigParticleColor: '#ff0000',
            displacementFactor: 0.1,
            trailLength: 50,
            colors: [
                '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7',
                '#dda0dd', '#98d8c8', '#f7dc6f', '#bb8fce', '#85c1e9'
            ],
            ...options
        };
        
        this.initializeParticles();
        this.initializeBigParticle();
    }
    
    initializeParticles() {
        this.particles = [];
        
        for (let i = 0; i < this.options.initialParticleCount; i++) {
            this.particles.push(this.createParticle(i));
        }
    }
    
    initializeBigParticle() {
        // Place big particle at center of box
        this.bigParticle = {
            x: this.boxWidth / 2,
            y: this.boxHeight / 2,
            radius: this.options.bigParticleRadius,
            color: this.options.bigParticleColor,
            trail: []
        };
        
        // Add initial position to trail
        this.bigParticle.trail.push({x: this.bigParticle.x, y: this.bigParticle.y});
    }
    
    createParticle(index) {
        // Random position within box
        const x = Math.random() * this.boxWidth;
        const y = Math.random() * this.boxHeight;
        
        // Random velocity direction and speed
        const angle = Math.random() * 2 * Math.PI;
        const speed = this.options.minSpeed + Math.random() * (this.options.maxSpeed - this.options.minSpeed);
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        return {
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            color: this.options.colors[index % this.options.colors.length],
            id: index,
            wasColliding: false // Track collision state to prevent multiple collisions
        };
    }
    
    initialize(startBtnId, stopBtnId, resetBtnId, speedBtnId, halfBtnId, doubleBtnId) {
        // Set up button event listeners
        const startBtn = document.getElementById(startBtnId);
        const stopBtn = document.getElementById(stopBtnId);
        const resetBtn = document.getElementById(resetBtnId);
        const speedBtn = document.getElementById(speedBtnId);
        const halfBtn = document.getElementById(halfBtnId);
        const doubleBtn = document.getElementById(doubleBtnId);
        const hideParticlesBtn = document.getElementById('hideParticlesBtn');
        const resetHistogramBtn = document.getElementById('resetHistogramBtn');
        const hideHistogramBtn = document.getElementById('hideHistogramBtn');
        
        if (startBtn) startBtn.addEventListener('click', () => this.start());
        if (stopBtn) stopBtn.addEventListener('click', () => this.stop());
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
        if (speedBtn) speedBtn.addEventListener('click', () => this.toggleSpeed());
        if (halfBtn) halfBtn.addEventListener('click', () => this.halveParticles());
        if (doubleBtn) doubleBtn.addEventListener('click', () => this.doubleParticles());
        if (hideParticlesBtn) hideParticlesBtn.addEventListener('click', () => this.toggleParticleVisibility());
        if (resetHistogramBtn) resetHistogramBtn.addEventListener('click', () => this.resetHistogram());
        if (hideHistogramBtn) hideHistogramBtn.addEventListener('click', () => this.toggleHistogramVisibility());
        
        this.reset();
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateButtons();
        
        const step = () => {
            if (!this.isRunning) return;
            
            // Update all particles
            this.updateParticles();
            
            // Update display
            this.updateDisplay();
            this.draw();
            
            this.animation = setTimeout(step, this.options.updateInterval / this.options.speedMultiplier);
        };
        
        step();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animation) {
            clearTimeout(this.animation);
            this.animation = null;
        }
        this.updateButtons();
    }
    
    reset() {
        this.stop();
        
        // Reset state
        this.currentTime = 0;
        this.lastSampleTime = 0;
        this.lastSamplePosition = null;
        this.trailUpdateCounter = 0;
        
        // Reset histogram data
        this.clearHistogramData();
        
        // Reinitialize particles
        this.initializeParticles();
        this.initializeBigParticle();
        
        // Update display
        this.updateDisplay();
        this.draw();
    }
    
    clearHistogramData() {
        this.histogramData = [];
        this.maxHistogramValue = 0;
    }
    
    updateParticles() {
        // Collect total displacement from all collisions in this time step
        let totalXDisplacement = 0;
        let totalYDisplacement = 0;
        let collisionCount = 0;
        
        // Update small particles and collect collision forces
        this.particles.forEach(particle => {
            // Store old position for collision detection
            const oldX = particle.x;
            const oldY = particle.y;
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply periodic boundary conditions (wrap around)
            if (particle.x < 0) {
                particle.x += this.boxWidth;
            } else if (particle.x > this.boxWidth) {
                particle.x -= this.boxWidth;
            }
            
            if (particle.y < 0) {
                particle.y += this.boxHeight;
            } else if (particle.y > this.boxHeight) {
                particle.y -= this.boxHeight;
            }
            
            // Check collision and accumulate forces
            const collisionForce = this.getCollisionForce(particle);
            if (collisionForce) {
                totalXDisplacement += collisionForce.x;
                totalYDisplacement += collisionForce.y;
                collisionCount++;
            }
        });
        
        // Apply total displacement to big particle if there were collisions
        if (collisionCount > 0 && this.bigParticle) {
            this.bigParticle.x += totalXDisplacement;
            this.bigParticle.y += totalYDisplacement;
            
            // Apply periodic boundary conditions
            if (this.bigParticle.x < 0) {
                this.bigParticle.x += this.boxWidth;
            } else if (this.bigParticle.x > this.boxWidth) {
                this.bigParticle.x -= this.boxWidth;
            }
            
            if (this.bigParticle.y < 0) {
                this.bigParticle.y += this.boxHeight;
            } else if (this.bigParticle.y > this.boxHeight) {
                this.bigParticle.y -= this.boxHeight;
            }
            
            // Add new position to trail (less frequently for smoother curve)
            this.trailUpdateCounter++;
            if (this.trailUpdateCounter >= 10) {
                this.bigParticle.trail.push({x: this.bigParticle.x, y: this.bigParticle.y});
                this.trailUpdateCounter = 0;
                
                // Limit trail length for performance
                if (this.bigParticle.trail.length > 400) {
                    this.bigParticle.trail.shift();
                }
            }
        }
        
        // Update big particle (no velocity-based movement needed since position is updated directly on collision)
        
        // Check if it's time to sample position for histogram
        if (this.bigParticle && this.currentTime - this.lastSampleTime >= this.deltaTime) {
            this.samplePositionForHistogram();
        }
        
        this.currentTime++;
    }
    
    getCollisionForce(particle) {
        if (!this.bigParticle) return null;
        
        // Calculate distance between particle and big particle
        let dx = particle.x - this.bigParticle.x;
        let dy = particle.y - this.bigParticle.y;
        
        // Handle periodic boundary wrapping for collision detection
        if (dx > this.boxWidth / 2) dx -= this.boxWidth;
        else if (dx < -this.boxWidth / 2) dx += this.boxWidth;
        
        if (dy > this.boxHeight / 2) dy -= this.boxHeight;
        else if (dy < -this.boxHeight / 2) dy += this.boxHeight;
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        const collisionDistance = (this.options.particleRadius + this.bigParticle.radius) * (2/3); // 2/3 of displayed radius
        
        // Check if currently colliding
        const isColliding = distance < collisionDistance && distance > 0;
        
        // Only trigger collision if not previously colliding (new collision)
        if (isColliding && !particle.wasColliding) {
            // Use particle's velocity direction instead of position-based direction
            const velocityMagnitude = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            let dirX, dirY;
            
            if (velocityMagnitude > 0) {
                // Normalize velocity vector to get direction
                dirX = particle.vx / velocityMagnitude;
                dirY = particle.vy / velocityMagnitude;
            } else {
                // Fallback to position-based direction if particle has no velocity
                dirX = dx / distance;
                dirY = dy / distance;
            }
            
            // Calculate displacement force
            // Scale inversely with square root of number of particles
            const baseStepSize = 42.88; // Decreased by factor of 3 from 128.64
            const scaledStepSize = baseStepSize / Math.sqrt(this.particles.length);
            
            // Calculate 0.9 of the small particle's displacement per time step
            const particleSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
            const limitedStepSize = particleSpeed * 0.9;
            
            // Use the minimum of the two to prevent big particle from moving ahead of small particles
            const stepSize = Math.min(scaledStepSize, limitedStepSize);
            
            // Update collision state
            particle.wasColliding = isColliding;
            
            // Return force vector
            return {
                x: dirX * stepSize,
                y: dirY * stepSize
            };
        }
        
        // Update collision state
        particle.wasColliding = isColliding;
        
        return null;
    }
    
    samplePositionForHistogram() {
        if (!this.bigParticle) return;
        
        const currentPos = { x: this.bigParticle.x, y: this.bigParticle.y };
        
        if (this.lastSamplePosition !== null) {
            // Calculate x-displacement with periodic boundary handling
            let xDisplacement = currentPos.x - this.lastSamplePosition.x;
            
            // Handle periodic boundary wrapping
            if (xDisplacement > this.boxWidth / 2) {
                xDisplacement -= this.boxWidth;
            } else if (xDisplacement < -this.boxWidth / 2) {
                xDisplacement += this.boxWidth;
            }
            
            // Add to histogram data
            this.histogramData.push(xDisplacement);
            
            // Update histogram scale
            this.updateHistogramScale();
        }
        
        // Update for next sample
        this.lastSamplePosition = { ...currentPos };
        this.lastSampleTime = this.currentTime;
    }
    
    updateHistogramScale() {
        if (this.histogramData.length === 0) {
            this.maxHistogramValue = 0;
            return;
        }
        
        // Create bins
        const binCounts = new Array(this.histogramBins).fill(0);
        const minVal = Math.min(...this.histogramData);
        const maxVal = Math.max(...this.histogramData);
        const range = maxVal - minVal;
        
        if (range === 0) {
            this.maxHistogramValue = 1;
            return;
        }
        
        // Count values in bins
        this.histogramData.forEach(value => {
            let binIndex = Math.floor(((value - minVal) / range) * (this.histogramBins - 1));
            binIndex = Math.max(0, Math.min(this.histogramBins - 1, binIndex));
            binCounts[binIndex]++;
        });
        
        // Find maximum bin count for scaling
        this.maxHistogramValue = Math.max(...binCounts);
        if (this.maxHistogramValue === 0) this.maxHistogramValue = 1;
    }
    
    halveParticles() {
        if (this.particles.length <= this.options.minParticles) return;
        
        const newCount = Math.max(this.options.minParticles, Math.floor(this.particles.length / 2));
        this.particles = this.particles.slice(0, newCount);
        
        this.updateDisplay();
    }
    
    doubleParticles() {
        if (this.particles.length >= this.options.maxParticles) return;
        
        const currentCount = this.particles.length;
        const newCount = Math.min(this.options.maxParticles, currentCount * 2);
        const particlesToAdd = newCount - currentCount;
        
        for (let i = 0; i < particlesToAdd; i++) {
            this.particles.push(this.createParticle(currentCount + i));
        }
        
        this.updateDisplay();
    }
    
    toggleParticleVisibility() {
        this.particlesVisible = !this.particlesVisible;
        
        // Update button text
        const hideParticlesBtn = document.getElementById('hideParticlesBtn');
        if (hideParticlesBtn) {
            hideParticlesBtn.textContent = this.particlesVisible ? 'Hide Particles' : 'Show Particles';
        }
    }
    
    resetHistogram() {
        this.clearHistogramData();
        this.updateDisplay();
    }
    
    toggleHistogramVisibility() {
        this.histogramVisible = !this.histogramVisible;
        
        // Update button text
        const hideHistogramBtn = document.getElementById('hideHistogramBtn');
        if (hideHistogramBtn) {
            hideHistogramBtn.textContent = this.histogramVisible ? 'Hide Histogram' : 'Show Histogram';
        }
    }
    
    updateDisplay() {
        // Update time display
        const timeDisplay = document.getElementById(this.timeDisplayId);
        if (timeDisplay) {
            timeDisplay.textContent = this.currentTime.toString();
        }
        
        // Update particle count display
        const particleCountDisplay = document.getElementById(this.particleCountDisplayId);
        if (particleCountDisplay) {
            particleCountDisplay.textContent = this.particles.length.toString();
        }
        
        // Update speed display
        const speedDisplay = document.getElementById('speedDisplayParticles');
        if (speedDisplay) {
            speedDisplay.textContent = this.options.speedMultiplier + 'x';
        }
        
        // Update box size display
        const boxSizeDisplay = document.getElementById('boxSizeDisplay');
        if (boxSizeDisplay) {
            boxSizeDisplay.textContent = `${this.boxWidth}×${this.boxHeight}`;
        }
        
        // Update histogram sample count
        const histogramSampleCount = document.getElementById('histogramSampleCount');
        if (histogramSampleCount) {
            histogramSampleCount.textContent = this.histogramData.length.toString();
        }
    }
    
    updateButtons() {
        const startBtn = document.getElementById('startBtnParticles');
        const stopBtn = document.getElementById('stopBtnParticles');
        
        if (startBtn && stopBtn) {
            startBtn.disabled = this.isRunning;
            stopBtn.disabled = !this.isRunning;
        }
    }
    
    toggleSpeed() {
        this.options.speedMultiplier = this.options.speedMultiplier === 1 ? 2 : 1;
        this.updateDisplay();
    }
    
    draw() {
        const canvas = document.getElementById(this.canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        // Clear canvas
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Calculate scaling and offset to position the box on the left
        const scaleX = (canvasWidth * 0.6 - 20) / this.boxWidth; // Use 60% of canvas width
        const scaleY = (canvasHeight - 40) / this.boxHeight;
        const scale = Math.min(scaleX, scaleY);
        
        const offsetX = 20; // Left-aligned with minimal padding
        const offsetY = (canvasHeight - this.boxHeight * scale) / 2;
        
        // Draw box boundary
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX, offsetY, this.boxWidth * scale, this.boxHeight * scale);
        
        // Draw particles (conditionally visible)
        if (this.particlesVisible) {
            this.particles.forEach(particle => {
                // Draw particle (trail drawing removed)
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(
                    offsetX + particle.x * scale,
                    offsetY + particle.y * scale,
                    this.options.particleRadius,
                    0,
                    2 * Math.PI
                );
                ctx.fill();
            });
        }
        
        // Draw big particle
        if (this.bigParticle) {
            // Draw big particle trail
            if (this.bigParticle.trail.length > 1) {
                // Draw white outline first (thicker)
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 5;
                
                this.drawTrailSegments(ctx, offsetX, offsetY, scale);
                
                // Draw red trail on top (non-transparent)
                ctx.strokeStyle = this.bigParticle.color;
                ctx.lineWidth = 3;
                
                this.drawTrailSegments(ctx, offsetX, offsetY, scale);
            }
            
            // Draw big particle
            ctx.fillStyle = this.bigParticle.color;
            ctx.beginPath();
            ctx.arc(
                offsetX + this.bigParticle.x * scale,
                offsetY + this.bigParticle.y * scale,
                this.bigParticle.radius * scale * 0.5, // Scale down for visual balance
                0,
                2 * Math.PI
            );
            ctx.fill();
            
            // Draw outline for big particle
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Draw info text
        ctx.fillStyle = '#cccccc';
        ctx.font = '14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Particles: ${this.particles.length}`, 10, 25);
        ctx.fillText(`Time: ${this.currentTime}`, 10, 45);
        ctx.fillText(`Samples: ${this.histogramData.length}`, 10, 65);
        
        // Draw histogram on the right side (conditionally)
        if (this.histogramVisible) {
            this.drawHistogram(ctx, canvasWidth, canvasHeight);
        }
    }
    
    drawHistogram(ctx, canvasWidth, canvasHeight) {
        if (this.histogramData.length === 0) return;
        
        // Calculate simulation box dimensions for alignment
        const scaleX = (canvasWidth * 0.6 - 20) / this.boxWidth;
        const scaleY = (canvasHeight - 40) / this.boxHeight;
        const scale = Math.min(scaleX, scaleY);
        const simBoxWidth = this.boxWidth * scale;
        const simBoxHeight = this.boxHeight * scale;
        const simBoxY = (canvasHeight - simBoxHeight) / 2;
        
        // Histogram dimensions - aligned to right of simulation box
        const histogramHeight = simBoxHeight; // Match simulation box height
        const histogramWidth = histogramHeight / 2; // Half the height
        const histogramX = 20 + simBoxWidth + 60; // Right of simulation box with larger gap
        const histogramY = simBoxY; // Same vertical alignment as simulation box
        
        // Calculate bin data with fixed range
        const binCounts = new Array(this.histogramBins).fill(0);
        const minVal = -4; // Fixed minimum
        const maxVal = 4;  // Fixed maximum
        const range = maxVal - minVal; // Always 8
        
        // Count values in bins (only include values within range)
        this.histogramData.forEach(value => {
            if (value >= minVal && value <= maxVal) {
                let binIndex = Math.floor(((value - minVal) / range) * this.histogramBins);
                binIndex = Math.max(0, Math.min(this.histogramBins - 1, binIndex));
                binCounts[binIndex]++;
            }
        });
        
        // Draw histogram background
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(histogramX, histogramY, histogramWidth, histogramHeight);
        
        // Draw histogram border
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 1;
        ctx.strokeRect(histogramX, histogramY, histogramWidth, histogramHeight);
        
        // Draw horizontal histogram bars
        const binHeight = histogramHeight / this.histogramBins;
        binCounts.forEach((count, i) => {
            if (count > 0) {
                const barWidth = (count / this.maxHistogramValue) * histogramWidth;
                const barX = histogramX;
                const barY = histogramY + i * binHeight;
                
                ctx.fillStyle = '#4ecdc4';
                ctx.fillRect(barX, barY, barWidth, binHeight - 1);
                
                // Draw count text on the bar
                ctx.fillStyle = '#ffffff';
                ctx.font = '10px Arial';
                ctx.textAlign = 'left';
                const textX = barX + barWidth + 3; // Position text just after the bar
                const textY = barY + binHeight / 2 + 3; // Center vertically in the bar
                ctx.fillText(count.toString(), textX, textY);
            }
        });
        
        // Draw histogram title and labels
        ctx.fillStyle = '#cccccc';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('X-Displacement (Δt)', histogramX + histogramWidth / 2, histogramY - 10);
        
        // Draw axis labels (fixed range)
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('-4', histogramX - 5, histogramY + histogramHeight - 5);
        ctx.textAlign = 'right';
        ctx.fillText('4', histogramX - 5, histogramY + 15);
        ctx.textAlign = 'right';
        ctx.fillText('0', histogramX - 5, histogramY + histogramHeight / 2 + 5);
    }
    
    drawTrailSegments(ctx, offsetX, offsetY, scale) {
        if (this.bigParticle.trail.length < 2) return;
        
        ctx.beginPath();
        let pathStarted = false;
        
        for (let i = 0; i < this.bigParticle.trail.length; i++) {
            const point = this.bigParticle.trail[i];
            
            if (i === 0) {
                // Start the first segment
                ctx.moveTo(
                    offsetX + point.x * scale,
                    offsetY + point.y * scale
                );
                pathStarted = true;
            } else {
                const prevPoint = this.bigParticle.trail[i - 1];
                
                // Check for wrap-around (large jump in position)
                const dx = Math.abs(point.x - prevPoint.x);
                const dy = Math.abs(point.y - prevPoint.y);
                const isWrapAround = dx > this.boxWidth / 2 || dy > this.boxHeight / 2;
                
                if (isWrapAround) {
                    // Break the path - stroke current segment and start new one
                    if (pathStarted) {
                        ctx.stroke();
                        ctx.beginPath();
                    }
                    ctx.moveTo(
                        offsetX + point.x * scale,
                        offsetY + point.y * scale
                    );
                    pathStarted = true;
                } else {
                    // Continue the current segment
                    if (!pathStarted) {
                        ctx.moveTo(
                            offsetX + point.x * scale,
                            offsetY + point.y * scale
                        );
                        pathStarted = true;
                    } else {
                        ctx.lineTo(
                            offsetX + point.x * scale,
                            offsetY + point.y * scale
                        );
                    }
                }
            }
        }
        
        // Stroke the final segment
        if (pathStarted) {
            ctx.stroke();
        }
    }
}

// Global simulation instances
let simulation1, simulation2, particleBox;

// Initialize all simulations
function initializeSimulations() {
    // N-Particle periodic box simulation
    particleBox = new ParticleBoxSimulation(
        'particleBoxCanvas',
        'timeDisplayParticles',
        'particleCountDisplay'
    );
    particleBox.initialize(
        'startBtnParticles', 
        'stopBtnParticles', 
        'resetBtnParticles', 
        'speedBtnParticles',
        'halfParticlesBtn',
        'doubleParticlesBtn'
    );
    
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