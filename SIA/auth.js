/**
 * Global Firebase Auth Listener
 * FIXED: Uses modular SDK for proper Firebase initialization
 * Handles UI updates based on authentication state across the entire website.
 */

// Import Firebase services from firebase-config.js
import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    // Wait for auth state to be ready (from auth-state.js)
    function initUIListener() {
        if (typeof window.onAuthStateReady === 'undefined') {
            setTimeout(initUIListener, 100);
            return;
        }

        window.onAuthStateReady((user) => {
            updateGlobalAuthUI(user);
        });
    }

    initUIListener();
});

function updateGlobalAuthUI(user) {
    const navAuth = document.getElementById('navAuth');
    const drawerAuth = document.querySelector('.drawer-auth');
    const pathPrefix = getPathPrefix();
    
    // Common HTML for Logged In State
    const loggedInHtml = `
        <a href="${pathPrefix}profile/profile.html" class="btn-nav btn-nav--signin">الملف الشخصي</a>
        <button onclick="handleGlobalLogout()" class="btn-nav btn-nav--signup">تسجيل الخروج</button>
    `;

    // Common HTML for Logged Out State
    const loggedOutHtml = `
        <a href="${pathPrefix}sign in/signin.html" class="btn-nav btn-nav--signin">تسجيل الدخول</a>
        <a href="${pathPrefix}sign up/signup.html" class="btn-nav btn-nav--signup">إنشاء حساب</a>
    `;

    const content = user ? loggedInHtml : loggedOutHtml;

    if (navAuth) navAuth.innerHTML = content;
    if (drawerAuth) drawerAuth.innerHTML = content;
}

function getPathPrefix() {
    const path = window.location.pathname;
    
    // Check depth based on known subdirectory names
    const subdirs = ['/profile/', '/Test/', '/About/', '/sign in/', '/sign up/', '/reset/', '/admin/', '/errors/'];
    if (subdirs.some(subdir => path.includes(subdir))) {
        return '../';
    }
    
    return './';
}

// FIXED: Use modular SDK signOut
window.handleGlobalLogout = function() {
    signOut(auth).then(() => {
        // Redirect to home or sign in page after logout
        window.location.href = getPathPrefix() + 'index.html';
    }).catch((error) => {
        console.error('Logout error:', error);
    });
};
