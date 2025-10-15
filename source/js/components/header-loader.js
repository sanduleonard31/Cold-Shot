class MyHeader extends HTMLElement{
    connectedCallback(){
        // Determine path based on current location
        const currentPath = window.location.pathname;
        let headerPath = './source/html/header.html';

        fetch(headerPath)
            .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch header: ${res.status} ${res.statusText}`)
                return res.text()
            })
            .then(html => {
                this.innerHTML = html;
                // Initialize header functionality after content is loaded
                this.initializeHeader();
            })
            .catch(err => {
                console.error('Error loading header:', err)
                // Fallback content so the element isn't empty
                this.innerHTML = '<!-- header failed to load -->'
            })
    }

    initializeHeader() {
        // Mobile Menu Toggle
        const menuToggle = this.querySelector('.header__menu-toggle');
        const navigation = this.querySelector('.header__navigation');
        
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
        const navLinks = this.querySelectorAll('.header__nav-link');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });

        // Add scroll effect to header
        let lastScrollTop = 0;
        const header = this.querySelector('.header-container');
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 10) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            lastScrollTop = scrollTop;
        });
    }
}

customElements.define('loaded-header', MyHeader)