/* ============================================
   GEWA ANDOKO - PORTFOLIO
   JavaScript for Interactivity
   Tema: Aksara Indonesia & Batik
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ============================================
    // ANTI-DOWNLOAD PROTECTION
    // ============================================
    function initAntiDownloadProtection() {
        // 1. Cegah klik kanan pada gambar
        document.querySelectorAll('img').forEach(img => {
            img.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                showFormNotification('⚠️ Maaf, gambar tidak dapat diunduh', 'warning');
            });

            // 2. Cegah drag & drop
            img.addEventListener('dragstart', function(e) {
                e.preventDefault();
                showFormNotification('⚠️ Maaf, gambar tidak dapat diunduh', 'warning');
            });

            // 3. Cegah gesture touch (mobile) - long press save
            img.addEventListener('touchstart', function(e) {
                this.dataset.touchStart = Date.now();
            });
            img.addEventListener('touchend', function(e) {
                const touchDuration = Date.now() - parseInt(this.dataset.touchStart || 0);
                if (touchDuration > 500) {
                    e.preventDefault();
                    showFormNotification('⚠️ Maaf, gambar tidak dapat diunduh', 'warning');
                }
            });
        });

        // 4. Cegah keyboard shortcuts untuk save (Ctrl+S, Cmd+S)
        document.addEventListener('keydown', function(e) {
            // Ctrl+S atau Cmd+S
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                // Izinkan save halaman, tapi cegah save gambar
                // Tidak perlu di-block total
            }
            // Ctrl+Shift+I (DevTools) - tidak di-block karena untuk developer
        });

        // 5. Overlay transparan di atas gambar (mencegah save-as dari browser)
        document.querySelectorAll('.image-placeholder, .profile-photo').forEach(el => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2;
                cursor: default;
                pointer-events: none;
            `;
            if (el.classList.contains('image-placeholder')) {
                el.style.position = 'relative';
                el.appendChild(overlay);
            }
        });

        // 6. Cegah screenshot pada mobile (tidak 100% efektif tapi membantu)
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                // Halaman disembunyikan - tidak ada aksi khusus
            }
        });

        // 7. Nonaktifkan seleksi teks pada area gambar
        const imageAreas = document.querySelectorAll('.about-image, .hero-visual, .logo-g-style');
        imageAreas.forEach(area => {
            area.style.userSelect = 'none';
            area.style.webkitUserSelect = 'none';
            area.style.msUserSelect = 'none';
            area.style.MozUserSelect = 'none';
        });

        // 8. Proteksi logo SVG
        document.querySelectorAll('.logo-svg').forEach(svg => {
            svg.setAttribute('draggable', 'false');
            svg.style.pointerEvents = 'none';
        });

        console.log('🛡️ Anti-download protection aktif');
    }

    // ============================================
    // DARK MODE TOGGLE
    // ============================================
    const themeToggle = document.getElementById('themeToggle');

    // Default: light mode (putih). Dark mode hanya aktif saat tombol diklik.
    document.documentElement.removeAttribute('data-theme');

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
        });
    }

    // ============================================
    // MOBILE HAMBURGER MENU TOGGLE
    // ============================================
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hamburger) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

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
    // SCROLL REVEAL ANIMATION (Fade In)
    // ============================================
    const elementsToAnimate = [
        '.about-content',
        '.timeline-item',
        '.skill-category',
        '.project-card',
        '.contact-content',
        '.contact-form',
        '.contact-info'
    ];

    const fadeElements = [];

    function initFadeInElements() {
        elementsToAnimate.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                const rect = el.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight - 80;

                if (isVisible) {
                    el.classList.add('visible');
                } else {
                    el.classList.add('fade-in');
                    fadeElements.push(el);
                }
            });
        });
    }

    function handleFadeInOnScroll() {
        fadeElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight - 80;

            if (elementPosition < screenPosition) {
                element.classList.add('visible');
            }
        });
    }

    initFadeInElements();
    window.addEventListener('scroll', handleFadeInOnScroll);

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
    // GMAIL POPUP
    // ============================================
    window.showGmailPopup = function() {
        showFormNotification('Email Gmail masih dalam persiapan. Mohon maaf atas kendalanya 🙏', 'info');
    };

    window.showWhatsappPopup = function() {
        showFormNotification('Nomor WhatsApp masih dalam persiapan. Mohon maaf atas kendalanya 🙏', 'info');
    };

    // ============================================
    // API CONFIGURATION
    // ============================================
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : ''; // Jika di domain yang sama, pakai relative path

    // ============================================
    // OTP VERIFICATION MODAL
    // ============================================
    let currentFormData = {};

    function createOTPModal() {
        // Hapus modal lama jika ada
        const existingModal = document.querySelector('.otp-modal-overlay');
        if (existingModal) existingModal.remove();

        const overlay = document.createElement('div');
        overlay.className = 'otp-modal-overlay';
        overlay.innerHTML = `
            <div class="otp-modal">
                <button class="otp-modal-close" id="otpCloseBtn">&times;</button>
                <div class="otp-modal-header">
                    <div class="otp-modal-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3>🔐 Verifikasi Email</h3>
                    <p>Masukkan kode OTP yang telah dikirim ke email Anda</p>
                </div>
                <div class="otp-modal-body">
                    <div class="otp-email-display" id="otpEmailDisplay">
                        <i class="fas fa-envelope"></i>
                        <span id="otpEmailText"></span>
                    </div>
                    <div class="otp-input-group">
                        <input type="text" id="otpInput" class="otp-input" maxlength="6" 
                               placeholder="000000" inputmode="numeric" autocomplete="one-time-code">
                    </div>
                    <div class="otp-timer" id="otpTimer">
                        <i class="fas fa-clock"></i>
                        <span id="otpTimerText">05:00</span>
                    </div>
                    <div class="otp-actions">
                        <button class="btn btn-primary btn-full" id="otpVerifyBtn">
                            <i class="fas fa-check-circle"></i> Verifikasi
                        </button>
                    </div>
                    <div class="otp-resend">
                        <span>Belum menerima kode?</span>
                        <button id="otpResendBtn" class="otp-resend-btn">Kirim Ulang</button>
                    </div>
                </div>
                <div class="otp-modal-footer">
                    <p>Kode OTP berlaku selama 5 menit. Cek folder spam jika tidak ditemukan.</p>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Trigger animasi masuk
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });

        // Event listeners
        const closeBtn = overlay.querySelector('#otpCloseBtn');
        const verifyBtn = overlay.querySelector('#otpVerifyBtn');
        const resendBtn = overlay.querySelector('#otpResendBtn');
        const otpInput = overlay.querySelector('#otpInput');

        closeBtn.addEventListener('click', closeOTPModal);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeOTPModal();
        });

        // Auto-submit when 6 digits entered
        otpInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 6);
            if (this.value.length === 6) {
                verifyBtn.click();
            }
        });

        otpInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') verifyBtn.click();
        });

        verifyBtn.addEventListener('click', function() {
            const otp = otpInput.value.trim();
            if (otp.length !== 6) {
                showFormNotification('Masukkan 6 digit kode OTP', 'error');
                otpInput.classList.add('error');
                return;
            }
            otpInput.classList.remove('error');
            verifyOTP(otp);
        });

        resendBtn.addEventListener('click', function() {
            resendOTP();
        });

        // Focus input
        setTimeout(() => otpInput.focus(), 300);

        return overlay;
    }

    function closeOTPModal() {
        const overlay = document.querySelector('.otp-modal-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
        // Reset timer
        if (window.otpTimerInterval) {
            clearInterval(window.otpTimerInterval);
        }
    }

    function startOTPTimer(durationSeconds) {
        const timerText = document.getElementById('otpTimerText');
        if (!timerText) return;

        if (window.otpTimerInterval) {
            clearInterval(window.otpTimerInterval);
        }

        let remaining = durationSeconds;

        function updateTimer() {
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            timerText.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            if (remaining <= 0) {
                clearInterval(window.otpTimerInterval);
                timerText.textContent = '00:00';
                timerText.style.color = '#C62828';
                document.getElementById('otpResendBtn').disabled = false;
                document.getElementById('otpResendBtn').style.opacity = '1';
            } else {
                timerText.style.color = '';
                document.getElementById('otpResendBtn').disabled = true;
                document.getElementById('otpResendBtn').style.opacity = '0.5';
            }

            remaining--;
        }

        updateTimer();
        window.otpTimerInterval = setInterval(updateTimer, 1000);
    }

    // ============================================
    // API CALLS
    // ============================================
    async function sendOTP(email) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal mengirim OTP');
            }

            if (data.autoVerified) {
                // Auto-verified mode (email server tidak aktif)
                return { autoVerified: true, message: data.message };
            }

            return { success: true, message: data.message, expiresIn: data.expiresIn || 300 };
        } catch (error) {
            console.error('Error sendOTP:', error);
            throw error;
        }
    }

    async function verifyOTP(otp) {
        const verifyBtn = document.getElementById('otpVerifyBtn');
        const originalText = verifyBtn.innerHTML;
        verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memverifikasi...';
        verifyBtn.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: currentFormData.email,
                    otp: otp,
                    name: currentFormData.name,
                    subject: currentFormData.subject,
                    message: currentFormData.message
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Kode OTP salah');
            }

            // Sukses verifikasi
            closeOTPModal();
            showFormNotification(data.message || '✅ Email berhasil diverifikasi!', 'success');
            
            // Reset form
            document.getElementById('contactForm').reset();
            document.querySelectorAll('.form-group input, .form-group textarea').forEach(f => {
                f.classList.remove('valid');
            });

        } catch (error) {
            showFormNotification(error.message || 'Gagal memverifikasi OTP', 'error');
            document.getElementById('otpInput').classList.add('error');
            document.getElementById('otpInput').value = '';
            document.getElementById('otpInput').focus();
        } finally {
            verifyBtn.innerHTML = originalText;
            verifyBtn.disabled = false;
        }
    }

    async function resendOTP() {
        const resendBtn = document.getElementById('otpResendBtn');
        resendBtn.disabled = true;
        resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentFormData.email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal mengirim ulang');
            }

            if (data.autoVerified) {
                closeOTPModal();
                showFormNotification(data.message, 'success');
                document.getElementById('contactForm').reset();
                return;
            }

            showFormNotification('Kode OTP baru telah dikirim!', 'success');
            document.getElementById('otpInput').value = '';
            document.getElementById('otpInput').focus();
            document.getElementById('otpInput').classList.remove('error');
            startOTPTimer(300); // Reset timer 5 menit

        } catch (error) {
            showFormNotification(error.message || 'Gagal mengirim ulang OTP', 'error');
        } finally {
            resendBtn.innerHTML = 'Kirim Ulang';
            resendBtn.disabled = false;
        }
    }

    // ============================================
    // CONTACT FORM HANDLING
    // ============================================
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            // Clear previous validation errors
            document.querySelectorAll('.form-group input, .form-group textarea').forEach(f => {
                f.classList.remove('error', 'valid');
            });

            let hasError = false;

            if (!name) {
                document.getElementById('name').classList.add('error');
                hasError = true;
            } else {
                document.getElementById('name').classList.add('valid');
            }
            if (!email) {
                document.getElementById('email').classList.add('error');
                hasError = true;
            } else {
                document.getElementById('email').classList.add('valid');
            }
            if (!subject) {
                document.getElementById('subject').classList.add('error');
                hasError = true;
            } else {
                document.getElementById('subject').classList.add('valid');
            }
            if (!message) {
                document.getElementById('message').classList.add('error');
                hasError = true;
            } else {
                document.getElementById('message').classList.add('valid');
            }

            if (hasError) {
                showFormNotification('Mohon isi semua bidang dengan benar', 'error');
                return;
            }

            // Validasi format email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                document.getElementById('email').classList.add('error');
                showFormNotification('Mohon masukkan email yang valid', 'error');
                return;
            }

            // Simpan data form
            currentFormData = { name, email, subject, message };

            // Tampilkan loading pada tombol
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim OTP...';
            submitBtn.disabled = true;

            try {
                // Kirim OTP ke email
                const result = await sendOTP(email);

                if (result.autoVerified) {
                    // Mode auto-verified (email server tidak aktif)
                    showFormNotification(result.message, 'success');
                    contactForm.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    document.querySelectorAll('.form-group input, .form-group textarea').forEach(f => {
                        f.classList.remove('valid');
                    });
                    return;
                }

                // Tampilkan modal OTP
                const modal = createOTPModal();
                document.getElementById('otpEmailText').textContent = email;
                startOTPTimer(result.expiresIn || 300);

                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

            } catch (error) {
                showFormNotification(error.message || 'Gagal mengirim OTP. Coba lagi nanti.', 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // ============================================
    // FORM NOTIFICATION - CSS based
    // ============================================
    function showFormNotification(message, type) {
        const existingNotif = document.querySelector('.form-notification');
        if (existingNotif) {
            existingNotif.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'form-notification ' + type;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Remove after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            notification.classList.add('hide');
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
    // TYPING CURSOR FOR HERO SUBTITLE
    // ============================================
    function initTypingEffect() {
        const subtitleElement = document.querySelector('.hero-subtitle');
        if (!subtitleElement) return;

        const text = subtitleElement.textContent.trim();
        
        subtitleElement.textContent = text;
        subtitleElement.style.display = 'inline-block';
        subtitleElement.style.borderRight = '2px solid var(--secondary)';
        subtitleElement.style.overflow = 'hidden';
        subtitleElement.style.whiteSpace = 'nowrap';

        setInterval(() => {
            subtitleElement.style.borderColor = 
                subtitleElement.style.borderColor === 'transparent' ? 
                'var(--secondary)' : 'transparent';
        }, 500);
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

    // ============================================
    // INIT ANTI-DOWNLOAD PROTECTION
    // ============================================
    initAntiDownloadProtection();

    console.log('%c Gewa Andoko - Portfolio ', 'background: #8B0000; color: #FFD700; font-size: 1.2rem; padding: 10px; font-weight: bold;');
    console.log('%c Tema Aksara Indonesia & Batik ', 'background: #2F1B14; color: #FDF5E6; font-size: 0.9rem; padding: 8px;');
    console.log('%c 🛡️ Anti-download & Email Verification Active ', 'background: #1B5E20; color: #fff; font-size: 0.9rem; padding: 8px;');
});