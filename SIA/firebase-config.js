// Firebase Configuration - Modular SDK (v9+)
// Optimized for efficient data storage and performance
// Note: Firebase API keys are safe to expose in client-side code (publicly visible).
// They identify your project, but security is handled via Firebase Security Rules (Firestore/Storage) and App Check.

// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut as firebaseSignOut,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA0sCsF4FFX1KkLC70RcAdDiBnoat8hlRM",
  authDomain: "sia-993a7.firebaseapp.com",
  projectId: "sia-993a7",
  storageBucket: "sia-993a7.firebasestorage.app",
  messagingSenderId: "720888967656",
  appId: "1:720888967656:web:2f35bbf9fcff6c5a00745d",
  measurementId: "G-LBSJLPNDV9"
};

// Defensive check: Verify domain authorization
function checkFirebaseDomain() {
    const currentHostname = window.location.hostname;
    const expectedDomains = [
        'sia-993a7.web.app',
        'sia-993a7.firebaseapp.com',
        'localhost',
        '127.0.0.1'
    ];
    
    const isAuthorized = expectedDomains.some(domain => 
        currentHostname === domain || currentHostname.endsWith('.' + domain)
    );
    
    if (!isAuthorized && currentHostname !== 'localhost' && currentHostname !== '127.0.0.1') {
        console.warn('⚠️ Firebase Domain Warning:', {
            current: currentHostname,
            expected: expectedDomains.join(' or '),
            message: 'This domain may not be authorized. Please add it to Firebase Console → Authentication → Authorized domains'
        });
    }
}

// Initialize Firebase App - prevent duplicate initialization
let app;
try {
    checkFirebaseDomain();
    
    // Check if Firebase app is already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
        app = existingApps[0];
        console.log('✅ Firebase app already initialized, reusing existing instance');
    } else {
        app = initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized successfully');
    }
} catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    throw error;
}

// Initialize Firebase services using the app instance
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable offline persistence for Firestore (improves performance and offline support)
// This allows the app to work offline and cache data locally
// Only enable on production, disable on localhost to avoid conflicts
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '';

if (!isLocalhost) {
    try {
        enableIndexedDbPersistence(db).catch((err) => {
            if (err.code === 'failed-precondition') {
                // Multiple tabs open, persistence can only be enabled in one tab at a time
                // This is expected behavior, not an error - silently handle it
                console.log('ℹ️ Firestore persistence already enabled in another tab (this is normal)');
            } else if (err.code === 'unimplemented') {
                // The current browser does not support all of the features required
                console.log('ℹ️ Firestore persistence not supported in this browser');
            } else {
                // Only log actual errors, not expected conditions
                console.warn('⚠️ Firestore persistence error:', err);
            }
        });
    } catch (error) {
        // Persistence may not be available in all environments
        console.log('ℹ️ Firestore persistence not available:', error.message);
    }
} else {
    console.log('ℹ️ Firestore persistence disabled on localhost to avoid conflicts');
}

// Initialize Analytics (only in production, not on localhost)
// Analytics helps track user engagement and app performance
let analytics = null;
if (typeof window !== 'undefined' && 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1') {
    try {
        // Check if analytics is supported before initializing
        isSupported().then((supported) => {
            if (supported) {
                analytics = getAnalytics(app);
                console.log('✅ Analytics initialized');
            } else {
                console.log('ℹ️ Analytics not supported in this environment');
            }
        }).catch(() => {
            // Analytics not supported, continue without it
            console.log('ℹ️ Analytics initialization skipped');
        });
    } catch (error) {
        console.warn('⚠️ Analytics initialization failed:', error);
    }
} else {
    console.log('ℹ️ Analytics disabled on localhost');
}

// FIXED: Create compatibility layer for existing code
// This provides firebase.auth(), firebase.firestore(), firebase.storage() APIs
const firebaseCompat = {
    app: app,
    apps: [app],
    initializeApp: () => app,
    
    auth: () => ({
        currentUser: auth.currentUser,
        createUserWithEmailAndPassword: (email, password) => 
            createUserWithEmailAndPassword(auth, email, password),
        signInWithEmailAndPassword: (email, password) => 
            signInWithEmailAndPassword(auth, email, password),
        signInWithPopup: (provider) => 
            signInWithPopup(auth, provider),
        signOut: () => firebaseSignOut(auth),
        sendPasswordResetEmail: (email) => 
            sendPasswordResetEmail(auth, email),
        onAuthStateChanged: (callback) => 
            onAuthStateChanged(auth, callback),
        GoogleAuthProvider: GoogleAuthProvider
    }),
    
    firestore: () => {
        const firestoreInstance = {
            collection: (collectionPath) => {
                const collectionRef = collection(db, collectionPath);
                return {
                    doc: (docPath) => {
                        const docRef = doc(collectionRef, docPath);
                        return {
                            get: () => getDoc(docRef),
                            set: (data) => {
                                // Convert FieldValue.serverTimestamp() to actual serverTimestamp()
                                const processedData = {};
                                for (const key in data) {
                                    if (data[key] && typeof data[key] === 'object' && data[key]._methodName === 'serverTimestamp') {
                                        processedData[key] = serverTimestamp();
                                    } else {
                                        processedData[key] = data[key];
                                    }
                                }
                                return setDoc(docRef, processedData);
                            },
                            update: (data) => updateDoc(docRef, data)
                        };
                    },
                    add: (data) => {
                        const newDocRef = doc(collectionRef);
                        const processedData = {};
                        for (const key in data) {
                            if (data[key] && typeof data[key] === 'object' && data[key]._methodName === 'serverTimestamp') {
                                processedData[key] = serverTimestamp();
                            } else {
                                processedData[key] = data[key];
                            }
                        }
                        return setDoc(newDocRef, processedData).then(() => ({ id: newDocRef.id }));
                    }
                };
            },
            FieldValue: {
                serverTimestamp: () => ({ _methodName: 'serverTimestamp' })
            }
        };
        return firestoreInstance;
    },
    
    storage: () => ({
        ref: (path) => {
            const ref = storageRef(storage, path);
            return {
                put: (file) => {
                    return uploadBytes(ref, file).then((snapshot) => ({
                        ref: {
                            getDownloadURL: () => getDownloadURL(snapshot.ref)
                        }
                    }));
                },
                getDownloadURL: () => getDownloadURL(ref)
            };
        }
    })
};

// FIXED: Make services available globally for backward compatibility
window.db = db;
window.auth = auth;
window.storage = storage;
window.firebaseApp = app;
window.firebaseAnalytics = analytics;
window.firebase = firebaseCompat; // Compatibility layer

// FIXED: Export config and services for modular use
export { app, auth, db, storage, analytics, firebaseConfig };

// Export config for defensive checks
window.firebaseConfig = firebaseConfig;
