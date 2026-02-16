/**
 * Centralized Auth State Management
 * FIXED: Uses modular SDK for proper Firebase initialization
 * Provides a single source of truth for authentication state with proper initialization gating
 */

// Import Firebase services from firebase-config.js
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// Global auth state
window.authState = {
    user: null,
    ready: false,
    listeners: []
};

// Initialize auth state listener (single instance)
// FIXED: Uses modular SDK auth instance
function initAuthState() {
    // Wait for Firebase to be initialized
    if (!window.firebaseApp || !auth) {
        console.warn('Firebase not initialized yet, retrying...');
        setTimeout(initAuthState, 100);
        return;
    }

    // FIXED: Use modular SDK onAuthStateChanged
    onAuthStateChanged(auth, (user) => {
        window.authState.user = user;
        window.authState.ready = true;
        
        // Notify all registered listeners
        window.authState.listeners.forEach(listener => {
            try {
                listener(user);
            } catch (error) {
                console.error('Error in auth state listener:', error);
            }
        });
        
        // Dispatch custom event for backward compatibility
        const event = new CustomEvent('auth-state-changed', { detail: { user } });
        document.dispatchEvent(event);
    });
}

// Register a listener for auth state changes
window.onAuthStateReady = function(callback) {
    if (window.authState.ready) {
        // Auth is already ready, call immediately
        callback(window.authState.user);
    } else {
        // Auth not ready yet, register listener
        window.authState.listeners.push(callback);
    }
};

// Wait for DOM and Firebase to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initAuthState, 100);
    });
} else {
    setTimeout(initAuthState, 100);
}
