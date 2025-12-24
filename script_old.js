// Random Walk Simulation Variables
let randomWalkAnimation = null;
let walkData = [];
let currentTime = 0;
let currentPosition = 0;
let isRunning = false;
let stepCount = 0;
let currentStepSize = 1;
let currentTimeDelta = 1;

// Second simulation variables (slide 2)
let randomWalkAnimation2 = null;
let walkData2 = [];
let walkData2Normal = [];
let currentTime2 = 0;
let currentPosition2 = 0;
let currentPosition2Normal = 0;
let isRunning2 = false;
let stepCount2 = 0;
let currentStepSize2 = 1;
let currentTimeDelta2 = 1;

// Global variables to track current slides for each lecture
let currentSlides = {
    1: 1,
    2: 1,
    3: 1
};

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeSlideshow();
    initializeRandomWalk();
    initializeRandomWalk2();
});

// Initialize random walk simulation
function initializeRandomWalk() {
    const canvas = document.getElementById('randomWalkCanvas');
    if (!canvas) return;
    
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    if (startBtn) startBtn.addEventListener('click', startRandomWalk);
    if (stopBtn) stopBtn.addEventListener('click', stopRandomWalk);
    if (resetBtn) resetBtn.addEventListener('click', resetRandomWalk);
    
    // Draw initial state
    drawRandomWalk();
}

// Start the random walk simulation
function startRandomWalk() {
    if (isRunning) return;
    
    isRunning = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    
    randomWalkAnimation = setInterval(() => {
        // Check if we've hit a multiple of 100 steps for acceleration
        stepCount++;
        if (stepCount % 100 === 0) {
            currentTimeDelta *= 1.2;
            currentStepSize *= Math.sqrt(1.2);
        }
        
        // Take a random step: +stepSize or -stepSize
        const step = (Math.random() < 0.5 ? -1 : 1) * currentStepSize;
        currentPosition += step;
        currentTime += currentTimeDelta;
        
        // Store the data point
        walkData.push({time: currentTime, position: currentPosition});
        
        // Update display
        updateDisplays();
        
        // Redraw the walk
        drawRandomWalk();
    }, 50); // Update every 50ms
}

// Stop the random walk simulation
function stopRandomWalk() {
    if (!isRunning) return;
    
    isRunning = false;
    clearInterval(randomWalkAnimation);
    
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
}

// Reset the random walk simulation
function resetRandomWalk() {
    stopRandomWalk();
    
    walkData = [];
    currentTime = 0;
    currentPosition = 0;
    stepCount = 0;
    currentStepSize = 1;
    currentTimeDelta = 1;
    
    updateDisplays();
    drawRandomWalk();
}

// Update the information displays
function updateDisplays() {
    const timeDisplay = document.getElementById('timeDisplay');
    const stepSizeDisplay = document.getElementById('stepSizeDisplay');
    
    if (timeDisplay) timeDisplay.textContent = Math.round(currentTime * 10) / 10;
    if (stepSizeDisplay) stepSizeDisplay.textContent = Math.round(currentStepSize * 100) / 100;
}

