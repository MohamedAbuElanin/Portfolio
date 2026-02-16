// FIXED: Import Firebase modular SDK
import { auth, db, storage } from '../firebase-config.js';
import { 
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { 
    collection, 
    doc, 
    getDoc, 
    setDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { 
    ref as storageRef, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

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
const passwordToggle = document.getElementById('passwordToggle');
const password = document.getElementById('password');
const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
const confirmPassword = document.getElementById('confirmPassword');

if (passwordToggle && password) {
    passwordToggle.addEventListener('click', () => {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);
        
        const icon = passwordToggle.querySelector('i');
        if (type === 'password') {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    });
}

if (confirmPasswordToggle && confirmPassword) {
    confirmPasswordToggle.addEventListener('click', () => {
        const type = confirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPassword.setAttribute('type', type);
        
        const icon = confirmPasswordToggle.querySelector('i');
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
const signUpForm = document.getElementById('signUpFormElement');
const fullName = document.getElementById('fullName');
const email = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const dateOfBirth = document.getElementById('dateOfBirth');
const gender = document.getElementById('gender');
const education = document.getElementById('education');
const educationOtherWrapper = document.getElementById('educationOtherWrapper');
const educationOther = document.getElementById('educationOther');
const studentStatus = document.getElementById('studentStatus');
const agreeTerms = document.getElementById('agreeTerms');
const avatarUpload = document.getElementById('avatarUpload');

// Error elements
const fullNameError = document.getElementById('fullNameError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');
const dateOfBirthError = document.getElementById('dateOfBirthError');
const genderError = document.getElementById('genderError');
const educationError = document.getElementById('educationError');
const studentStatusError = document.getElementById('studentStatusError');
const agreeTermsError = document.getElementById('agreeTermsError');
const signUpFormError = document.getElementById('signUpFormError');

// Email validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Secure password validation (8+ chars, uppercase, lowercase, number, symbol)
function validatePassword(password) {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one symbol' };
    }
    return { valid: true, message: '' };
}

// Date validation (must be at least 13 years old)
function validateDateOfBirth(dateString) {
    const birthDate = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1 >= 13;
    }
    return age >= 13;
}

// Clear errors
function clearErrors() {
    const errorElements = [
        fullNameError, emailError, passwordError, confirmPasswordError,
        dateOfBirthError, genderError, educationError, studentStatusError, agreeTermsError
    ];
    
    errorElements.forEach(error => {
        if (error) error.textContent = '';
    });
    
    if (signUpFormError) {
        signUpFormError.textContent = '';
        signUpFormError.classList.remove('show');
    }
}

// Real-time validation
if (fullName) {
    fullName.addEventListener('blur', () => {
        if (!fullName.value.trim()) {
            fullNameError.textContent = 'Full name is required';
        } else if (fullName.value.trim().length < 2) {
            fullNameError.textContent = 'Full name must be at least 2 characters';
        } else {
            fullNameError.textContent = '';
        }
    });

    fullName.addEventListener('input', () => {
        if (fullNameError.textContent) {
            fullNameError.textContent = '';
        }
    });
}

if (email) {
    email.addEventListener('blur', () => {
        if (!email.value.trim()) {
            emailError.textContent = 'Email is required';
        } else if (!validateEmail(email.value)) {
            emailError.textContent = 'Please enter a valid email address';
        } else {
            emailError.textContent = '';
        }
    });

    email.addEventListener('input', () => {
        if (emailError.textContent) {
            emailError.textContent = '';
        }
    });
}

if (passwordInput) {
    passwordInput.addEventListener('blur', () => {
        if (!passwordInput.value.trim()) {
            passwordError.textContent = 'Password is required';
        } else {
            const validation = validatePassword(passwordInput.value);
            if (!validation.valid) {
                passwordError.textContent = validation.message;
            } else {
                passwordError.textContent = '';
            }
        }
    });

    passwordInput.addEventListener('input', () => {
        if (passwordError.textContent) {
            passwordError.textContent = '';
        }
        // Check password match if confirm password has value
        if (confirmPasswordInput && confirmPasswordInput.value) {
            if (passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordError.textContent = 'Passwords do not match';
            } else {
                confirmPasswordError.textContent = '';
            }
        }
    });
}

if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('blur', () => {
        if (!confirmPasswordInput.value.trim()) {
            confirmPasswordError.textContent = 'Please confirm your password';
        } else if (passwordInput && passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordError.textContent = 'Passwords do not match';
        } else {
            confirmPasswordError.textContent = '';
        }
    });

    confirmPasswordInput.addEventListener('input', () => {
        if (confirmPasswordError.textContent) {
            if (passwordInput && passwordInput.value === confirmPasswordInput.value) {
                confirmPasswordError.textContent = '';
            }
        }
    });
}

if (dateOfBirth) {
    dateOfBirth.addEventListener('change', () => {
        if (!dateOfBirth.value) {
            dateOfBirthError.textContent = 'Date of birth is required';
        } else if (!validateDateOfBirth(dateOfBirth.value)) {
            dateOfBirthError.textContent = 'You must be at least 13 years old';
        } else {
            dateOfBirthError.textContent = '';
        }
    });
}

// Education "Other" field toggle
if (education && educationOtherWrapper) {
    education.addEventListener('change', () => {
        if (education.value === 'other') {
            educationOtherWrapper.style.display = 'block';
            if (educationOther) {
                educationOther.required = true;
            }
        } else {
            educationOtherWrapper.style.display = 'none';
            if (educationOther) {
                educationOther.required = false;
                educationOther.value = '';
            }
        }
    });

    education.addEventListener('blur', () => {
        if (!education.value) {
            educationError.textContent = 'Education level is required';
        } else if (education.value === 'other' && (!educationOther || !educationOther.value.trim())) {
            educationError.textContent = 'Please specify your education level';
        } else {
            educationError.textContent = '';
        }
    });

    if (educationOther) {
        educationOther.addEventListener('input', () => {
            if (educationError.textContent) {
                educationError.textContent = '';
            }
        });
    }
}

if (studentStatus) {
    studentStatus.addEventListener('change', () => {
        if (!studentStatus.value) {
            studentStatusError.textContent = 'Student status is required';
        } else {
            studentStatusError.textContent = '';
        }
    });
}

// Form submission
if (signUpForm) {
    signUpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearErrors();

        let isValid = true;

        // Validate full name
        if (!fullName.value.trim()) {
            fullNameError.textContent = 'Full name is required';
            isValid = false;
        } else if (fullName.value.trim().length < 2) {
            fullNameError.textContent = 'Full name must be at least 2 characters';
            isValid = false;
        }

        // Validate email
        if (!email.value.trim()) {
            emailError.textContent = 'Email is required';
            isValid = false;
        } else if (!validateEmail(email.value)) {
            emailError.textContent = 'Please enter a valid email address';
            isValid = false;
        }

        // Validate password
        if (!passwordInput.value.trim()) {
            passwordError.textContent = 'Password is required';
            isValid = false;
        } else {
            const passwordValidation = validatePassword(passwordInput.value);
            if (!passwordValidation.valid) {
                passwordError.textContent = passwordValidation.message;
                isValid = false;
            }
        }

        // Validate confirm password
        if (!confirmPasswordInput.value.trim()) {
            confirmPasswordError.textContent = 'Please confirm your password';
            isValid = false;
        } else if (passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordError.textContent = 'Passwords do not match';
            isValid = false;
        }

        // Validate date of birth
        if (!dateOfBirth.value) {
            dateOfBirthError.textContent = 'Date of birth is required';
            isValid = false;
        } else if (!validateDateOfBirth(dateOfBirth.value)) {
            dateOfBirthError.textContent = 'You must be at least 13 years old';
            isValid = false;
        }

        // Validate gender
        if (!gender.value) {
            genderError.textContent = 'Gender is required';
            isValid = false;
        }

        // Validate education
        if (!education.value) {
            educationError.textContent = 'Education level is required';
            isValid = false;
        } else if (education.value === 'other' && (!educationOther || !educationOther.value.trim())) {
            educationError.textContent = 'Please specify your education level';
            isValid = false;
        }

        // Validate student status
        if (!studentStatus.value) {
            studentStatusError.textContent = 'Student status is required';
            isValid = false;
        }

        // Validate terms agreement
        if (!agreeTerms.checked) {
            agreeTermsError.textContent = 'You must agree to the Privacy Policy and Terms of Use';
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Firebase Authentication and Firestore integration
        const submitBtn = signUpForm.querySelector('.form-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        submitBtn.disabled = true;

        // Collect form data
        const formData = {
            fullName: fullName.value.trim(),
            email: email.value.trim(),
            password: passwordInput.value,
            dateOfBirth: dateOfBirth.value,
            gender: gender.value,
            education: education.value,
            educationOther: education.value === 'other' ? educationOther.value.trim() : '',
            studentStatus: studentStatus.value,
            avatarFile: avatarUpload.files[0] || null
        };

        // Determine default avatar based on gender (before Firestore loads)
        const defaultAvatar = formData.gender === 'male' 
            ? '../assets/male.svg' 
            : formData.gender === 'female'
            ? '../assets/female.svg'
            : '../assets/male.svg'; // Default to male if gender missing

        // FIXED: Create user in Firebase Authentication using modular SDK
        createUserWithEmailAndPassword(auth, formData.email, formData.password)
            .then((userCredential) => {
                const user = userCredential.user;
                
                // FIXED: If avatar file is uploaded, upload to Firebase Storage using modular SDK
                if (formData.avatarFile) {
                    const avatarRef = storageRef(storage, `avatars/${user.uid}.jpg`);
                    return uploadBytes(avatarRef, formData.avatarFile)
                        .then((snapshot) => {
                            // Get download URL
                            return getDownloadURL(snapshot.ref);
                        })
                        .then((downloadURL) => {
                            // Return both user and downloadURL
                            return { user, avatarURL: downloadURL };
                        });
                } else {
                    // No avatar uploaded, use default based on gender
                    return { user, avatarURL: defaultAvatar };
                }
            })
            .then(({ user, avatarURL }) => {
                // Save ALL user profile data to Firestore
                const userProfile = {
                    uid: user.uid,
                    fullName: formData.fullName,
                    email: formData.email,
                    dateOfBirth: formData.dateOfBirth,
                    gender: formData.gender,
                    education: formData.education === 'other' ? formData.educationOther : formData.education,
                    studentStatus: formData.studentStatus,
                    avatar: avatarURL,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };

                // FIXED: Save user profile using modular SDK
                const userProfileRef = doc(db, 'users', user.uid);
                return setDoc(userProfileRef, userProfile);
            })
            .then(() => {
                // Show success message
                signUpFormError.textContent = 'Account created successfully! Redirecting...';
                signUpFormError.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
                signUpFormError.style.borderColor = '#4caf50';
                signUpFormError.style.color = '#4caf50';
                signUpFormError.classList.add('show');
                
                // Redirect to sign in page
                setTimeout(() => {
                    window.location.href = '../sign in/signin.html';
                }, 1500);
            })
            .catch((error) => {
                // FIXED: Rollback: Delete user from Auth if Firestore/Storage failed
                const currentUser = auth.currentUser;
                if (currentUser) {
                    currentUser.delete().catch(err => console.error("Rollback failed:", err));
                }

                // Handle errors
                let errorMessage = 'An error occurred. Please try again.';
                
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'This email is already registered. Please sign in instead.';
                        emailError.textContent = errorMessage;
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address.';
                        emailError.textContent = errorMessage;
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'Password is too weak.';
                        passwordError.textContent = errorMessage;
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Please check your connection.';
                        break;
                    default:
                        errorMessage = error.message || 'An error occurred. Please try again.';
                }
                
                signUpFormError.textContent = errorMessage;
                signUpFormError.classList.add('show');
            
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
    });
}

// Google Sign Up
// FIXED: Wait for Firebase to be ready and handle domain authorization errors
function setupGoogleSignUp() {
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
                if (signUpFormError) {
                    signUpFormError.textContent = 'Firebase initialization failed. Please refresh the page.';
                    signUpFormError.classList.add('show');
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
                googleBtnElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing up...';

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
                
                if (!userDoc.exists()) {
                    // Create user profile with Google data
                    const defaultAvatar = '../assets/male.svg';
                    
                    const userProfile = {
                        uid: user.uid,
                        fullName: user.displayName || '', // Use Google display name
                        email: user.email || '',
                        dateOfBirth: '',
                        gender: 'male', // Default, user can update later
                        education: '',
                        studentStatus: '',
                        avatar: user.photoURL || defaultAvatar, // Use Google photo if available
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    };
                    
                    // FIXED: Save user profile using modular SDK
                    const userProfileRef = doc(db, 'users', user.uid);
                    await setDoc(userProfileRef, userProfile);
                    
                    // Redirect to profile with edit mode for new users to complete profile
                    window.location.href = '../profile/profile.html?edit=true';
                } else {
                    // User already exists, just sign them in
                    window.location.href = '../profile/profile.html';
                }
            } catch (error) {
                console.error('Google sign-up error:', error);
                
                let errorMessage = 'An error occurred. Please try again.';
                
                switch (error.code) {
                    case 'auth/popup-closed-by-user':
                        errorMessage = 'Sign-up popup was closed. Please try again.';
                        break;
                    case 'auth/cancelled-popup-request':
                        errorMessage = 'Sign-up was cancelled.';
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
                    case 'auth/email-already-in-use':
                        errorMessage = 'This email is already registered. Please sign in instead.';
                        break;
                    default:
                        errorMessage = error.message || 'Failed to sign up with Google. Please try again.';
                }
                
                if (signUpFormError) {
                    signUpFormError.textContent = errorMessage;
                    signUpFormError.classList.add('show');
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

// Setup Google sign-up when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupGoogleSignUp);
} else {
    setupGoogleSignUp();
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
