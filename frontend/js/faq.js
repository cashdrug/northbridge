document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.topic-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const arrow = header.querySelector('.arrow');
            content.classList.toggle('active');
            arrow.classList.toggle('up');
        });
    });

    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const answer = question.nextElementSibling;
            const arrow = question.querySelector('.arrow');
            
            document.querySelectorAll('.faq-answer').forEach(otherAnswer => {
                if (otherAnswer !== answer) {
                    otherAnswer.classList.remove('active');
                    const otherArrow = otherAnswer.previousElementSibling.querySelector('.arrow');
                    if (otherArrow) {
                        otherArrow.classList.remove('up');
                    }
                }
            });
            
            answer.classList.toggle('active');
            if (arrow) {
                arrow.classList.toggle('up');
            }
        });
    });
});