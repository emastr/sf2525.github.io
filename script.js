// Global variables
let simulations = {};
let animationFrames = {};

// Initialize all simulations when page loads
document.addEventListener('DOMContentLoaded', function() {
    for (let i = 1; i <= 14; i++) {
        initializeSimulation(i);
    }
});

// Tab functionality
function openTab(event, lectureId) {
    // Hide all tab contents
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    // Remove active class from all tab buttons
    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    // Show selected tab content and mark button as active
    document.getElementById(lectureId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// Initialize simulation for each lecture
function initializeSimulation(lectureNum) {
    const canvas = document.getElementById(`canvas${lectureNum}`);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    simulations[lectureNum] = {
        canvas: canvas,
        ctx: ctx,
        particles: [],
        isRunning: false,
        time: 0,
        parameters: getDefaultParameters(lectureNum)
    };
    
    resetSimulation(lectureNum);
}

// Get default parameters for each lecture type
function getDefaultParameters(lectureNum) {
    const defaults = {
        1: { particles: 10, speed: 1 },
        2: { drift: 0.5, particles: 5 },
        3: { speed: 1, particles: 8 },
        4: { volatility: 0.3, initialValue: 100, mu: 0.05 },
        5: { reversion: 0.5, theta: 0, particles: 5 },
        6: { hurst: 0.5, particles: 3 },
        7: { bridgeEnd: 0, duration: 800 },
        8: { jumpRate: 0.05, jumpSize: 20 },
        9: { correlation: 0, particles: 6 },
        10: { barriers: true, upperBarrier: 100, lowerBarrier: 300 },
        11: { stopLevel: 150, particles: 8 },
        12: { boundaryWidth: 200, particles: 6 },
        13: { noise: 1, drift: 0.1 },
        14: { complexity: 3, particles: 12 }
    };
    return defaults[lectureNum] || { particles: 5 };
}

// Start simulation
function startSimulation(lectureNum) {
    if (simulations[lectureNum].isRunning) return;
    
    simulations[lectureNum].isRunning = true;
    animate(lectureNum);
}

// Stop simulation
function stopSimulation(lectureNum) {
    simulations[lectureNum].isRunning = false;
    if (animationFrames[lectureNum]) {
        cancelAnimationFrame(animationFrames[lectureNum]);
    }
}

// Reset simulation
function resetSimulation(lectureNum) {
    stopSimulation(lectureNum);
    const sim = simulations[lectureNum];
    
    sim.particles = [];
    sim.time = 0;
    
    // Create particles based on lecture type
    createParticles(lectureNum);
    
    // Clear canvas and draw initial state
    sim.ctx.fillStyle = '#ffffff';
    sim.ctx.fillRect(0, 0, sim.canvas.width, sim.canvas.height);
    
    drawBackground(lectureNum);
}

// Create particles for different simulation types
function createParticles(lectureNum) {
    const sim = simulations[lectureNum];
    const params = sim.parameters;
    
    switch (lectureNum) {
        case 1: // Basic Brownian Motion
            for (let i = 0; i < params.particles; i++) {
                sim.particles.push({
                    x: sim.canvas.width / 2,
                    y: sim.canvas.height / 2,
                    trail: [{ x: sim.canvas.width / 2, y: sim.canvas.height / 2 }],
                    color: `hsl(${i * 360 / params.particles}, 70%, 50%)`
                });
            }
            break;
            
        case 2: // Brownian Motion with Drift
            for (let i = 0; i < 5; i++) {
                sim.particles.push({
                    x: 50,
                    y: sim.canvas.height / 2 + (i - 2) * 50,
                    trail: [{ x: 50, y: sim.canvas.height / 2 + (i - 2) * 50 }],
                    color: `hsl(${i * 72}, 70%, 50%)`
                });
            }
            break;
            
        case 3: // 2D Brownian Motion
            for (let i = 0; i < 8; i++) {
                sim.particles.push({
                    x: sim.canvas.width / 2 + (Math.random() - 0.5) * 100,
                    y: sim.canvas.height / 2 + (Math.random() - 0.5) * 100,
                    trail: [],
                    color: `hsl(${i * 45}, 70%, 50%)`
                });
            }
            break;
            
        case 4: // Geometric Brownian Motion
            sim.particles.push({
                x: 50,
                y: sim.canvas.height / 2,
                value: params.initialValue,
                trail: [{ x: 50, y: sim.canvas.height / 2 }],
                color: '#ff6b6b'
            });
            break;
            
        case 5: // Ornstein-Uhlenbeck
            for (let i = 0; i < 5; i++) {
                sim.particles.push({
                    x: 50,
                    y: sim.canvas.height / 2,
                    value: 0,
                    trail: [{ x: 50, y: sim.canvas.height / 2 }],
                    color: `hsl(${i * 72}, 70%, 50%)`
                });
            }
            break;
            
        default:
            // Generic particle creation for other lectures
            const count = params.particles || 5;
            for (let i = 0; i < count; i++) {
                sim.particles.push({
                    x: sim.canvas.width / 2,
                    y: sim.canvas.height / 2,
                    trail: [{ x: sim.canvas.width / 2, y: sim.canvas.height / 2 }],
                    color: `hsl(${i * 360 / count}, 70%, 50%)`
                });
            }
    }
}

// Draw background elements specific to each lecture
function drawBackground(lectureNum) {
    const sim = simulations[lectureNum];
    const ctx = sim.ctx;
    
    switch (lectureNum) {
        case 10: // Reflecting Brownian Motion
            if (sim.parameters.barriers) {
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, sim.parameters.upperBarrier);
                ctx.lineTo(sim.canvas.width, sim.parameters.upperBarrier);
                ctx.moveTo(0, sim.parameters.lowerBarrier);
                ctx.lineTo(sim.canvas.width, sim.parameters.lowerBarrier);
                ctx.stroke();
            }
            break;
            
        case 11: // Stopped Brownian Motion
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(0, sim.parameters.stopLevel);
            ctx.lineTo(sim.canvas.width, sim.parameters.stopLevel);
            ctx.stroke();
            ctx.setLineDash([]);
            break;
            
        case 12: // Boundaries
            const centerY = sim.canvas.height / 2;
            const width = sim.parameters.boundaryWidth;
            ctx.strokeStyle = '#4ecdc4';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, centerY - width/2);
            ctx.lineTo(sim.canvas.width, centerY - width/2);
            ctx.moveTo(0, centerY + width/2);
            ctx.lineTo(sim.canvas.width, centerY + width/2);
            ctx.stroke();
            break;
    }
}

