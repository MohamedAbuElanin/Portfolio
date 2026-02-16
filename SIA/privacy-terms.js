// Console easter egg
console.log("Welcome to SIA — Ancient Wisdom for Modern Careers");

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            const hamburger = document.getElementById('hamburger');
            const navLinks = document.getElementById('navLinks');
            const navAuth = document.getElementById('navAuth');
            if (hamburger && navLinks && navAuth) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                navAuth.classList.remove('active');
            }
        }
    });
});

// Mobile hamburger menu toggle
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

// Fade-in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all elements with fade-in class
document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Navbar scroll effect
let lastScroll = 0;
const header = document.querySelector('.site-header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
        header.style.boxShadow = 'none';
    } else {
        header.style.boxShadow = '0 2px 10px rgba(212, 175, 55, 0.1)';
    }

    lastScroll = currentScroll;
});

// Login button hover effect
document.querySelectorAll('.nav-btn-login').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px) scale(1.02)';
    });

    btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Floating golden particles effect
const canvas = document.getElementById('particles');
if (canvas) {
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 50;

    class Particle {
        constructor() {
            this.reset();
            this.y = Math.random() * canvas.height;
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = -10;
            this.size = Math.random() * 3 + 1;
            this.speed = Math.random() * 2 + 0.5;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.glow = Math.random() * 0.3 + 0.2;
        }
        
        update() {
            this.y += this.speed;
            this.x += Math.sin(this.y * 0.01) * 0.5;
            
            if (this.y > canvas.height) {
                this.reset();
            }
        }
        
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = '#D4AF37';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#D4AF37';
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        requestAnimationFrame(animate);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Hero section entrance animation
window.addEventListener('load', () => {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        setTimeout(() => {
            heroContent.classList.add('visible');
        }, 200);
    }
});

