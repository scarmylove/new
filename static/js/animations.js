// Global animation utilities

const Animations = {
    animateCounter: function(element, targetValue, duration = 2000) {
        const start = 0;
        const increment = targetValue / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= targetValue) {
                element.textContent = targetValue;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    },
    
    animateElements: function(selector, delay = 0.1) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
            el.style.animation = `slideUp 0.5s ease ${delay * index}s forwards`;
            el.style.opacity = '0';
        });
    },
    
    addPageTransition: function() {
        const page = document.querySelector('.page-container');
        if (page) {
            page.style.animation = 'fadeIn 0.4s ease';
        }
    }
};

// Initialize animations on page load
document.addEventListener('DOMContentLoaded', () => {
    // Animate all cards on dashboard
    const cards = document.querySelectorAll('.card-item, .chart-container, .table-container');
    cards.forEach((card, index) => {
        card.style.animation = `slideUp 0.5s ease ${0.1 * index}s forwards`;
        card.style.opacity = '0';
    });
    
    // Animate counters
    const counters = document.querySelectorAll('.card-value');
    counters.forEach(counter => {
        const value = parseInt(counter.dataset.value) || 0;
        if (value > 0) {
            Animations.animateCounter(counter, value);
        }
    });
    
    Animations.addPageTransition();
});