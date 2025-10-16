/**
 * Lazy Loading Utility
 * Implements lazy loading for images and content sections
 * Uses Intersection Observer API for optimal performance
 */

class LazyLoader {
    constructor(options = {}) {
        this.options = {
            rootMargin: options.rootMargin || '200px',
            threshold: options.threshold || 0.01,
            imageClass: options.imageClass || 'lazy-image',
            sectionClass: options.sectionClass || 'lazy-section',
            loadingClass: options.loadingClass || 'lazy-loading',
            loadedClass: options.loadedClass || 'lazy-loaded',
            errorClass: options.errorClass || 'lazy-error',
            placeholderColor: options.placeholderColor || '#f0f0f0',
            lowQualityDelay: options.lowQualityDelay || 100,
            highQualityDelay: options.highQualityDelay || 300,
            imageQuality: options.imageQuality || 0.7,
            enableProgressiveLoading: options.enableProgressiveLoading !== false
        };

        this.imageObserver = null;
        this.sectionObserver = null;
        this.loadedImages = new Set();
        this.loadedSections = new Set();
        this.loadingQueue = [];
        this.isProcessingQueue = false;
        this.scrollTimeout = null;
        this.isScrolling = false;
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

        this.setupScrollListener();
        this.setupImageObserver();
        this.setupSectionObserver();
        this.observeExistingElements();
    }

    /**
     * Setup scroll listener to pause loading during rapid scrolling
     */
    setupScrollListener() {
        window.addEventListener('scroll', () => {
            this.isScrolling = true;
            clearTimeout(this.scrollTimeout);
            
            this.scrollTimeout = setTimeout(() => {
                this.isScrolling = false;
                this.processQueue();
            }, 150);
        }, { passive: true });
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

        // Set loading spinner as initial src if not already set
        if (!img.src || img.src === '' || img.src === window.location.href) {
            img.src = LazyLoader.createLoadingSpinner(50, '#4a90e2');
            img.style.padding = '20px';
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

        // Add to queue if scrolling rapidly
        if (this.isScrolling) {
            this.loadingQueue.push(img);
            return;
        }

        const src = img.dataset.src || img.getAttribute('data-src');
        const srcset = img.dataset.srcset || img.getAttribute('data-srcset');
        const lowQualitySrc = img.dataset.lowQualitySrc || img.getAttribute('data-low-quality-src');

        if (!src && !srcset) {
            console.warn('No data-src or data-srcset found for lazy image:', img);
            return;
        }

        // Progressive loading: low quality first, then high quality
        if (this.options.enableProgressiveLoading && lowQualitySrc) {
            this.loadProgressiveImage(img, lowQualitySrc, src, srcset);
        } else {
            this.loadStandardImage(img, src, srcset);
        }
    }

    /**
     * Load image progressively (low quality first, then high quality)
     */
    loadProgressiveImage(img, lowQualitySrc, highQualitySrc, srcset) {
        // First load low quality version
        const lowQualityImg = new Image();
        
        lowQualityImg.onload = () => {
            // Apply low quality image immediately
            img.src = lowQualitySrc;
            img.classList.add('lazy-low-quality');
            
            // Then load high quality after a delay
            setTimeout(() => {
                this.loadHighQualityImage(img, highQualitySrc, srcset);
            }, this.options.highQualityDelay);
        };

        lowQualityImg.onerror = () => {
            // If low quality fails, try loading high quality directly
            this.loadStandardImage(img, highQualitySrc, srcset);
        };

        lowQualityImg.src = lowQualitySrc;
    }

    /**
     * Load high quality version of image
     */
    loadHighQualityImage(img, src, srcset) {
        const highQualityImg = new Image();

        highQualityImg.onload = () => {
            this.applyImage(img, src, srcset);
            this.loadedImages.add(img);
            img.classList.remove(this.options.loadingClass);
            img.classList.remove('lazy-low-quality');
            img.classList.add(this.options.loadedClass);
            
            // Unobserve after loading
            if (this.imageObserver) {
                this.imageObserver.unobserve(img);
            }
        };

        highQualityImg.onerror = () => {
            console.error('Error loading high quality image:', src);
            img.classList.remove(this.options.loadingClass);
            img.classList.remove('lazy-low-quality');
            img.classList.add(this.options.errorClass);
            
            if (this.imageObserver) {
                this.imageObserver.unobserve(img);
            }
        };

        if (srcset) highQualityImg.srcset = srcset;
        if (src) highQualityImg.src = src;
    }

    /**
     * Load image in standard way (single quality)
     */
    loadStandardImage(img, src, srcset) {
        const tempImg = new Image();

        tempImg.onload = () => {
            // Add small delay to prevent all images loading at once
            setTimeout(() => {
                this.applyImage(img, src, srcset);
                this.loadedImages.add(img);
                img.classList.remove(this.options.loadingClass);
                img.classList.add(this.options.loadedClass);
                
                if (this.imageObserver) {
                    this.imageObserver.unobserve(img);
                }
            }, this.options.lowQualityDelay);
        };

        tempImg.onerror = () => {
            console.error('Error loading image:', src);
            img.classList.remove(this.options.loadingClass);
            img.classList.add(this.options.errorClass);
            
            if (this.imageObserver) {
                this.imageObserver.unobserve(img);
            }
        };

        if (srcset) tempImg.srcset = srcset;
        if (src) tempImg.src = src;
    }

    /**
     * Process queued images after scrolling stops
     */
    processQueue() {
        if (this.isProcessingQueue || this.loadingQueue.length === 0) return;
        
        this.isProcessingQueue = true;
        const batch = this.loadingQueue.splice(0, 3); // Process 3 images at a time
        
        batch.forEach((img, index) => {
            setTimeout(() => {
                this.loadImage(img);
            }, index * 100); // Stagger the loading
        });
        
        setTimeout(() => {
            this.isProcessingQueue = false;
            if (this.loadingQueue.length > 0) {
                this.processQueue();
            }
        }, 300);
    }

    /**
     * Apply the loaded image to the element
     */
    applyImage(img, src, srcset) {
        // Use requestAnimationFrame for smoother transitions
        requestAnimationFrame(() => {
            if (srcset) {
                img.srcset = srcset;
            }
            if (src) {
                img.src = src;
            }
            
            // Remove padding used for spinner
            img.style.padding = '';
            
            // Remove placeholder background with fade effect
            img.style.transition = 'background-color 0.5s ease, opacity 0.5s ease';
            setTimeout(() => {
                img.style.backgroundColor = 'transparent';
            }, 50);
        });
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
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        this.loadedImages.clear();
        this.loadedSections.clear();
        this.loadingQueue = [];
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
     * Create a loading spinner SVG
     */
    static createLoadingSpinner(size = 50, color = '#4a90e2') {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
                <circle cx="50" cy="50" r="45" fill="none" stroke="${color}" stroke-width="8" opacity="0.2"/>
                <circle cx="50" cy="50" r="45" fill="none" stroke="${color}" stroke-width="8" stroke-dasharray="70 200" stroke-linecap="round">
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 50 50"
                        to="360 50 50"
                        dur="1.5s"
                        repeatCount="indefinite"/>
                </circle>
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
