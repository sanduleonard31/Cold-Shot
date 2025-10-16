/**
 * Lazy Loading Utility
 * Implements lazy loading for images and content sections
 * Uses Intersection Observer API for optimal performance
 */

class LazyLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: options.rootMargin || '50px',
            threshold: options.threshold || 0.01,
            imageClass: options.imageClass || 'lazy-image',
            sectionClass: options.sectionClass || 'lazy-section',
            loadingClass: options.loadingClass || 'lazy-loading',
            loadedClass: options.loadedClass || 'lazy-loaded',
            errorClass: options.errorClass || 'lazy-error',
            placeholderColor: options.placeholderColor || '#f0f0f0'
        };

        this.imageObserver = null;
        this.sectionObserver = null;
        this.loadedImages = new Set();
        this.loadedSections = new Set();
    }

    /**
     * Initialize lazy loading for images and sections
     */
    init() {
        // Check for Intersection Observer support
        if (!('IntersectionObserver' in window)) {
            console.warn('Intersection Observer not supported. Loading all content immediately.');
            this.loadAllContent();
            return;
        }

        this.setupImageObserver();
        this.setupSectionObserver();
        this.observeExistingElements();
    }

    /**
     * Setup observer for lazy loading images
     */
    setupImageObserver() {
        this.imageObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                    }
                });
            },
            {
                rootMargin: this.options.rootMargin,
                threshold: this.options.threshold
            }
        );
    }

    /**
     * Setup observer for lazy loading content sections
     */
    setupSectionObserver() {
        this.sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadSection(entry.target);
                    }
                });
            },
            {
                rootMargin: this.options.rootMargin,
                threshold: this.options.threshold
            }
        );
    }

    /**
     * Observe existing lazy elements in the DOM
     */
    observeExistingElements() {
        // Observe images
        const images = document.querySelectorAll(`.${this.options.imageClass}`);
        images.forEach(img => this.observeImage(img));

        // Observe sections
        const sections = document.querySelectorAll(`.${this.options.sectionClass}`);
        sections.forEach(section => this.observeSection(section));
    }

    /**
     * Observe a single image element
     */
    observeImage(img) {
        if (!img || this.loadedImages.has(img)) return;

        // Add placeholder background if not already set
        if (!img.style.backgroundColor && !img.classList.contains(this.options.loadedClass)) {
            img.style.backgroundColor = this.options.placeholderColor;
        }

        // Add loading class
        img.classList.add(this.options.loadingClass);

        this.imageObserver.observe(img);
    }

    /**
     * Observe a single section element
     */
    observeSection(section) {
        if (!section || this.loadedSections.has(section)) return;

        // Add loading class
        section.classList.add(this.options.loadingClass);

        this.sectionObserver.observe(section);
    }

    /**
     * Load an image
     */
    loadImage(img) {
        if (this.loadedImages.has(img)) return;

        const src = img.dataset.src || img.getAttribute('data-src');
        const srcset = img.dataset.srcset || img.getAttribute('data-srcset');

        if (!src && !srcset) {
            console.warn('No data-src or data-srcset found for lazy image:', img);
            return;
        }

        // Create a new image to preload
        const tempImg = new Image();

        tempImg.onload = () => {
            this.applyImage(img, src, srcset);
            this.loadedImages.add(img);
            img.classList.remove(this.options.loadingClass);
            img.classList.add(this.options.loadedClass);
            
            // Unobserve after loading
            this.imageObserver.unobserve(img);
        };

        tempImg.onerror = () => {
            console.error('Error loading image:', src);
            img.classList.remove(this.options.loadingClass);
            img.classList.add(this.options.errorClass);
            
            // Unobserve even on error
            this.imageObserver.unobserve(img);
        };

        // Start loading
        if (srcset) tempImg.srcset = srcset;
        if (src) tempImg.src = src;
    }

    /**
     * Apply the loaded image to the element
     */
    applyImage(img, src, srcset) {
        if (srcset) {
            img.srcset = srcset;
        }
        if (src) {
            img.src = src;
        }
        
        // Remove placeholder background with fade effect
        img.style.transition = 'background-color 0.3s ease';
        setTimeout(() => {
            img.style.backgroundColor = 'transparent';
        }, 50);
    }

    /**
     * Load a content section
     */
    async loadSection(section) {
        if (this.loadedSections.has(section)) return;

        const loader = section.dataset.loader;
        
        if (!loader) {
            // No specific loader, just mark as loaded
            section.classList.remove(this.options.loadingClass);
            section.classList.add(this.options.loadedClass);
            this.loadedSections.add(section);
            this.sectionObserver.unobserve(section);
            return;
        }

        try {
            // Call the loader function if it exists
            if (typeof window[loader] === 'function') {
                await window[loader](section);
            }

            section.classList.remove(this.options.loadingClass);
            section.classList.add(this.options.loadedClass);
            this.loadedSections.add(section);
            
            // After loading section, observe any new lazy images within it
            const newImages = section.querySelectorAll(`.${this.options.imageClass}`);
            newImages.forEach(img => this.observeImage(img));
            
            this.sectionObserver.unobserve(section);
        } catch (error) {
            console.error('Error loading section:', error);
            section.classList.remove(this.options.loadingClass);
            section.classList.add(this.options.errorClass);
            this.sectionObserver.unobserve(section);
        }
    }

    /**
     * Manually trigger loading of a specific element
     */
    forceLoad(element) {
        if (element.classList.contains(this.options.imageClass)) {
            this.loadImage(element);
        } else if (element.classList.contains(this.options.sectionClass)) {
            this.loadSection(element);
        }
    }

    /**
     * Load all content immediately (fallback for unsupported browsers)
     */
    loadAllContent() {
        const images = document.querySelectorAll(`.${this.options.imageClass}`);
        images.forEach(img => {
            const src = img.dataset.src || img.getAttribute('data-src');
            const srcset = img.dataset.srcset || img.getAttribute('data-srcset');
            if (src) img.src = src;
            if (srcset) img.srcset = srcset;
            img.classList.add(this.options.loadedClass);
        });

        const sections = document.querySelectorAll(`.${this.options.sectionClass}`);
        sections.forEach(section => {
            section.classList.add(this.options.loadedClass);
        });
    }

    /**
     * Refresh and observe new elements added to the DOM
     */
    refresh() {
        this.observeExistingElements();
    }

    /**
     * Cleanup and disconnect observers
     */
    destroy() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        if (this.sectionObserver) {
            this.sectionObserver.disconnect();
        }
        this.loadedImages.clear();
        this.loadedSections.clear();
    }

    /**
     * Create a placeholder for an image with optional blur-up effect
     */
    static createImagePlaceholder(width, height, color = '#f0f0f0') {
        // Create a small SVG placeholder
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
                <rect width="${width}" height="${height}" fill="${color}"/>
            </svg>
        `;
        return `data:image/svg+xml;base64,${btoa(svg)}`;
    }

    /**
     * Prepare an image element for lazy loading
     */
    static prepareImage(img, src, options = {}) {
        const {
            placeholder = true,
            width = 400,
            height = 300,
            alt = ''
        } = options;

        // Store actual source in data attribute
        img.dataset.src = src;
        
        // Add lazy loading class
        img.classList.add('lazy-image');
        
        // Add alt text
        if (alt) img.alt = alt;
        
        // Set placeholder if enabled
        if (placeholder) {
            img.src = LazyLoader.createImagePlaceholder(width, height);
        }

        return img;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoader;
}
