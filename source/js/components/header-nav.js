/**
 * Header Navigation Enhancement
 * Handles mobile menu toggle and active page state
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.header__menu-toggle');
    const navigation = document.querySelector('.header__navigation');
    
    if (menuToggle && navigation) {
        menuToggle.addEventListener('click', function() {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            navigation.classList.toggle('open');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideMenu = navigation.contains(event.target);
            const isClickOnToggle = menuToggle.contains(event.target);
            
            if (!isClickInsideMenu && !isClickOnToggle && navigation.classList.contains('open')) {
                menuToggle.setAttribute('aria-expanded', 'false');
                navigation.classList.remove('open');
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navigation.classList.contains('open')) {
                menuToggle.setAttribute('aria-expanded', 'false');
                navigation.classList.remove('open');
                menuToggle.focus();
            }
        });
    }

    // Set active page state
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.header__nav-link');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

    // Add scroll effect to header
    let lastScrollTop = 0;
    const header = document.querySelector('.header-container');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 10) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
});
