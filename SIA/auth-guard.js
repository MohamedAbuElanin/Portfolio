/**
 * Auth Guard
 * Protects pages that require authentication.
 * Redirects to sign in page if no user is found.
 * FIXED: Now waits for auth to be ready before redirecting to prevent redirect loops.
 */

(function() {
    // Determine path to signin page based on current location
    function getSigninPath() {
        const path = window.location.pathname;
        if (path.includes('/profile/') || path.includes('/Test/') || path.includes('/admin/')) {
            return '../sign in/signin.html';
        }
        return './sign in/signin.html';
    }

    // Wait for auth state to be ready before checking
    function checkAuthAndRedirect() {
        // Wait for auth-state.js to initialize
        if (typeof window.onAuthStateReady === 'undefined') {
            setTimeout(checkAuthAndRedirect, 100);
            return;
        }

        window.onAuthStateReady((user) => {
            if (!user) {
                console.log("User not authenticated. Redirecting...");
                // Store current URL to redirect back after login
                sessionStorage.setItem('redirectUrl', window.location.href);
                window.location.href = getSigninPath();
            }
        });
    }

    // Start checking after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAuthAndRedirect);
    } else {
        checkAuthAndRedirect();
    }
})();
