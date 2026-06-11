/* ============================================
   GEWA ANDOKO - PORTFOLIO
   JavaScript for Interactivity
   Tema: Aksara Indonesia & Batik
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ============================================
    // MOBILE HAMBURGER MENU TOGGLE
    // ============================================
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle hamburger menu on click
    if (hamburger) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close menu when a nav link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // ============================================
    // NAVBAR SCROLL EFFECT
    // ============================================
    const navbar = document.getElementById('navbar');

    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll();

    // ============================================
    // ACTIVE NAV LINK ON SCROLL
    // ============================================
    const sections = document.querySelectorAll('section[id]');

    function handleActiveNavLink() {
        let current = '';
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = sectionId;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', handleActiveNavLink);
    handleActiveNavLink();

    // ============================================
    // SKILL BARS ANIMATION ON SCROLL
    // ============================================
    const skillFillElements = document.querySelectorAll('.skill-progress-fill');

    function animateSkillBars() {
        skillFillElements.forEach(bar => {
            const barPosition = bar.getBoundingClientRect().top;
            const screenPosition = window.innerHeight - 100;

            if (barPosition < screenPosition) {
                const width = bar.getAttribute('data-width');
                if (width) {
                    bar.style.width = width;
                }
            }
        });
    }

    // Run on scroll
    window.addEventListener('scroll', animateSkillBars);
    // Run on load
    animateSkillBars();

    // ============================================
    // SCROLL REVEAL ANIMATION (Fade In)
    // ============================================
    const fadeElements = document.querySelectorAll('.fade-in');

    function handleFadeInOnScroll() {
        fadeElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight - 80;

            if (elementPosition < screenPosition) {
                element.classList.add('visible');
            }
        });
    }

    // Add fade-in class to sections and cards
    function initFadeInElements() {
        const elementsToAnimate = [
            '.about-content',
            '.timeline-item',
            '.skill-category',
            '.project-card',
            '.contact-content',
            '.contact-form',
            '.contact-info'
        ];

        elementsToAnimate.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.classList.add('fade-in');
            });
        });
    }

    initFadeInElements();
    window.addEventListener('scroll', handleFadeInOnScroll);
    handleFadeInOnScroll();

    // ============================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // CONTACT FORM HANDLING
    // ============================================
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            // Basic validation
            if (!name || !email || !subject || !message) {
                showFormNotification('Mohon isi semua bidang', 'error');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showFormNotification('Mohon masukkan email yang valid', 'error');
                return;
            }

            // Simulate sending
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
            submitBtn.disabled = true;

            setTimeout(() => {
                showFormNotification('Pesan berhasil dikirim! Terima kasih, ' + name + ' 🎉', 'success');
                contactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
    }

    // Form notification function
    function showFormNotification(message, type) {
        // Remove existing notification
        const existingNotif = document.querySelector('.form-notification');
        if (existingNotif) {
            existingNotif.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'form-notification';
        notification.textContent = message;

        // Style based on type
        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #2E7D32, #388E3C)';
        } else {
            notification.style.background = 'linear-gradient(135deg, #C62828, #D32F2F)';
        }

        // Common styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '90px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '15px 30px',
            color: 'white',
            borderRadius: '8px',
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.95rem',
            fontWeight: '500',
            zIndex: '9999',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            opacity: '0',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            transform: 'translateX(-50%) translateY(-20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)'
        });

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(-50%) translateY(0)';
        });

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }

    // ============================================
    // PARALLAX EFFECT ON BATIK BACKGROUND
    // ============================================
    const batikBg = document.getElementById('batikBg');

    function handleParallax() {
        if (batikBg) {
            const scrollY = window.scrollY;
            batikBg.style.transform = 'translateY(' + scrollY * 0.1 + 'px)';
        }
    }

    window.addEventListener('scroll', handleParallax);

    // ============================================
    // COUNTER ANIMATION FOR STATS
    // ============================================
    function animateCounter(element, target, suffix = '') {
        let current = 0;
        const increment = target / 60; // 60 steps for smooth animation
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + suffix;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + suffix;
            }
        }, 25);
    }

    // ============================================
    // TYPING EFFECT FOR HERO SUBTITLE
    // ============================================
    function initTypingEffect() {
        const subtitleElement = document.querySelector('.hero-subtitle');
        if (!subtitleElement) return;

        const text = subtitleElement.textContent.trim();
        subtitleElement.textContent = '';
        subtitleElement.style.display = 'inline-block';
        subtitleElement.style.borderRight = '2px solid var(--secondary)';
        subtitleElement.style.overflow = 'hidden';
        subtitleElement.style.whiteSpace = 'nowrap';

        let charIndex = 0;
        const typingSpeed = 80;

        function type() {
            if (charIndex < text.length) {
                subtitleElement.textContent += text.charAt(charIndex);
                charIndex++;
                setTimeout(type, typingSpeed);
            } else {
                // Blinking cursor effect
                setInterval(() => {
                    subtitleElement.style.borderColor = 
                        subtitleElement.style.borderColor === 'transparent' ? 
                        'var(--secondary)' : 'transparent';
                }, 500);
            }
        }

        // Start typing after a short delay
        setTimeout(type, 1000);
    }

    initTypingEffect();

    // ============================================
    // PREVENT DEFAULT FOR EMPTY LINKS
    // ============================================
    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
        });
    });

    // ============================================
    // LOGO AKSARA HOVER EFFECT
    // ============================================
    const logoAksaraElements = document.querySelectorAll('.logo-aksara');
    logoAksaraElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            this.style.textShadow = '0 0 20px rgba(212, 160, 23, 0.5)';
        });
        el.addEventListener('mouseleave', function() {
            this.style.textShadow = 'none';
        });
    });

    console.log('%c Gewa Andoko - Portfolio ', 'background: #8B0000; color: #FFD700; font-size: 1.2rem; padding: 10px; font-weight: bold;');
    console.log('%c Tema Aksara Indonesia & Batik ', 'background: #2F1B14; color: #FDF5E6; font-size: 0.9rem; padding: 8px;');
});