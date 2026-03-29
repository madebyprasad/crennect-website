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



// video load as per device

document.addEventListener("DOMContentLoaded", function () {

    const heroVideo = document.getElementById("heroVideo");
    if (!heroVideo) return;
  
    const DESKTOP_VIDEO = "assets/video/hero-bg.webm";
    const MOBILE_VIDEO = "assets/video/hero-bg-mb.webm";
  
    function loadCorrectVideo() {
      const isMobile = window.matchMedia("(max-width: 560px)").matches;
      const selectedSource = isMobile ? MOBILE_VIDEO : DESKTOP_VIDEO;
  
      if (heroVideo.getAttribute("src") !== selectedSource) {
        heroVideo.src = selectedSource;
        heroVideo.load();
      }
    }
  
    loadCorrectVideo();
  
    // Fade in when ready
    heroVideo.addEventListener("canplay", function () {
      heroVideo.classList.add("loaded");
    });
  
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

// contact us page scripts here

/* ===========================
   CONTACT PAGE - SERVICE SELECT
=========================== */

document.addEventListener("DOMContentLoaded", function () {

    const serviceSelect = document.getElementById("serviceSelect");
    if (!serviceSelect) return;
  
    const display = serviceSelect.querySelector(".select-display");
    const options = serviceSelect.querySelectorAll(".select-options label");
    const optionsWrapper = serviceSelect.querySelector(".select-options");
    const textContainer = serviceSelect.querySelector(".select-text");
  
    let selectedValues = [];
  
    /* OPEN / CLOSE */
    display.addEventListener("click", function (e) {
      e.stopPropagation();
      serviceSelect.classList.toggle("active");
    });
  
    document.addEventListener("click", function (e) {
      if (!serviceSelect.contains(e.target)) {
        serviceSelect.classList.remove("active");
      }
    });
  
    /* SELECT OPTION */
    options.forEach(option => {
      option.addEventListener("click", function (e) {
        e.stopPropagation();
  
        const checkbox = option.querySelector("input");
        const value = checkbox.value;
  
        if (selectedValues.includes(value)) return;
  
        if (selectedValues.length >= 3) {
          showLimitMessage();
          return;
        }
  
        selectedValues.push(value);
        checkbox.checked = true;
  
        option.classList.add("disabled");
        option.style.pointerEvents = "none";
  
        renderSelected();
        removeLimitMessage();
      });
    });
  
    /* RENDER TAGS */
    function renderSelected() {
      textContainer.innerHTML = "";
  
      selectedValues.forEach(value => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.innerHTML = `
          ${value}
          <span class="tag-remove" data-value="${value}">&times;</span>
        `;
        textContainer.appendChild(tag);
      });
  
      attachRemoveHandlers();
    }
  
    /* REMOVE TAG */
    function attachRemoveHandlers() {
      const removeBtns = serviceSelect.querySelectorAll(".tag-remove");
  
      removeBtns.forEach(btn => {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
  
          const value = this.getAttribute("data-value");
  
          selectedValues = selectedValues.filter(v => v !== value);
  
          // Re-enable dropdown option
          options.forEach(option => {
            const checkbox = option.querySelector("input");
            if (checkbox.value === value) {
              checkbox.checked = false;
              option.classList.remove("disabled");
              option.style.pointerEvents = "auto";
            }
          });
  
          renderSelected();
          removeLimitMessage();
        });
      });
    }
  
    function showLimitMessage() {
      if (serviceSelect.querySelector(".select-limit")) return;
  
      const msg = document.createElement("div");
      msg.className = "select-limit";
      msg.textContent = "Select max 3 services";
      optionsWrapper.appendChild(msg);
    }
  
    function removeLimitMessage() {
      const msg = serviceSelect.querySelector(".select-limit");
      if (msg) msg.remove();
    }
  
  });
  
/* ===========================
   CONTACT FORM SUBMIT
=========================== */

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("contactForm");
    if (!form) return;
  
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
  

      const selectedTags = document.querySelectorAll(".tag");
      const services = Array.from(selectedTags).map(tag =>
        tag.textContent.replace("×", "").trim()
      );
  
      const newsletter = document.getElementById("newsletterCheck")?.checked || false;

      const formData = {
        name: form.name.value,
        company: form.company.value,
        email: form.email.value,
        phone: form.phone.value,
        services: services.join(", "),
        newsletter: newsletter
      };
  
      try {

        grecaptcha.ready(async function () {
      
          const token = await grecaptcha.execute('6Ld7_24sAAAAAOTpFeZ5FgQHlGM4LyCa5PBHWDgp', { action: 'submit' });
      
          formData.recaptchaToken = token;
      
          const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
      
          if (!response.ok) throw new Error();
      
          alert("Thank you. We'll connect shortly.");
          form.reset();
          document.querySelector(".select-text").textContent = "Select services";
      
        });
      
      } catch (error) {
        alert("Submission failed. Please try again.");
        console.error(error);
      }
      


  
    });
  
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



// ========================================
// ABOUT US SECTION JAVASCRIPT - NEW DESIGN
// Replace the old about-us JavaScript in script.js with this
// ======================================== */

