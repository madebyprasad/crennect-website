// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');

hamburger.addEventListener("click", () => {
    document.querySelector(".mobile-menu").classList.toggle("active");
  });
  


// Close mobile menu when clicking a link
document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
});

// Header scroll effect - hide on scroll down, show on scroll up or at top
let lastScroll = 0;
let ticking = false;
const header = document.querySelector('.header');

function updateHeader() {
    const currentScroll = window.pageYOffset;
    
    // Adjust padding based on scroll position
    if (currentScroll > 100) {
        header.style.padding = '10px 0';
    } else {
        header.style.padding = '15px 0';
    }
    
    // Show header at top of page or when scrolling up
    // Hide header when scrolling down (after threshold)
    if (currentScroll <= 0) {
        // Always show at top
        header.style.transform = 'translateY(0)';
    } else if (currentScroll > lastScroll && currentScroll > 150) {
        // Hide when scrolling down
        header.style.transform = 'translateY(-100%)';
    } else if (currentScroll < lastScroll) {
        // Show when scrolling up
        header.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
    }
});

// Portfolio items hover effect
const portfolioItems = document.querySelectorAll('.port-img');

portfolioItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        portfolioItems.forEach(other => {
            if (other !== this) {
                const thisRect = this.getBoundingClientRect();
                const otherRect = other.getBoundingClientRect();
                
                let moveX = 0;
                let moveY = 0;
                
                if (otherRect.left > thisRect.left) {
                    moveX = 12;
                } else if (otherRect.left < thisRect.left) {
                    moveX = -12;
                }
                
                if (otherRect.top > thisRect.top) {
                    moveY = 12;
                } else if (otherRect.top < thisRect.top) {
                    moveY = -12;
                }
                
                other.style.transform = `translate(${moveX}px, ${moveY}px)`;
            }
        });
    });
    
    item.addEventListener('mouseleave', function() {
        portfolioItems.forEach(other => {
            if (other !== this) {
                other.style.transform = '';
            }
        });
    });
});

// Quiz modal
const quizBtns = document.querySelectorAll('.quiz-btn');
const quizModal = document.getElementById('quizModal');

quizBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        quizModal.classList.add('active');
    });
});

quizModal?.addEventListener('click', () => {
    quizModal.classList.remove('active');
});

document.querySelector('.quiz-modal-content')?.addEventListener('click', (e) => {
    e.stopPropagation();
});

// Newsletter form
const newsletterForm = document.getElementById('newsletterForm');

newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input[type="email"]').value;
    const checkbox = newsletterForm.querySelector('input[type="checkbox"]').checked;
    
    if (email && checkbox) {
        alert('Thank you for subscribing! 🎉');
        newsletterForm.reset();
    }
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        if (href === '#' || href === '#home') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            return;
        }
        
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            const headerOffset = 70;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});


const logoTrack = document.querySelector('.logo-track');
if (logoTrack) {
    logoTrack.addEventListener('mouseenter', () => {
        logoTrack.style.animationPlayState = 'paused';
    });
    
    logoTrack.addEventListener('mouseleave', () => {
        logoTrack.style.animationPlayState = 'running';
    });
}

// Breaking brands scroll with wheel
//const bbScroll = document.querySelector('.bb-scroll');
//if (bbScroll) {
 //   bbScroll.addEventListener('wheel', (e) => {
  //      if (e.deltaY !== 0) {
 //           e.preventDefault();
  //          bbScroll.scrollLeft += e.deltaY;
  //      }
  //  });
//}

// Fade in sections on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach((section, index) => {
    if (index > 0) {
        section.style.opacity = '0';
        section.style.transform = 'translateY(40px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    }
});

// Parallax effect for hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    const heroShoe = document.querySelector('.hero-shoe');
    
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.4}px)`;
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
    }
    
    if (heroShoe && scrolled < window.innerHeight) {
        heroShoe.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
});

// Service card click handlers
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
        console.log('Service card clicked');
    });
});

// Lazy load images
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.addEventListener('load', () => {
                img.style.opacity = '1';
            });
        }
    });
});

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

console.log('Crennect website loaded successfully! 🚀');
