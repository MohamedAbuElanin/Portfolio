// Mobile Menu Handler for SIA Website
// This script handles the mobile hamburger menu functionality across all pages

document.addEventListener('DOMContentLoaded', function() {
    // Get mobile menu elements
    const navToggle = document.getElementById('navToggle');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navAuth = document.querySelector('.nav-auth');
    const drawerLinks = document.querySelector('.drawer-links');
    const drawerAuth = document.querySelector('.drawer-auth');

    // Mobile menu toggle functionality
    if (hamburger && navToggle) {
        hamburger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Toggle the checkbox
            navToggle.checked = !navToggle.checked;

            // Toggle active classes
            hamburger.classList.toggle('active');

            if (navLinks) navLinks.classList.toggle('active');
            if (navAuth) navAuth.classList.toggle('active');
            if (drawerLinks) drawerLinks.classList.toggle('active');
            if (drawerAuth) drawerAuth.classList.toggle('active');

            // Prevent body scrolling when menu is open
            if (navToggle.checked) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navToggle && navToggle.checked) {
            const isClickInsideMenu = hamburger.contains(e.target) ||
                                    (navLinks && navLinks.contains(e.target)) ||
                                    (navAuth && navAuth.contains(e.target)) ||
                                    (drawerLinks && drawerLinks.contains(e.target)) ||
                                    (drawerAuth && drawerAuth.contains(e.target));

            if (!isClickInsideMenu) {
                closeMenu();
            }
        }
    });

    // Close menu when clicking on menu links
    const menuLinks = document.querySelectorAll('.nav-links a, .drawer-links a, .nav-auth a, .drawer-auth a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMenu();
        });
    });

    // Close menu on window resize to desktop size
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });

    // Function to close mobile menu
    function closeMenu() {
        if (navToggle) {
            navToggle.checked = false;
        }

        if (hamburger) {
            hamburger.classList.remove('active');
        }

        if (navLinks) navLinks.classList.remove('active');
        if (navAuth) navAuth.classList.remove('active');
        if (drawerLinks) drawerLinks.classList.remove('active');
        if (drawerAuth) drawerAuth.classList.remove('active');

        // Restore body scrolling
        document.body.style.overflow = '';
    }

    // Handle hamburger animation
    if (hamburger) {
        const spans = hamburger.querySelectorAll('span');

        hamburger.addEventListener('click', function() {
            spans.forEach((span, index) => {
                if (hamburger.classList.contains('active')) {
                    // Animate to X
                    if (index === 0) {
                        span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    } else if (index === 1) {
                        span.style.opacity = '0';
                    } else if (index === 2) {
                        span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                    }
                } else {
                    // Animate back to hamburger
                    if (index === 0) {
                        span.style.transform = 'none';
                    } else if (index === 1) {
                        span.style.opacity = '1';
                    } else if (index === 2) {
                        span.style.transform = 'none';
                    }
                }
            });
        });
    }

    // Handle escape key to close menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navToggle && navToggle.checked) {
            closeMenu();
        }
    });

    // Improve accessibility for mobile menu
    if (hamburger) {
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Toggle navigation menu');

        hamburger.addEventListener('click', function() {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            hamburger.setAttribute('aria-expanded', !isExpanded);
        });
    }

    // Handle focus management for better accessibility
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    if (navLinks || navAuth) {
        document.addEventListener('keydown', function(e) {
            if (navToggle && navToggle.checked && e.key === 'Tab') {
                const menuContainer = document.querySelector('.nav-drawer') ||
                                    document.querySelector('.nav-links.active') ||
                                    document.querySelector('.nav-auth.active');

                if (menuContainer) {
                    const focusableContent = menuContainer.querySelectorAll(focusableElements);
                    const firstFocusable = focusableContent[0];
                    const lastFocusable = focusableContent[focusableContent.length - 1];

                    if (e.shiftKey) {
                        if (document.activeElement === firstFocusable) {
                            lastFocusable.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastFocusable) {
                            firstFocusable.focus();
                            e.preventDefault();
                        }
                    }
                }
            }
        });
    }
});
