// Console easter egg
console.log("Welcome to SIA — Ancient Wisdom for Modern Careers");

// Route Guard: Redirect if already logged in
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // User is already logged in, redirect to profile
        window.location.href = '../profile/profile.html';
    }
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

// Form elements
const resetForm = document.getElementById('resetFormElement');
const resetEmail = document.getElementById('resetEmail');
const resetEmailError = document.getElementById('resetEmailError');
const resetFormError = document.getElementById('resetFormError');
const resetFormSuccess = document.getElementById('resetFormSuccess');

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Clear errors
function clearErrors() {
    if (resetEmailError) resetEmailError.textContent = '';
    if (resetFormError) {
        resetFormError.textContent = '';
        resetFormError.classList.remove('show');
    }
    if (resetFormSuccess) {
        resetFormSuccess.textContent = '';
        resetFormSuccess.classList.remove('show');
    }
}

// Real-time validation
if (resetEmail) {
    resetEmail.addEventListener('blur', () => {
        if (!resetEmail.value.trim()) {
            resetEmailError.textContent = 'Email is required';
        } else if (!validateEmail(resetEmail.value)) {
            resetEmailError.textContent = 'Please enter a valid email address';
        } else {
            resetEmailError.textContent = '';
        }
    });

    resetEmail.addEventListener('input', () => {
        if (resetEmailError.textContent) {
            resetEmailError.textContent = '';
        }
    });
}

// Form submission
if (resetForm) {
    resetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();

        let isValid = true;

        // Validate email
        if (!resetEmail.value.trim()) {
            resetEmailError.textContent = 'Email is required';
            isValid = false;
        } else if (!validateEmail(resetEmail.value)) {
            resetEmailError.textContent = 'Please enter a valid email address';
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Firebase Password Reset
        const submitBtn = resetForm.querySelector('.form-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        const email = resetEmail.value.trim();

        // Send password reset email
        firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
                // Show success message
                resetFormSuccess.textContent = 'Password reset email sent! Please check your inbox.';
                resetFormSuccess.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
                resetFormSuccess.style.borderColor = '#4caf50';
                resetFormSuccess.style.color = '#4caf50';
                resetFormSuccess.classList.add('show');
                
                // Clear form
                resetEmail.value = '';
                
                // Redirect to sign in after 3 seconds
                setTimeout(() => {
                    window.location.href = '../sign in/signin.html';
                }, 3000);
            })
            .catch((error) => {
                // Handle errors
                let errorMessage = 'An error occurred. Please try again.';
                
                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMessage = 'No account found with this email address.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Too many requests. Please try again later.';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Please check your connection.';
                        break;
                    default:
                        errorMessage = error.message || 'An error occurred. Please try again.';
                }
                
                resetFormError.textContent = errorMessage;
                resetFormError.classList.add('show');
            
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
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

