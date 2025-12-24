// Main Script - Slideshow functionality only
// Simulation logic is handled in simulations.js

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
    initializeSimulations(); // From simulations.js
});

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
    const currentSlideSpans = lecture.querySelectorAll('.current-slide');
    const totalSlidesSpans = lecture.querySelectorAll('.total-slides');
    
    // Update all current slide displays in this lecture
    currentSlideSpans.forEach(span => {
        span.textContent = currentSlides[lectureNumber];
    });
    
    // Update all total slides displays in this lecture
    totalSlidesSpans.forEach(span => {
        span.textContent = slides.length;
    });
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