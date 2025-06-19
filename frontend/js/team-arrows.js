document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.carousel');
    const prevArrow = document.querySelector('.prev-arrow');
    const nextArrow = document.querySelector('.next-arrow');

    const slideWidth = 270; // 250px image width + 20px gap
    
    let isScrolling = false;
    
    // Function to scroll smoothly
    function smoothScroll(element, target) {
        if (isScrolling) return;
        
        isScrolling = true;
        
        // Calculate current position and target position
        const startPosition = element.scrollLeft;
        const distance = target - startPosition;
        const duration = 500; // ms
        let startTime = null;
        
        function animation(currentTime) {
            if (!startTime) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            const easeInOutQuad = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            
            element.scrollLeft = startPosition + distance * easeInOutQuad(progress);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            } else {
                isScrolling = false;
            }
        }
        
        requestAnimationFrame(animation);
    }

    prevArrow.addEventListener('click', () => {
        const targetPosition = carousel.scrollLeft - slideWidth;
        smoothScroll(carousel, targetPosition);
    });
    
    nextArrow.addEventListener('click', () => {
        const targetPosition = carousel.scrollLeft + slideWidth;
        smoothScroll(carousel, targetPosition);
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            const targetPosition = carousel.scrollLeft - slideWidth;
            smoothScroll(carousel, targetPosition);
        } else if (e.key === 'ArrowRight') {
            const targetPosition = carousel.scrollLeft + slideWidth;
            smoothScroll(carousel, targetPosition);
        }
    });
});