// About Us Section - Content Data
const aboutUsContentData = {
    who: `<p>Crennect is an independent creative advertising agency built to help ambitious brands stay relevant, differentiated, and culturally aligned in a rapidly evolving market.</p>
<p>Founded with the belief that relevance decays faster than most businesses realise, Crennect exists to bridge the gap between brand ambition and market perception.</p>
<p>We work with New-age brands, startups, scaling businesses, and established enterprises that are ready to lead their category.</p>
<p>From brand positioning and identity to campaigns, digital experiences, and AI-powered creative systems, we build brands that don’t just get noticed but also get remembered.
</p>`,
   
    founders: `<p>Founded by Prasad Dani, a creative professional with over a decade of experience across design, UI/UX, digital platforms, and award-recognised advertising campaigns. This journey began in the design and gaming ecosystem, solving real product and user experience challenges for global teams. That early exposure to behaviour, interaction, and user psychology shaped a deeper understanding of how people engage with brands. </p>
<p>He later moved into leading creative agencies, working as a Art Director, contributing to campaigns that were recognised across industry platforms and award forums. Over the years, he worked across diverse sectors including telecom, finance, FMCG, lifestyle, Beauty and cosmetics, and enterprise brands. </p>
<p>But something became increasingly clear: Many brands were investing heavily in campaigns yet struggling with clarity. They were visible, but not differentiated. Present, but not positioned.
<p>Crennect was built to address that gap. </p>
<p>Not as a production house. Not as a freelance studio. But as a creative advertising Company focused on long-term brand equity and category leadership. </p>
<p>What started as a small, focused team with strong design sensibilities has grown into a strategic creative partner for brands seeking sharper positioning and meaningful growth.
</p>`,

    note: `<p>If you are building a company with long-term intent, whether you are scaling, repositioning, or preparing for your next phase of growth, the strength of your brand will determine the strength of your trajectory. </p>
<p>Crennect was built to support that journey. </p>
<p>Not with surface-level campaigns, but with thoughtful, structured, and future-ready creative leadership.
</p>`,
    
    core: `<p>We operate on a few core principles: </p>
<strong>1. Positioning precedes promotion. </strong>
Without clarity of identity and direction, marketing efforts dilute over time.</p>
<p>2. <strong>Creative work must move belief, not just metrics. </strong>
Attention is temporary. Brand perception is durable. </p>
<p>3. <strong>Taste is a strategic advantage. </strong>
In a world of automation and AI-generated sameness, refined judgement becomes critical. </p>
<p>4. <strong>Technology should amplify creativity, not replace it. </strong>
We integrate modern AI tools and systems to increase speed and precision while keeping human insight at the core. </p>
<p> 5. <strong>Brands grow when leadership aligns with narrative. </strong>
The most powerful brand shifts happen when strategic direction and creative expression are unified.
</p>`,
    
    approach: `<p>Crennect operates at the intersection of strategic clarity and creative excellence. </p>
<p>We work closely with marketing teams, founders, and leadership groups to understand: </p>
<p> <strong>Where the brand stands today</strong></p>
<p> <strong>Where the category is evolving</strong></p>
<p> <strong>Where opportunity gaps exist</strong></p>
<p><strong> What narrative can unlock growth</strong></p>
<p> Our role is not to add noise, but to create structured creative momentum, the kind that strengthens brand equity over time. </p>
<p>We combine design precision, behavioural insight, and commercial awareness to ensure that creative decisions serve long-term business objectives.
</p>`,

vision: `<p>We believe the next decade will redefine how brands compete. </p>
<p>Artificial intelligence is accelerating content creation. Digital ecosystems are multiplying touchpoints. Consumers are more informed, more selective, and less loyal than ever. </p>
<p>In this environment, visibility alone is no longer an advantage. Clarity is. </p>
<p>Our vision is to help brands build: </p>
<p> <strong>Strong positioning that withstands market shifts</strong></p>
<p> <strong>Creative systems that scale without losing identity</strong></p>
<p> <strong>Cultural relevance that compounds over time</strong></p>
<p>We believe that many legacy brands will struggle to reposition fast enough and that creates opportunity for new-age, high-aspiration brands to lead. </p>
<p>Crennect exists to help them do exactly that.
</p>`,
    
    future: `<p>The next five years will separate brands that adapt from those that fade. </p>
<p><strong>AI will increase content production exponentially. </strong> </p>
<p><strong>Competition will intensify across every category. </strong> </p>
<p><strong>Consumer attention will fragment even further. </strong></p>
<p>In that environment, the brands that win will not be the loudest, but the clearest. </p>
<p>Crennect is structured for that future. </p>
<p>We continuously evolve our creative processes, integrate intelligent systems, and refine strategic frameworks to help brands stay ahead of cultural and technological shifts.
</p>`
};

