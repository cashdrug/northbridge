$(document).ready(function() {
    function animateLettersSequence() {
        const letters = document.querySelectorAll('.letter');
        letters.forEach(el => el.classList.remove('active', 'fade-out'));
        
        requestAnimationFrame(() => {
            setTimeout(() => document.querySelector('.letter-n').classList.add('active'), 300);
            setTimeout(() => document.querySelector('.letter-b').classList.add('active'), 800);
            setTimeout(() => document.querySelector('.letter-c').classList.add('active'), 1300);
            
            setTimeout(() => {
                const fadeOut = el => el.classList.add('fade-out');
                fadeOut(document.querySelector('.letter-n'));
                setTimeout(() => fadeOut(document.querySelector('.letter-b')), 100);
                setTimeout(() => fadeOut(document.querySelector('.letter-c')), 200);
            }, 4500);
        });
    }

    setTimeout(animateLettersSequence, 500);
    
    setInterval(animateLettersSequence, 7000);
});