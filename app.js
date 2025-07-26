// Skills carousel functionality
class SkillsCarousel {
    constructor() {
        this.carousel = document.getElementById('skillsCarousel');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentIndex = 0;
        this.skills = [
            { name: 'HTML5', image: 'images/html.png' },
            { name: 'CSS3', image: 'images/Official_CSS_Logo.svg.png' },
            { name: 'JavaScript', image: 'images/javascript.png' },
            { name: 'C#', image: 'images/c-sharp.png' },
            { name: 'Sql Server', image: 'images/icons8-servidor-microsoft-sql-100.png' },
            { name: '.NET', image: 'images/Microsoft_.NET_logo.png' },
            { name: 'Git', image: 'images/git.png' },
            { name: 'Github', image: 'images/github.png' }
        ];
        
        this.init();
    }
    
    init() {
        this.renderSkills();
        this.setupEventListeners();
        this.updateCarousel();
    }
    
    renderSkills() {
        this.carousel.innerHTML = '';
        
        // Create duplicate items for infinite scroll effect
        const allSkills = [...this.skills, ...this.skills, ...this.skills];
        
        allSkills.forEach((skill, index) => {
            const skillItem = document.createElement('div');
            skillItem.className = 'carousel-item bg-white rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:transform hover:-translate-y-2 hover:rotate-y-12 hover:shadow-2xl';
            skillItem.innerHTML = `
                <img src="${skill.image}" alt="${skill.name}" 
                     onerror="this.src='images/placeholder.png'">
                <div class="text-center mt-2">
                    <p class="text-sm font-medium text-gray-700">${skill.name}</p>
                </div>
            `;
            this.carousel.appendChild(skillItem);
        });
    }
    
    setupEventListeners() {
        this.prevBtn.addEventListener('click', () => {
            this.currentIndex--;
            this.updateCarousel();
        });
        
        this.nextBtn.addEventListener('click', () => {
            this.currentIndex++;
            this.updateCarousel();
        });
        
        // Auto-scroll functionality
        setInterval(() => {
            this.currentIndex++;
            this.updateCarousel();
        }, 3000);
    }
    
    updateCarousel() {
        const itemWidth = 140; // 120px width + 20px margin
        const translateX = -this.currentIndex * itemWidth;
        this.carousel.style.transform = `translateX(${translateX}px)`;
        
        // Reset to beginning for infinite scroll effect
        if (this.currentIndex >= this.skills.length) {
            setTimeout(() => {
                this.currentIndex = 0;
                this.carousel.style.transition = 'none';
                this.carousel.style.transform = `translateX(0px)`;
                setTimeout(() => {
                    this.carousel.style.transition = 'transform 0.5s ease';
                }, 10);
            }, 500);
        }
        
        // Reset to end for infinite scroll effect
        if (this.currentIndex < 0) {
            setTimeout(() => {
                this.currentIndex = this.skills.length - 1;
                this.carousel.style.transition = 'none';
                this.carousel.style.transform = `translateX(${-this.currentIndex * itemWidth}px)`;
                setTimeout(() => {
                    this.carousel.style.transition = 'transform 0.5s ease';
                }, 10);
            }, 500);
        }
    }
}

// Smooth scrolling for navigation links
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Contact links functionality
function setupContactLinks() {
    const contactLinks = document.querySelectorAll('#contacto a');
    
    contactLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Add a small delay for visual feedback
            setTimeout(() => {
                // The link will open naturally
            }, 150);
        });
    });
}

// Intersection Observer for animations
function setupAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    }, observerOptions);
    
    // Observe all sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Add CSS for animations
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .animate-fade-in {
            animation: fadeIn 0.6s ease-out forwards;
        }
        
        section {
            opacity: 0;
        }
        
        section.animate-fade-in {
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    addAnimationStyles();
    setupSmoothScrolling();
    setupContactLinks();
    setupAnimations();
    
    // Initialize skills carousel
    new SkillsCarousel();
    
    // Add active state to navigation
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('text-blue-600');
            link.classList.add('text-gray-700');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.remove('text-gray-700');
                link.classList.add('text-blue-600');
            }
        });
    });
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to project cards
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add typing effect to hero title
    const heroTitle = document.querySelector('#inicio h1');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        // Start typing effect after a short delay
        setTimeout(typeWriter, 500);
    }
}); 