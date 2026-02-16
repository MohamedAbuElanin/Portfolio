/**
 * Firebase Initialization Module
 * Centralized Firebase initialization and service access
 * Prevents duplicate initialization and provides consistent service access
 */

(function() {
    'use strict';

    // Wait for Firebase SDK to load
    function waitForFirebase(callback, maxAttempts = 50) {
        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            if (typeof firebase !== 'undefined' && firebase.apps) {
                clearInterval(checkInterval);
                callback();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.error('Firebase SDK failed to load after', maxAttempts, 'attempts');
            }
        }, 100);
    }

    // Initialize Firebase services
    function initFirebaseServices() {
        if (!window.firebase || !window.firebase.apps) {
            console.error('Firebase SDK not loaded. Ensure firebase-config.js is loaded first.');
            return;
        }

        // Services are already initialized in firebase-config.js
        // This module just provides a consistent API
        if (!window.firebaseInitialized) {
            window.firebaseInitialized = true;
            console.log('Firebase services initialized');
        }
    }

    // Public API
    window.firebaseInit = {
        /**
         * Get Firebase Auth instance
         * @returns {firebase.auth.Auth}
         */
        getAuth: function() {
            return window.auth || firebase.auth();
        },

        /**
         * Get Firestore instance
         * @returns {firebase.firestore.Firestore}
         */
        getFirestore: function() {
            return window.db || firebase.firestore();
        },

        /**
         * Get Storage instance
         * @returns {firebase.storage.Storage}
         */
        getStorage: function() {
            return window.storage || firebase.storage();
        },

        /**
         * Check if Firebase is initialized
         * @returns {boolean}
         */
        isInitialized: function() {
            return window.firebaseInitialized === true && 
                   typeof firebase !== 'undefined' && 
                   firebase.apps.length > 0;
        }
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            waitForFirebase(initFirebaseServices);
        });
    } else {
        waitForFirebase(initFirebaseServices);
    }
})();

