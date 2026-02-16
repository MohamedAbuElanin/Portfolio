// FIXED: Import Firebase modular SDK
import { auth } from '../firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    signInWithPopup,
    GoogleAuthProvider 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { 
    collection, 
    doc, 
    getDoc, 
    setDoc,
    updateDoc,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { db } from '../firebase-config.js';

// Console easter egg
console.log("Welcome to SIA — Ancient Wisdom for Modern Careers");

// Route Guard: Redirect if already logged in
// FIXED: Use centralized auth state to prevent redirect loops
document.addEventListener('DOMContentLoaded', () => {
    function checkAuthAndRedirect() {
        if (typeof window.onAuthStateReady === 'undefined') {
            setTimeout(checkAuthAndRedirect, 100);
            return;
        }

        window.onAuthStateReady((user) => {
            if (user) {
                // User is already logged in, redirect to profile
                window.location.href = '../profile/profile.html';
            }
        });
    }

    checkAuthAndRedirect();
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

// Password toggle functionality
const signInPasswordToggle = document.getElementById('signInPasswordToggle');
const signInPassword = document.getElementById('signInPassword');

if (signInPasswordToggle && signInPassword) {
    signInPasswordToggle.addEventListener('click', () => {
        const type = signInPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        signInPassword.setAttribute('type', type);
        
        const icon = signInPasswordToggle.querySelector('i');
        if (type === 'password') {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    });
}

// Form validation
const signInForm = document.getElementById('signInFormElement');
const signInEmail = document.getElementById('signInEmail');
const signInPasswordInput = document.getElementById('signInPassword');
const signInEmailError = document.getElementById('signInEmailError');
const signInPasswordError = document.getElementById('signInPasswordError');
const signInFormError = document.getElementById('signInFormError');

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Clear errors
function clearErrors() {
    if (signInEmailError) signInEmailError.textContent = '';
    if (signInPasswordError) signInPasswordError.textContent = '';
    if (signInFormError) {
        signInFormError.textContent = '';
        signInFormError.classList.remove('show');
    }
}

// Real-time validation
if (signInEmail) {
    signInEmail.addEventListener('blur', () => {
        if (!signInEmail.value.trim()) {
            signInEmailError.textContent = 'Email is required';
        } else if (!validateEmail(signInEmail.value)) {
            signInEmailError.textContent = 'Please enter a valid email address';
        } else {
            signInEmailError.textContent = '';
        }
    });

    signInEmail.addEventListener('input', () => {
        if (signInEmailError.textContent) {
            signInEmailError.textContent = '';
        }
    });
}

if (signInPasswordInput) {
    signInPasswordInput.addEventListener('blur', () => {
        if (!signInPasswordInput.value.trim()) {
            signInPasswordError.textContent = 'Password is required';
        } else if (signInPasswordInput.value.length < 6) {
            signInPasswordError.textContent = 'Password must be at least 6 characters';
        } else {
            signInPasswordError.textContent = '';
        }
    });

    signInPasswordInput.addEventListener('input', () => {
        if (signInPasswordError.textContent) {
            signInPasswordError.textContent = '';
        }
    });
}

// Form submission
if (signInForm) {
    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();

        let isValid = true;

        // Validate email
        if (!signInEmail.value.trim()) {
            signInEmailError.textContent = 'Email is required';
            isValid = false;
        } else if (!validateEmail(signInEmail.value)) {
            signInEmailError.textContent = 'Please enter a valid email address';
            isValid = false;
        }

        // Validate password
        if (!signInPasswordInput.value.trim()) {
            signInPasswordError.textContent = 'Password is required';
            isValid = false;
        } else if (signInPasswordInput.value.length < 6) {
            signInPasswordError.textContent = 'Password must be at least 6 characters';
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Firebase Authentication integration
        const submitBtn = signInForm.querySelector('.form-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        submitBtn.disabled = true;

        const email = signInEmail.value.trim();
        const password = signInPasswordInput.value;

        // FIXED: Sign in with email and password using modular SDK
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // User signed in successfully
                const user = userCredential.user;
                
                // Get the ID token
                return user.getIdToken().then((token) => {
                    // Save tokens to localStorage
                    localStorage.setItem("authToken", token);
                    localStorage.setItem("uid", user.uid);
                    
                    return { user, token };
                });
            })
            .then(({ user }) => {
                const enteredEmail = email; // captured from input scope
                const enteredPass = password; // captured from input scope

                // Admin Redirect Logic
                if (enteredEmail === "mohamedosman@gamil.com" && enteredPass === "Mohamed*66778899*") {
                    window.location.href = '../admin/admin.html';
                } else {
                    window.location.href = '../profile/profile.html';
                }
            })
            .catch((error) => {
                // Handle errors
                let errorMessage = 'An error occurred. Please try again.';
                
                switch (error.code) {
                    case 'auth/user-not-found':
                        errorMessage = 'No account found with this email.';
                        signInEmailError.textContent = errorMessage;
                        break;
                    case 'auth/wrong-password':
                        errorMessage = 'Incorrect password.';
                        signInPasswordError.textContent = errorMessage;
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address.';
                        signInEmailError.textContent = errorMessage;
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'This account has been disabled.';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Please check your connection.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage = 'Too many failed attempts. Please try again later.';
                        break;
                    default:
                        errorMessage = error.message || 'Invalid email or password. Please try again.';
                }
                
                signInFormError.textContent = errorMessage;
                signInFormError.classList.add('show');
                
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
    });
}

// Google Sign In
// FIXED: Wait for Firebase to be ready and handle domain authorization errors
function setupGoogleSignIn() {
    const googleBtn = document.querySelector('.google-btn');
    if (!googleBtn) return;

    // FIXED: Wait for Firebase to be initialized
    function waitForFirebase(callback, maxAttempts = 50) {
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            if (typeof window.auth !== 'undefined' && window.auth) {
                clearInterval(checkInterval);
                callback();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error('Firebase not initialized after', maxAttempts, 'attempts');
                if (signInFormError) {
                    signInFormError.textContent = 'Firebase initialization failed. Please refresh the page.';
                    signInFormError.classList.add('show');
                }
            }
        }, 100);
    }

    waitForFirebase(() => {
        googleBtn.addEventListener('click', async () => {
            // Store original text outside try-catch for proper scope
            const originalText = googleBtn.innerHTML;
            let googleBtnElement = googleBtn; // Store reference
            
            try {
                // FIXED: Check if Firebase is properly initialized
                if (!auth) {
                    throw new Error('Firebase Auth not available');
                }

                googleBtnElement.disabled = true;
                googleBtnElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

                // FIXED: Use modular SDK GoogleAuthProvider
                const provider = new GoogleAuthProvider();
                
                // Add scopes if needed
                provider.addScope('profile');
                provider.addScope('email');

                // FIXED: Use signInWithPopup with modular SDK
                const result = await signInWithPopup(auth, provider);
                const user = result.user;
                
                // Get ID token and save to localStorage
                const token = await user.getIdToken();
                localStorage.setItem("authToken", token);
                localStorage.setItem("uid", user.uid);
                
                // FIXED: Check if user document exists in Firestore using modular SDK
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                let isNewUser = false;
                
                if (!userDoc.exists()) {
                    // Create user profile with Google data
                    const defaultAvatar = '../assets/male.svg';
                    
                    // Extract name parts from displayName if available
                    const displayName = user.displayName || '';
                    const nameParts = displayName.split(' ');
                    const firstName = nameParts[0] || '';
                    const lastName = nameParts.slice(1).join(' ') || '';
                    
                    const userProfile = {
                        uid: user.uid,
                        fullName: displayName || '', // Use Google display name
                        displayName: displayName || '', // Also save as displayName for compatibility
                        email: user.email || '', // Use Google email
                        dateOfBirth: '', // Will be collected when user edits profile
                        gender: 'male', // Default, user can update
                        education: '',
                        studentStatus: '',
                        avatar: user.photoURL || defaultAvatar, // Use Google photo if available
                        photoURL: user.photoURL || defaultAvatar, // Also save as photoURL
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                        lastLogin: serverTimestamp(),
                        provider: 'google' // Track sign-in method
                    };
                    
                    // FIXED: Save user profile using modular SDK
                    const userProfileRef = doc(db, 'users', user.uid);
                    await setDoc(userProfileRef, userProfile);
                    
                    // Log activity
                    try {
                        const activityRef = doc(collection(db, 'users', user.uid, 'activityLogs'));
                        await setDoc(activityRef, {
                            action: 'Account Created via Google Sign-In',
                            timestamp: serverTimestamp(),
                            details: { email: user.email }
                        });
                    } catch (activityError) {
                        console.warn('Could not log activity:', activityError);
                    }
                    
                    isNewUser = true;
                } else {
                    // Update last login for existing users
                    const userProfileRef = doc(db, 'users', user.uid);
                    await updateDoc(userProfileRef, {
                        lastLogin: serverTimestamp(),
                        // Update Google data if it changed
                        email: user.email || userDoc.data().email,
                        fullName: user.displayName || userDoc.data().fullName,
                        displayName: user.displayName || userDoc.data().displayName,
                        photoURL: user.photoURL || userDoc.data().photoURL,
                        avatar: user.photoURL || userDoc.data().avatar
                    });
                    
                    // Log activity
                    try {
                        const activityRef = doc(collection(db, 'users', user.uid, 'activityLogs'));
                        await setDoc(activityRef, {
                            action: 'Signed In via Google',
                            timestamp: serverTimestamp(),
                            details: {}
                        });
                    } catch (activityError) {
                        console.warn('Could not log activity:', activityError);
                    }
                }

                // Redirect based on user status
                if (isNewUser) {
                    window.location.href = '../profile/profile.html?edit=true';
                } else {
                    window.location.href = '../profile/profile.html';
                }
            } catch (error) {
                console.error('Google sign-in error:', error);
                
                let errorMessage = 'An error occurred. Please try again.';
                
                switch (error.code) {
                    case 'auth/popup-closed-by-user':
                        errorMessage = 'Sign-in popup was closed. Please try again.';
                        break;
                    case 'auth/cancelled-popup-request':
                        errorMessage = 'Sign-in was cancelled.';
                        break;
                    case 'auth/popup-blocked':
                        errorMessage = 'Popup was blocked by browser. Please allow popups for this site.';
                        break;
                    case 'auth/unauthorized-domain':
                        errorMessage = 'This domain is not authorized. Please add ' + window.location.hostname + ' to Firebase Console → Authentication → Authorized domains.';
                        console.error('Domain authorization error. Current domain:', window.location.hostname);
                        console.error('Expected domains: sia-993a7.web.app, sia-993a7.firebaseapp.com');
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Please check your connection.';
                        break;
                    case 'auth/operation-not-allowed':
                        errorMessage = 'Google sign-in is not enabled. Please contact support.';
                        break;
                    default:
                        errorMessage = error.message || 'Failed to sign in with Google. Please try again.';
                }
                
                if (signInFormError) {
                    signInFormError.textContent = errorMessage;
                    signInFormError.classList.add('show');
                }
                
                // Restore button state
                if (googleBtnElement) {
                    googleBtnElement.innerHTML = originalText;
                    googleBtnElement.disabled = false;
                }
            }
        });
    });
}

// Setup Google sign-in when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupGoogleSignIn);
} else {
    setupGoogleSignIn();
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