// Draw the random walk on canvas
function drawRandomWalk() {
    const canvas = document.getElementById('randomWalkCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    if (walkData.length === 0) {
        // Draw initial point
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw axes
        drawAxes(ctx, width, height, 20, 0, currentTime);
        return;
    }
    
    // Calculate view bounds
    const viewHeight = Math.max(20, Math.sqrt(Math.max(1, currentTime)) * 2);
    const timeRange = Math.max(100, currentTime + 20);
    
    // Draw grid and axes
    drawAxes(ctx, width, height, viewHeight, 0, timeRange);
    
    // Draw the walk path
    if (walkData.length > 1) {
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < walkData.length; i++) {
            const point = walkData[i];
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
    
    // Draw current position as a red dot
    if (walkData.length > 0) {
        const lastPoint = walkData[walkData.length - 1];
        const x = (lastPoint.time / timeRange) * width;
        const y = height / 2 - (lastPoint.position / viewHeight) * (height / 2);
        
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Draw theoretical bounds (±sqrt(t))
    if (currentTime > 0) {
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        // Upper bound
        ctx.beginPath();
        for (let t = 1; t <= currentTime; t += Math.max(1, currentTime / 100)) {
            const x = (t / timeRange) * width;
            const y = height / 2 - (Math.sqrt(t) / viewHeight) * (height / 2);
            if (t === 1) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Lower bound
        ctx.beginPath();
        for (let t = 1; t <= currentTime; t += Math.max(1, currentTime / 100)) {
            const x = (t / timeRange) * width;
            const y = height / 2 - (-Math.sqrt(t) / viewHeight) * (height / 2);
            if (t === 1) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        ctx.setLineDash([]);
    }
}

// Draw coordinate axes and grid
function drawAxes(ctx, width, height, viewHeight, minTime, maxTime) {
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 1;
    
    // Draw horizontal center line (y=0)
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Draw vertical grid lines (time)
    const timeSteps = 5;
    for (let i = 0; i <= timeSteps; i++) {
        const x = (i / timeSteps) * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Draw horizontal grid lines (position)
    const positionSteps = 6;
    for (let i = 0; i <= positionSteps; i++) {
        const y = (i / positionSteps) * height;
        ctx.strokeStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Add axis labels
    ctx.fillStyle = '#2c3e50';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // Time axis labels
    for (let i = 0; i <= timeSteps; i++) {
        const x = (i / timeSteps) * width;
        const time = Math.round((i / timeSteps) * maxTime);
        ctx.fillText(time.toString(), x, height - 5);
    }
    
    // Position axis labels
    ctx.textAlign = 'right';
    const maxPos = viewHeight / 2;
    ctx.fillText(Math.round(maxPos).toString(), width - 5, 15);
    ctx.fillText('0', width - 5, height / 2 + 5);
    ctx.fillText((-Math.round(maxPos)).toString(), width - 5, height - 5);
}

// Generate random normal (Gaussian) number using Box-Muller transform
function randomNormal() {
    let u1 = Math.random();
    let u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Initialize second random walk simulation (slide 2)
function initializeRandomWalk2() {
    const canvas = document.getElementById('randomWalkCanvas2');
    if (!canvas) return;
    
    const startBtn = document.getElementById('startBtn2');
    const stopBtn = document.getElementById('stopBtn2');
    const resetBtn = document.getElementById('resetBtn2');
    
    if (startBtn) startBtn.addEventListener('click', startRandomWalk2);
    if (stopBtn) stopBtn.addEventListener('click', stopRandomWalk2);
    if (resetBtn) resetBtn.addEventListener('click', resetRandomWalk2);
    
    // Draw initial state
    drawRandomWalk2();
}

// Start the second random walk simulation
function startRandomWalk2() {
    if (isRunning2) return;
    
    isRunning2 = true;
    document.getElementById('startBtn2').disabled = true;
    document.getElementById('stopBtn2').disabled = false;
    
    randomWalkAnimation2 = setInterval(() => {
        // Check if we've hit a multiple of 100 steps for acceleration
        stepCount2++;
        if (stepCount2 % 100 === 0) {
            currentTimeDelta2 *= 1.2;
            currentStepSize2 *= Math.sqrt(1.2);
        }
        
        // Discrete step: +stepSize or -stepSize
        const stepDiscrete = (Math.random() < 0.5 ? -1 : 1) * currentStepSize2;
        currentPosition2 += stepDiscrete;
        
        // Normal step: Gaussian distributed
        const stepNormal = randomNormal() * currentStepSize2;
        currentPosition2Normal += stepNormal;
        
        currentTime2 += currentTimeDelta2;
        
        // Store the data points
        walkData2.push({time: currentTime2, position: currentPosition2});
        walkData2Normal.push({time: currentTime2, position: currentPosition2Normal});
        
        // Update display
        updateDisplays2();
        
        // Redraw the walk
        drawRandomWalk2();
    }, 50); // Update every 50ms
}

// Stop the second random walk simulation
function stopRandomWalk2() {
    if (!isRunning2) return;
    
    isRunning2 = false;
    clearInterval(randomWalkAnimation2);
    
    document.getElementById('startBtn2').disabled = false;
    document.getElementById('stopBtn2').disabled = true;
}

// Reset the second random walk simulation
function resetRandomWalk2() {
    stopRandomWalk2();
    
    walkData2 = [];
    walkData2Normal = [];
    currentTime2 = 0;
    currentPosition2 = 0;
    currentPosition2Normal = 0;
    stepCount2 = 0;
    currentStepSize2 = 1;
    currentTimeDelta2 = 1;
    
    updateDisplays2();
    drawRandomWalk2();
}

// Update the second simulation displays
function updateDisplays2() {
    const timeDisplay = document.getElementById('timeDisplay2');
    const stepSizeDisplay = document.getElementById('stepSizeDisplay2');
    
    if (timeDisplay) timeDisplay.textContent = Math.round(currentTime2 * 10) / 10;
    if (stepSizeDisplay) stepSizeDisplay.textContent = Math.round(currentStepSize2 * 100) / 100;
}

// Draw the second random walk on canvas
function drawRandomWalk2() {
    const canvas = document.getElementById('randomWalkCanvas2');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);
    
    if (walkData2.length === 0) {
        // Draw initial points
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(width / 2 - 10, height / 2, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.arc(width / 2 + 10, height / 2, 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw axes
        drawAxes2(ctx, width, height, 20, 0, currentTime2);
        return;
    }
    
    // Calculate view bounds
    const viewHeight = Math.max(20, Math.sqrt(Math.max(1, currentTime2)) * 2);
    const timeRange = Math.max(100, currentTime2 + 20);
    
    // Draw grid and axes
    drawAxes2(ctx, width, height, viewHeight, 0, timeRange);
    
    // Draw the discrete walk path (blue)
    if (walkData2.length > 1) {
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < walkData2.length; i++) {
            const point = walkData2[i];
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
    
    // Draw the normal walk path (green)
    if (walkData2Normal.length > 1) {
        ctx.strokeStyle = '#27ae60';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < walkData2Normal.length; i++) {
            const point = walkData2Normal[i];
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
    
    // Draw current positions
    if (walkData2.length > 0) {
        const lastPoint = walkData2[walkData2.length - 1];
        const x = (lastPoint.time / timeRange) * width;
        const y = height / 2 - (lastPoint.position / viewHeight) * (height / 2);
        
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    if (walkData2Normal.length > 0) {
        const lastPoint = walkData2Normal[walkData2Normal.length - 1];
        const x = (lastPoint.time / timeRange) * width;
        const y = height / 2 - (lastPoint.position / viewHeight) * (height / 2);
        
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    }
    
    // Draw theoretical bounds (±sqrt(t))
    if (currentTime2 > 0) {
        ctx.strokeStyle = '#95a5a6';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        // Upper bound
        ctx.beginPath();
        for (let t = 1; t <= currentTime2; t += Math.max(1, currentTime2 / 100)) {
            const x = (t / timeRange) * width;
            const y = height / 2 - (Math.sqrt(t) / viewHeight) * (height / 2);
            if (t === 1) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Lower bound
        ctx.beginPath();
        for (let t = 1; t <= currentTime2; t += Math.max(1, currentTime2 / 100)) {
            const x = (t / timeRange) * width;
            const y = height / 2 - (-Math.sqrt(t) / viewHeight) * (height / 2);
            if (t === 1) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        ctx.setLineDash([]);
    }
}

// Draw coordinate axes and grid for second simulation
function drawAxes2(ctx, width, height, viewHeight, minTime, maxTime) {
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 1;
    
    // Draw horizontal center line (y=0)
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Draw vertical grid lines (time)
    const timeSteps = 5;
    for (let i = 0; i <= timeSteps; i++) {
        const x = (i / timeSteps) * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Draw horizontal grid lines (position)
    const positionSteps = 6;
    for (let i = 0; i <= positionSteps; i++) {
        const y = (i / positionSteps) * height;
        ctx.strokeStyle = '#ecf0f1';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Add axis labels
    ctx.fillStyle = '#2c3e50';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // Time axis labels
    for (let i = 0; i <= timeSteps; i++) {
        const x = (i / timeSteps) * width;
        const time = Math.round((i / timeSteps) * maxTime);
        ctx.fillText(time.toString(), x, height - 5);
    }
    
    // Position axis labels
    ctx.textAlign = 'right';
    const maxPos = viewHeight / 2;
    ctx.fillText(Math.round(maxPos).toString(), width - 5, 15);
    ctx.fillText('0', width - 5, height / 2 + 5);
    ctx.fillText((-Math.round(maxPos)).toString(), width - 5, height - 5);
}

// Initialize tab functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const lectureNumber = this.getAttribute('data-lecture');
            switchTab(lectureNumber);
        });
    });
}

// Switch between lecture tabs
function switchTab(lectureNumber) {
    // Remove active class from all tabs and lectures
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.lecture').forEach(lecture => lecture.classList.remove('active'));
    
    // Add active class to selected tab and lecture
    document.querySelector(`[data-lecture="${lectureNumber}"]`).classList.add('active');
    document.querySelector(`#lecture-${lectureNumber}`).classList.add('active');
    
    // Update slide counter for the current lecture
    updateSlideCounter(lectureNumber);
}

// Initialize slideshow functionality
function initializeSlideshow() {
    // Update slide counters for all lectures
    for (let i = 1; i <= 3; i++) {
        updateSlideCounter(i);
        updateNavigationButtons(i);
    }
}

// Change slide within a lecture
function changeSlide(direction, lectureNumber) {
    const lecture = document.querySelector(`#lecture-${lectureNumber}`);
    const slides = lecture.querySelectorAll('.slide');
    const totalSlides = slides.length;
    
    // Calculate new slide number
    let newSlideNumber = currentSlides[lectureNumber] + direction;
    
    // Boundary checks
    if (newSlideNumber < 1) {
        newSlideNumber = 1;
    } else if (newSlideNumber > totalSlides) {
        newSlideNumber = totalSlides;
    }
    
    // Only proceed if slide number changed
    if (newSlideNumber !== currentSlides[lectureNumber]) {
        // Hide current slide
        slides[currentSlides[lectureNumber] - 1].classList.remove('active');
        
        // Show new slide
        slides[newSlideNumber - 1].classList.add('active');
        
        // Update current slide number
        currentSlides[lectureNumber] = newSlideNumber;
        
        // Update UI
        updateSlideCounter(lectureNumber);
        updateNavigationButtons(lectureNumber);
    }
}

// Update slide counter display
function updateSlideCounter(lectureNumber) {
    const lecture = document.querySelector(`#lecture-${lectureNumber}`);
    const slides = lecture.querySelectorAll('.slide');
    const currentSlideSpan = lecture.querySelector('.current-slide');
    const totalSlidesSpan = lecture.querySelector('.total-slides');
    
    if (currentSlideSpan && totalSlidesSpan) {
        currentSlideSpan.textContent = currentSlides[lectureNumber];
        totalSlidesSpan.textContent = slides.length;
    }
}

// Update navigation button states
function updateNavigationButtons(lectureNumber) {
    const lecture = document.querySelector(`#lecture-${lectureNumber}`);
    const slides = lecture.querySelectorAll('.slide');
    const prevBtn = lecture.querySelector('.prev-btn');
    const nextBtn = lecture.querySelector('.next-btn');
    
    if (prevBtn && nextBtn) {
        // Disable/enable previous button
        prevBtn.disabled = currentSlides[lectureNumber] === 1;
        
        // Disable/enable next button
        nextBtn.disabled = currentSlides[lectureNumber] === slides.length;
    }
}

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    const activeLecture = document.querySelector('.lecture.active');
    if (activeLecture) {
        const lectureNumber = parseInt(activeLecture.id.split('-')[1]);
        
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                changeSlide(-1, lectureNumber);
                break;
            case 'ArrowRight':
                event.preventDefault();
                changeSlide(1, lectureNumber);
                break;
            case '1':
                event.preventDefault();
                switchTab(1);
                break;
            case '2':
                event.preventDefault();
                switchTab(2);
                break;
            case '3':
                event.preventDefault();
                switchTab(3);
                break;
        }
    }
});

// Touch/swipe support for mobile devices
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const activeLecture = document.querySelector('.lecture.active');
    if (activeLecture) {
        const lectureNumber = parseInt(activeLecture.id.split('-')[1]);
        const swipeThreshold = 100;
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left - next slide
            changeSlide(1, lectureNumber);
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right - previous slide
            changeSlide(-1, lectureNumber);
        }
    }
}