// Main animation loop
function animate(lectureNum) {
    if (!simulations[lectureNum].isRunning) return;
    
    updateParticlePositions(lectureNum);
    draw(lectureNum);
    
    simulations[lectureNum].time++;
    animationFrames[lectureNum] = requestAnimationFrame(() => animate(lectureNum));
}

// Update particle positions based on lecture type
function updateParticlePositions(lectureNum) {
    const sim = simulations[lectureNum];
    const params = sim.parameters;
    
    sim.particles.forEach((particle, index) => {
        let dx = 0, dy = 0;
        
        switch (lectureNum) {
            case 1: // Basic Brownian Motion
                dx = (Math.random() - 0.5) * 4;
                dy = (Math.random() - 0.5) * 4;
                break;
                
            case 2: // Brownian Motion with Drift
                dx = params.drift + (Math.random() - 0.5) * 2;
                dy = (Math.random() - 0.5) * 1;
                break;
                
            case 3: // 2D Brownian Motion
                dx = (Math.random() - 0.5) * params.speed * 3;
                dy = (Math.random() - 0.5) * params.speed * 3;
                break;
                
            case 4: // Geometric Brownian Motion
                const dt = 0.01;
                const dW = (Math.random() - 0.5) * Math.sqrt(dt) * 2;
                particle.value *= Math.exp((params.mu - 0.5 * params.volatility * params.volatility) * dt + params.volatility * dW);
                particle.x += 2;
                particle.y = sim.canvas.height / 2 - (particle.value - params.initialValue) * 2;
                break;
                
            case 5: // Ornstein-Uhlenbeck
                const dtOU = 0.01;
                const dWOU = (Math.random() - 0.5) * Math.sqrt(dtOU) * 3;
                particle.value += -params.reversion * (particle.value - params.theta) * dtOU + dWOU;
                particle.x += 2;
                particle.y = sim.canvas.height / 2 + particle.value * 20;
                break;
                
            case 6: // Fractional Brownian Motion
                // Simplified fractional Brownian motion
                const H = params.hurst;
                dx = Math.pow(sim.time + 1, H - 0.5) * (Math.random() - 0.5) * 2;
                dy = Math.pow(sim.time + 1, H - 0.5) * (Math.random() - 0.5) * 2;
                break;
                
            case 7: // Bridge Process
                const progress = particle.x / params.duration;
                if (progress < 1) {
                    const bridgeCorrection = (params.bridgeEnd - particle.y + sim.canvas.height/2) * progress * 0.001;
                    dx = 2;
                    dy = (Math.random() - 0.5) * 3 + bridgeCorrection;
                } else {
                    dx = 0;
                    dy = 0;
                }
                break;
                
            case 8: // Jump Diffusion
                dx = (Math.random() - 0.5) * 2;
                dy = (Math.random() - 0.5) * 2;
                // Add jumps
                if (Math.random() < params.jumpRate) {
                    dy += (Math.random() - 0.5) * params.jumpSize;
                }
                break;
                
            case 9: // Multi-dimensional with correlation
                const dW1 = (Math.random() - 0.5) * 2;
                const dW2 = (Math.random() - 0.5) * 2;
                dx = dW1;
                dy = params.correlation * dW1 + Math.sqrt(1 - params.correlation * params.correlation) * dW2;
                break;
                
            case 10: // Reflecting Brownian Motion
                dx = (Math.random() - 0.5) * 3;
                dy = (Math.random() - 0.5) * 3;
                // Reflect at boundaries
                if (particle.y + dy < params.upperBarrier || particle.y + dy > params.lowerBarrier) {
                    dy = -dy;
                }
                break;
                
            case 11: // Stopped Brownian Motion
                if (particle.y < params.stopLevel) {
                    dx = (Math.random() - 0.5) * 3;
                    dy = (Math.random() - 0.5) * 3;
                } else {
                    dx = 0;
                    dy = 0;
                }
                break;
                
            case 12: // Boundaries
                dx = (Math.random() - 0.5) * 3;
                dy = (Math.random() - 0.5) * 3;
                const centerY = sim.canvas.height / 2;
                const width = params.boundaryWidth;
                if (particle.y + dy < centerY - width/2 || particle.y + dy > centerY + width/2) {
                    dy = -dy * 0.8; // Absorbing boundary
                }
                break;
                
            case 13: // SDE
                dx = params.drift * 10 + (Math.random() - 0.5) * params.noise * 4;
                dy = (Math.random() - 0.5) * params.noise * 2;
                break;
                
            case 14: // Complex simulation
                const complexity = params.complexity;
                dx = (Math.random() - 0.5) * complexity;
                dy = (Math.random() - 0.5) * complexity;
                // Add some deterministic component
                dx += Math.sin(sim.time * 0.01 * complexity) * 0.5;
                dy += Math.cos(sim.time * 0.01 * complexity) * 0.5;
                break;
        }
        
        // Update position
        particle.x += dx;
        particle.y += dy;
        
        // Boundary conditions (wrap around for most cases)
        if (particle.x > sim.canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = sim.canvas.width;
        if (particle.y > sim.canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = sim.canvas.height;
        
        // Add to trail
        if (!particle.trail) particle.trail = [];
        particle.trail.push({ x: particle.x, y: particle.y });
        
        // Limit trail length
        if (particle.trail.length > 200) {
            particle.trail.shift();
        }
    });
}

// Draw the simulation
function draw(lectureNum) {
    const sim = simulations[lectureNum];
    const ctx = sim.ctx;
    
    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, sim.canvas.width, sim.canvas.height);
    
    drawBackground(lectureNum);
    
    // Draw particles and trails
    sim.particles.forEach((particle, index) => {
        // Draw trail
        if (particle.trail && particle.trail.length > 1) {
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
            
            for (let i = 1; i < particle.trail.length; i++) {
                ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
            }
            ctx.stroke();
        }
        
        // Draw particle
        ctx.globalAlpha = 1;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.globalAlpha = 1;
}

// Control panel update functions
function updateParticles(lectureNum) {
    const value = document.getElementById(`particles${lectureNum}`).value;
    document.getElementById(`particleCount${lectureNum}`).textContent = value;
    simulations[lectureNum].parameters.particles = parseInt(value);
    resetSimulation(lectureNum);
}

function updateDrift(lectureNum) {
    const value = document.getElementById(`drift${lectureNum}`).value;
    document.getElementById(`driftValue${lectureNum}`).textContent = value;
    simulations[lectureNum].parameters.drift = parseFloat(value);
}

function updateSpeed(lectureNum) {
    const value = document.getElementById(`speed${lectureNum}`).value;
    document.getElementById(`speedValue${lectureNum}`).textContent = value;
    simulations[lectureNum].parameters.speed = parseFloat(value);
}

function updateVolatility(lectureNum) {
    const value = document.getElementById(`volatility${lectureNum}`).value;
    document.getElementById(`volatilityValue${lectureNum}`).textContent = value;
    simulations[lectureNum].parameters.volatility = parseFloat(value);
}

function updateReversion(lectureNum) {
    const value = document.getElementById(`reversion${lectureNum}`).value;
    document.getElementById(`reversionValue${lectureNum}`).textContent = value;
    simulations[lectureNum].parameters.reversion = parseFloat(value);
}

function updateHurst(lectureNum) {
    const value = document.getElementById(`hurst${lectureNum}`).value;
    document.getElementById(`hurstValue${lectureNum}`).textContent = value;
    simulations[lectureNum].parameters.hurst = parseFloat(value);
}

function updateBridgeEnd(lectureNum) {
    const value = document.getElementById(`bridgeEnd${lectureNum}`).value;
    document.getElementById(`bridgeEndValue${lectureNum}`).textContent = value;
    simulations[lectureNum].parameters.bridgeEnd = parseFloat(value);
}

function updateJumpRate(lectureNum) {
    const value = document.getElementById(`jumpRate${lectureNum}`).value;
    document.getElementById(`jumpRateValue${lectureNum}`).textContent = value;
    simulations[lectureNum].parameters.jumpRate = parseFloat(value);
}

function updateCorrelation(lectureNum) {
    const value = document.getElementById(`correlation${lectureNum}`).value;
    document.getElementById(`correlationValue${lectureNum}`).textContent = value;
    simulations[lectureNum].parameters.correlation = parseFloat(value);
}

function toggleBarriers(lectureNum) {
    const checked = document.getElementById(`barriers${lectureNum}`).checked;
    simulations[lectureNum].parameters.barriers = checked;
}

function updateStopLevel(lectureNum) {
    const value = document.getElementById(`stopLevel${lectureNum}`).value;
    document.getElementById(`stopLevelValue${lectureNum}`).textContent = value;
    simulations[lectureNum].parameters.stopLevel = parseFloat(value);
}

function updateBoundaryWidth(lectureNum) {
    const value = document.getElementById(`boundaryWidth${lectureNum}`).value;
    document.getElementById(`boundaryWidthValue${lectureNum}`).textContent = value;
    simulations[lectureNum].parameters.boundaryWidth = parseFloat(value);
}

function updateNoise(lectureNum) {
    const value = document.getElementById(`noise${lectureNum}`).value;
    document.getElementById(`noiseValue${lectureNum}`).textContent = value;
    simulations[lectureNum].parameters.noise = parseFloat(value);
}

function updateComplexity(lectureNum) {
    const value = document.getElementById(`complexity${lectureNum}`).value;
    document.getElementById(`complexityValue${lectureNum}`).textContent = value;
    simulations[lectureNum].parameters.complexity = parseFloat(value);
}