// Initialize About Us functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get About Us elements
    const aboutUsClickableItems = document.querySelectorAll('.about-us-clickable-item');
    const aboutUsModal = document.querySelector('.about-us-modal');
    const aboutUsModalText = document.querySelector('.about-us-modal-text');
    const aboutUsModalClose = document.querySelector('.about-us-modal-close');
    const aboutUsModalOverlay = document.querySelector('.about-us-modal-overlay');

    // Only run if about us elements exist on page
    if (!aboutUsClickableItems.length) return;

    // Position modal near clicked item or center on mobile
    function positionAboutUsModal(clickedElement) {
        const isMobileView = window.innerWidth <= 767;
        
        if (isMobileView) {
            aboutUsModal.style.top = '50%';
            aboutUsModal.style.left = '50%';
            aboutUsModal.style.transform = 'translate(-50%, -50%)';
        } else {
            const elementRect = clickedElement.getBoundingClientRect();
            const modalWidth = 520;
            const modalHeight = 400; // Approximate
            
            let topPosition = elementRect.bottom + 20;
            let leftPosition = elementRect.left;
            
            // Adjust if modal goes off screen
            if (leftPosition + modalWidth > window.innerWidth - 40) {
                leftPosition = window.innerWidth - modalWidth - 40;
            }
            if (leftPosition < 40) {
                leftPosition = 40;
            }
            if (topPosition + modalHeight > window.innerHeight - 40) {
                topPosition = elementRect.top - modalHeight - 20;
            }
            if (topPosition < 40) {
                topPosition = 40;
            }
            
            aboutUsModal.style.top = topPosition + 'px';
            aboutUsModal.style.left = leftPosition + 'px';
            aboutUsModal.style.transform = 'none';
        }
    }

    // Open modal
    aboutUsClickableItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const contentKey = item.getAttribute('data-about-content');
            aboutUsModalText.innerHTML = aboutUsContentData[contentKey];
            
            positionAboutUsModal(item);
            
            aboutUsModal.classList.add('about-us-modal-active');
            aboutUsModalOverlay.classList.add('about-us-modal-active');
        });
    });

    // Close modal
    function closeAboutUsModal() {
        aboutUsModal.classList.remove('about-us-modal-active');
        aboutUsModalOverlay.classList.remove('about-us-modal-active');
    }

    aboutUsModalClose.addEventListener('click', closeAboutUsModal);
    aboutUsModalOverlay.addEventListener('click', closeAboutUsModal);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && aboutUsModal.classList.contains('about-us-modal-active')) {
            closeAboutUsModal();
        }
    });
});

/* =========================================
   HERO GRID HOVER EFFECT
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const hero = document.querySelector(".hero");
    if (!hero) return;
  
    const gridSize = 90; // MUST match --grid-size in CSS
  
    hero.addEventListener("mousemove", function (e) {
  
      const rect = hero.getBoundingClientRect();
  
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
  
      const snappedX = Math.floor(x / gridSize) * gridSize;
      const snappedY = Math.floor(y / gridSize) * gridSize;
  
      hero.style.setProperty("--active-x", snappedX + "px");
      hero.style.setProperty("--active-y", snappedY + "px");
    });
  
    hero.addEventListener("mouseleave", function () {
      hero.style.setProperty("--active-x", "-9999px");
      hero.style.setProperty("--active-y", "-9999px");
    });
  
  });

  

/* =========================================
   SHOWREEL HOVER EFFECT
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const button = document.querySelector(".btn-hero-outline");
    const preview = document.querySelector(".showreel-preview");
  
    if (!button || !preview) return;
  
    button.addEventListener("mouseenter", () => {
      preview.classList.add("active");
    });
  
    button.addEventListener("mouseleave", () => {
      preview.classList.remove("active");
    });
  
    button.addEventListener("mousemove", (e) => {
        const previewWidth = preview.offsetWidth;
        const previewHeight = preview.offsetHeight;
      
        const offsetX = 100;  // slight right shift
        const offsetY = 40;  // distance above cursor
      
        preview.style.left = e.clientX - previewWidth / 2 + offsetX + "px";
        preview.style.top = e.clientY - previewHeight - offsetY + "px";
      });
  
  });

/* =========================================
   GENAI POPUP FORM SUBMIT
========================================= */
const submitEmailBtn = document.getElementById("submitEmail");
const emailInput = document.getElementById("emailInput");
const statusMsg = document.getElementById("statusMsg");

submitEmailBtn?.addEventListener("click", async function (e) {

  e.preventDefault();

  const email = emailInput.value.trim();

  if (!email) {
    statusMsg.textContent = "Please enter a valid email.";
    statusMsg.style.color = "red";
    return;
  }

  statusMsg.textContent = "Submitting...";
  statusMsg.style.color = "#888";

  try {

    const token = await grecaptcha.execute(
      '6Ld7_24sAAAAAOTpFeZ5FgQHlGM4LyCa5PBHWDgp',
      { action: 'waitlist' }
    );

    const response = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        recaptchaToken: token
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    statusMsg.textContent = "You're on the waitlist 🚀";
    statusMsg.style.color = "#000";
    emailInput.value = "";

  } catch (error) {

    console.error("Waitlist error:", error);
    statusMsg.textContent = "Something went wrong. Try again.";
    statusMsg.style.color = "red";

  }

});

console.log('Crennect website loaded successfully! 🚀');
