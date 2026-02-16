// Console easter egg
console.log("Welcome to SIA — Ancient Wisdom for Modern Careers");

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

// Fade-in animation on page load
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.container');
    if (container) {
        container.style.opacity = '0';
        setTimeout(() => {
            container.style.animation = 'fadeIn 1.5s ease-in forwards';
        }, 100);
    }
});

// Floating golden particles effect
const canvas = document.getElementById('particles');
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

// Mouse move parallax effect
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
    
    const eyeOfRa = document.querySelector('.eye-of-ra');
    
    if (eyeOfRa) {
        const moveX = (mouseX - 0.5) * 15;
        const moveY = (mouseY - 0.5) * 15;
        
        // Combine parallax with CSS animation (scale from pulseGlow)
        const currentTime = Date.now() / 1000;
        const pulseScale = 1 + Math.sin(currentTime * 2) * 0.025;
        eyeOfRa.style.transform = `translate(${moveX}px, ${moveY}px) scale(${pulseScale})`;
    }
});

