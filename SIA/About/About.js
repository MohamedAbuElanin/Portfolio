/* ============================================================
   SIA About Page Interactions
   - Background particles + Eye of Ra parallax
   - Smooth scroll + reveal animations
   - Mosaic layout toggle and team image fallback
============================================================ */

(() => {
    const state = {
        particles: [],
        particleCount: window.innerWidth < 768 ? 35 : 70,
        canvas: null,
        ctx: null,
        animationFrame: null,
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };

    document.addEventListener('DOMContentLoaded', () => {
        initSmoothScroll();
        initImageFallback();
        initRevealOnScroll();
        initMosaicToggle();
        initHamburgerMenu();
        if (!state.prefersReducedMotion) {
            initParticles();
            initParallax();
        }
    });

    function initSmoothScroll() {
        const links = document.querySelectorAll('[data-scroll]');
        links.forEach(link => {
            link.addEventListener('click', event => {
                event.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    function initImageFallback() {
        const images = document.querySelectorAll('.team-photo img');
        images.forEach(img => {
            if (img.complete && img.naturalWidth === 0) {
                swapForFallback(img);
            }
            img.addEventListener('error', () => swapForFallback(img));
        });
    }

    function swapForFallback(img) {
        const initials = (img.dataset.initials || 'SIA').toUpperCase();
        const wrapper = img.closest('.team-photo');
        if (!wrapper) return;
        wrapper.innerHTML = '';
        const fallback = document.createElement('span');
        fallback.className = 'avatar-fallback';
        fallback.textContent = initials;
        fallback.setAttribute('aria-label', `Avatar for ${img.alt || 'team member'}`);
        wrapper.appendChild(fallback);
    }

    function initRevealOnScroll() {
        const elements = document.querySelectorAll('.reveal');
        if (!('IntersectionObserver' in window)) {
            elements.forEach(el => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        elements.forEach(el => observer.observe(el));
    }

    function initHamburgerMenu() {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');
        const navAuth = document.getElementById('navAuth');
        
        if (hamburger && navLinks && navAuth) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navLinks.classList.toggle('active');
                navAuth.classList.toggle('active');
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!hamburger.contains(e.target) && !navLinks.contains(e.target) && !navAuth.contains(e.target)) {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                    navAuth.classList.remove('active');
                }
            });
            
            // Close menu when clicking a link
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                    navAuth.classList.remove('active');
                });
            });
        }
    }

    function initMosaicToggle() {
        const toggle = document.querySelector('.mosaic-toggle');
        const mosaic = document.querySelector('.mosaic');
        if (!toggle || !mosaic) return;

        const applyDefault = () => {
            const isMobile = window.innerWidth < 640;
            toggle.setAttribute('aria-pressed', String(isMobile));
            mosaic.classList.toggle('mosaic--stacked', isMobile);
            toggle.querySelector('span').textContent = isMobile ? 'Switch to mosaic view' : 'Switch to stacked view';
        };

        applyDefault();
        window.addEventListener('resize', applyDefault);

        toggle.addEventListener('click', () => {
            const pressed = toggle.getAttribute('aria-pressed') === 'true';
            toggle.setAttribute('aria-pressed', String(!pressed));
            mosaic.classList.toggle('mosaic--stacked', !pressed);
            toggle.querySelector('span').textContent = !pressed ? 'Switch to mosaic view' : 'Switch to stacked view';
        });
    }

    /* ---------- Background Particles ---------- */
    class Particle {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * this.width;
            this.y = initial ? Math.random() * this.height : -10;
            this.size = Math.random() * 2.2 + 0.8;
            this.speed = Math.random() * 1.5 + 0.4;
            this.opacity = Math.random() * 0.4 + 0.2;
        }

        update() {
            this.y += this.speed;
            this.x += Math.sin(this.y * 0.01) * 0.3;
            if (this.y > this.height + 10) {
                this.reset();
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = '#D4AF37';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#D4AF37';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function initParticles() {
        state.canvas = document.getElementById('particles');
        if (!state.canvas) return;
        state.ctx = state.canvas.getContext('2d');

        const setSize = () => {
            state.canvas.width = window.innerWidth;
            state.canvas.height = window.innerHeight;
        };

        setSize();
        window.addEventListener('resize', () => {
            setSize();
            state.particleCount = window.innerWidth < 768 ? 35 : 70;
            state.particles = [];
            populateParticles();
        });

        populateParticles();
        animateParticles();
    }

    function populateParticles() {
        for (let i = 0; i < state.particleCount; i += 1) {
            state.particles.push(new Particle(state.canvas.width, state.canvas.height));
        }
    }

    function animateParticles() {
        if (!state.ctx) return;
        state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height);
        state.particles.forEach(particle => {
            particle.update();
            particle.draw(state.ctx);
        });
        state.animationFrame = requestAnimationFrame(animateParticles);
    }

    /* ---------- Eye Parallax ---------- */
    function initParallax() {
        const eye = document.querySelector('.eye-parallax__image');
        if (!eye) return;

        const calcParallax = (xRatio, yRatio) => {
            const moveX = (xRatio - 0.5) * 40;
            const moveY = (yRatio - 0.5) * 20;
            eye.style.transform = `translate(${moveX}px, ${moveY}px)`;
        };

        window.addEventListener('mousemove', event => {
            const xRatio = event.clientX / window.innerWidth;
            const yRatio = event.clientY / window.innerHeight;
            calcParallax(xRatio, yRatio);
        });

        window.addEventListener('deviceorientation', event => {
            if (!event.gamma && !event.beta) return;
            const xRatio = (event.gamma + 45) / 90;
            const yRatio = (event.beta + 45) / 90;
            calcParallax(xRatio, yRatio);
        });
    }
})();

