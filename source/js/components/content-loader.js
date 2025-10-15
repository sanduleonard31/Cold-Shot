/**
 * Dynamic Content Loader
 * Automatically loads and renders sections based on folder structure and JSON data
 */

class ContentLoader {
    constructor(monthFolder = null) {
        // If no month provided, check URL parameter or use current month
        if (!monthFolder) {
            const urlParams = new URLSearchParams(window.location.search);
            monthFolder = urlParams.get('month') || this.getCurrentMonth();
        }
        
        this.monthFolder = monthFolder;
        this.basePath = `./media/${monthFolder}`;
        this.links = {};
        this.sections = [];
        this.contentContainer = document.getElementById('content-container');
    }

    getCurrentMonth() {
        const date = new Date();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}.${year}`;
    }

    async init() {
        try {
            // Remove loading spinner
            const loadingSpinner = this.contentContainer?.querySelector('.loading-spinner');
            
            // Load links
            await this.loadLinks();
            
            // Load sections configuration
            await this.loadSections();
            
            // Clear container and remove spinner
            if (this.contentContainer) {
                this.contentContainer.innerHTML = '';
            }
            
            // Render all sections
            await this.renderAllSections();
            
            console.log('Content loaded successfully!');
        } catch (error) {
            console.error('Error initializing content loader:', error);
            if (this.contentContainer) {
                this.contentContainer.innerHTML = `
                    <div class="error-message">
                        <h3>Error Loading Content</h3>
                        <p>Unable to load content. Please check the console for details.</p>
                    </div>
                `;
            }
        }
    }

    async loadLinks() {
        try {
            const response = await fetch('./assets/links.json');
            this.links = await response.json();
        } catch (error) {
            console.error('Error loading links:', error);
            this.links = {};
        }
    }

    async loadSections() {
        try {
            const response = await fetch(`${this.basePath}/sections.json`);
            const data = await response.json();
            this.sections = data.sections;
        } catch (error) {
            console.error('Error loading sections:', error);
            this.sections = [];
        }
    }

    async renderAllSections() {
        if (!this.contentContainer) {
            console.error('Content container not found');
            return;
        }

        // Group sections by row
        const sectionsByRow = this.groupByRow();

        // Render each row
        for (const [row, sections] of Object.entries(sectionsByRow)) {
            const rowContainer = this.createRowContainer(row);
            
            for (const section of sections) {
                try {
                    const sectionElement = await this.renderSection(section);
                    if (sectionElement) {
                        rowContainer.appendChild(sectionElement);
                    }
                } catch (error) {
                    console.error(`Error rendering section ${section.id}:`, error);
                }
            }
            
            this.contentContainer.appendChild(rowContainer);
        }
    }

    groupByRow() {
        const grouped = {};
        this.sections.forEach(section => {
            if (!grouped[section.row]) {
                grouped[section.row] = [];
            }
            grouped[section.row].push(section);
        });
        return grouped;
    }

    createRowContainer(rowNumber) {
        const container = document.createElement('div');
        container.className = 'content-row';
        container.dataset.row = rowNumber;
        return container;
    }

    async renderSection(section) {
        const sectionPath = `${this.basePath}/${section.folder}`;
        
        // Detect available media in the folder
        const media = await this.detectMedia(sectionPath, section.id);
        
        // Handle different layout types
        switch (section.layout) {
            case 'dropdown':
                return await this.renderProjectsDropdown(section, sectionPath);
            case 'dynamic':
                return await this.renderFeaturedSection(section, sectionPath);
            case 'row':
                return await this.renderRowLayout(section, sectionPath, media);
            case 'column':
            default:
                return await this.renderColumnLayout(section, sectionPath, media);
        }
    }

    async detectMedia(path, sectionId) {
        const media = {
            json: [],
            images: [],
            pdfs: []
        };

        // Define expected files based on section
        const fileMap = {
            'champion': {
                json: ['champion.json'],
                images: ['champion.png'],
                pdfs: []
            },
            'editor': {
                json: ['editor.json'],
                images: ['editor.png'],
                pdfs: []
            },
            'matcha-zone': {
                json: ['text.json'],
                images: ['picture.png'],
                pdfs: ['project.pdf']
            },
            'knowledge-bites': {
                json: ['knowledge-bites.json'],
                images: [],
                pdfs: []
            },
            'spread-kindness': {
                json: ['spread-kindness.json'],
                images: [],
                pdfs: []
            },
            'master-speaks': {
                json: ['text.json'],
                images: ['master.png'],
                pdfs: []
            },
            'changing-timezones': {
                json: ['text.json'],
                images: ['master-1-then.png', 'master-1-now.png', 'master-2-then.png', 'master-2-now.png'],
                pdfs: []
            },
            'projects': {
                json: ['text.json'],
                images: ['picture.png'],
                pdfs: ['project.pdf']
            },
            'featured': {
                json: ['text.json'],
                images: ['picture.png'],
                pdfs: ['project.pdf']
            }
        };

        // Get expected files for this section, or use defaults
        const expectedFiles = fileMap[sectionId] || {
            json: ['text.json', 'content.json', 'data.json'],
            images: ['picture.png', 'image.png'],
            pdfs: ['project.pdf', 'document.pdf']
        };

        // Try to load each expected file
        const tryFiles = async (files, type) => {
            for (const file of files) {
                try {
                    const response = await fetch(`${path}/${file}`);
                    if (response.ok) {
                        media[type].push(file);
                    }
                } catch (error) {
                    // File doesn't exist, continue
                }
            }
        };

        await tryFiles(expectedFiles.json, 'json');
        await tryFiles(expectedFiles.images, 'images');
        await tryFiles(expectedFiles.pdfs, 'pdfs');

        return media;
    }

    async renderColumnLayout(section, path, media) {
        const container = document.createElement('div');
        container.className = `card-column section-${section.id}`;

        // Load JSON data
        let data = null;
        if (media.json.length > 0) {
            data = await this.loadJSON(`${path}/${media.json[0]}`);
        }

        // Create card
        const card = this.createCard(section, data, media, path);
        container.appendChild(card);

        return container;
    }

    async renderRowLayout(section, path, media) {
        const container = document.createElement('div');
        container.className = `card-row section-${section.id}`;

        // Load JSON data
        let data = null;
        if (media.json.length > 0) {
            data = await this.loadJSON(`${path}/${media.json[0]}`);
        }

        // Special handling for "changing-timezones" with multiple masters
        if (section.id === 'changing-timezones' && data) {
            const masters = this.extractMasters(data);
            
            // Create wrapper for timezone cards (matching archive style)
            const timezonesWrapper = document.createElement('div');
            timezonesWrapper.className = 'timezone-cards';
            
            masters.forEach(master => {
                const card = this.createMasterCard(section, master, path);
                timezonesWrapper.appendChild(card);
            });
            
            container.appendChild(timezonesWrapper);
        } else {
            const card = this.createCard(section, data, media, path);
            container.appendChild(card);
        }

        return container;
    }

    extractMasters(data) {
        const masters = [];
        let index = 1;
        
        while (data[`master-${index}`]) {
            masters.push({
                name: data[`master-${index}`],
                then: data[`master-${index}-then`],
                thenDesc: data[`master-${index}-then-desc`],
                nowDesc: data[`master-${index}-now-desc`],
                thenImage: `master-${index}-then.png`,
                nowImage: `master-${index}-now.png`
            });
            index++;
        }
        
        return masters;
    }

    createMasterCard(section, master, path) {
        const card = document.createElement('article');
        card.className = `card card--${section.theme} card--timezone`;

        card.innerHTML = `
            <div class="card__header">
                <h3 class="card__title">${section.title}: ${master.name}</h3>
            </div>
            <div class="card__content">
                <div class="card__timeline">
                    <div class="card__timeline-item">
                        <img src="${path}/${master.thenImage}" alt="${master.name} - ${master.then}" class="card__image">
                        <h4 class="card__timeline-label">${master.then}</h4>
                        <p class="card__text">${master.thenDesc}</p>
                    </div>
                    <div class="card__timeline-item">
                        <img src="${path}/${master.nowImage}" alt="${master.name} - Now" class="card__image">
                        <h4 class="card__timeline-label">Now</h4>
                        <p class="card__text">${master.nowDesc}</p>
                    </div>
                </div>
            </div>
        `;

        return card;
    }

    createCard(section, data, media, path) {
        const card = document.createElement('article');
        card.className = `card card--${section.theme} card--layout-${section.layout || 'column'}`;

        let content = '';

        // Handle different section types
        if (section.id === 'champion' && data) {
            content = `
                <div class="card__header">
                    <h3 class="card__title">${data.title || section.title}</h3>
                    <p class="card__subtitle">${data.name || ''}</p>
                </div>
                <div class="card__content card__content--profile">
                    ${media.images.length > 0 ? `<img src="${path}/${media.images[0]}" alt="${data.title}" class="card__image card__image--profile">` : ''}
                    <blockquote class="card__quote card__quote--profile">
                        <p>${data.message || ''}</p>
                    </blockquote>
                    ${this.links['champion-instagram'] ? `<a href="${this.links['champion-instagram']}" class="card__link" target="_blank" rel="noopener noreferrer">Follow on Instagram</a>` : ''}
                </div>
            `;
        } else if (section.id === 'editor' && data) {
            content = `
                <div class="card__header">
                    <h3 class="card__title">${data.title || section.title}</h3>
                    <p class="card__subtitle">${data.name || ''}</p>
                </div>
                <div class="card__content card__content--profile">
                    ${media.images.length > 0 ? `<img src="${path}/${media.images[0]}" alt="${data.title}" class="card__image card__image--profile">` : ''}
                    <blockquote class="card__quote card__quote--profile">
                        <p>${data.message || ''}</p>
                    </blockquote>
                    ${this.links['editor-instagram'] ? `<a href="${this.links['editor-instagram']}" class="card__link" target="_blank" rel="noopener noreferrer">Connect with Editor</a>` : ''}
                </div>
            `;
        } else if (section.id === 'knowledge-bites' && data) {
            const bites = data.bites || [];
            content = `
                <div class="card__header">
                    <h3 class="card__title">${data.title || section.title}</h3>
                </div>
                <div class="card__content">
                    ${media.images.length > 0 ? `
                    <div class="card__media-text-wrapper">
                        <img src="${path}/${media.images[0]}" alt="${section.title}" class="card__image">
                        <div class="card__text">
                            <ul class="knowledge-bites-list">
                                ${bites.map(bite => `<li>${bite}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    ` : `
                    <ul class="knowledge-bites-list">
                        ${bites.map(bite => `<li>${bite}</li>`).join('')}
                    </ul>
                    `}
                </div>
            `;
        } else if (section.id === 'spread-kindness' && data) {
            content = `
                <div class="card__header">
                    <h3 class="card__title">${data.title || section.title}</h3>
                </div>
                <div class="card__content">
                    ${media.images.length > 0 ? `
                    <div class="card__media-text-wrapper">
                        <img src="${path}/${media.images[0]}" alt="${section.title}" class="card__image">
                        <div class="card__text">
                            <p>${data.content || ''}</p>
                        </div>
                    </div>
                    ` : `
                    <p>${data.content || ''}</p>
                    `}
                </div>
            `;
        } else if (section.id === 'master-speaks' && data) {
            content = `
                <div class="card__header">
                    <h3 class="card__title">${section.title}</h3>
                    <p class="card__subtitle">${data.name || ''}</p>
                </div>
                <div class="card__content card__content--profile">
                    ${media.images.length > 0 ? `<img src="${path}/${media.images[0]}" alt="${data.name}" class="card__image card__image--profile">` : ''}
                    <blockquote class="card__quote card__quote--profile">
                        <p>${data.message || ''}</p>
                    </blockquote>
                    ${this.links['coffee-master-apply'] ? `<a href="${this.links['coffee-master-apply']}" class="card__link" target="_blank" rel="noopener noreferrer">Become a Coffee Master</a>` : ''}
                </div>
            `;
        } else if (section.id === 'matcha-zone' && data) {
            content = `
                <div class="card__header">
                    <h3 class="card__title">${data.title || section.title}</h3>
                </div>
                <div class="card__content">
                    <div class="card__media-text-wrapper">
                        ${media.images.length > 0 ? `<img src="${path}/${media.images[0]}" alt="${section.title}" class="card__image">` : ''}
                        <div class="card__text">
                            ${data.description ? `<p>${data.description}</p>` : ''}
                            ${media.pdfs.length > 0 ? `<a href="${path}/${media.pdfs[0]}" class="card__pdf-link" target="_blank">📄 Read More</a>` : ''}
                            ${this.links['matcha-instagram'] ? `<a href="${this.links['matcha-instagram']}" class="card__link" target="_blank" rel="noopener noreferrer">Follow Matcha Zone</a>` : ''}
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Generic card template
            content = `
                <div class="card__header">
                    <h3 class="card__title">${section.title}</h3>
                </div>
                <div class="card__content">
                    <div class="card__media-text-wrapper">
                        ${media.images.length > 0 ? `<img src="${path}/${media.images[0]}" alt="${section.title}" class="card__image">` : ''}
                        <div class="card__text">
                            <p>${section.description}</p>
                            ${media.pdfs.length > 0 ? `<a href="${path}/${media.pdfs[0]}" class="card__pdf-link" target="_blank">📄 View Document</a>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }

        card.innerHTML = content;
        return card;
    }

    async renderProjectsDropdown(section, path) {
        const container = document.createElement('div');
        container.className = 'projects-container';

        // Create dropdown header
        const dropdown = document.createElement('div');
        dropdown.className = 'project-dropdown';

        const header = document.createElement('div');
        header.className = 'project-dropdown__header open'; // Add 'open' class by default
        header.innerHTML = `
            <h3 class="project-dropdown__title">${section.title}</h3>
            <span class="project-dropdown__icon">▼</span>
        `;

        const list = document.createElement('div');
        list.className = 'project-dropdown__list open'; // Add 'open' class by default

        // Load projects
        const projects = await this.loadProjects(path);
        
        projects.forEach((project, index) => {
            const item = document.createElement('div');
            item.className = 'project-item';
            item.dataset.projectId = project.id;
            item.innerHTML = `
                <span class="project-item__icon">📁</span>
                <span class="project-item__name">${project.name}</span>
            `;
            
            item.addEventListener('click', () => {
                // Remove active class from all items
                list.querySelectorAll('.project-item').forEach(i => i.classList.remove('active'));
                // Add active class to clicked item
                item.classList.add('active');
                // Show project
                this.showProject(project, section.theme);
            });
            
            list.appendChild(item);
        });

        // Toggle functionality
        header.addEventListener('click', () => {
            header.classList.toggle('open');
            list.classList.toggle('open');
        });

        dropdown.appendChild(header);
        dropdown.appendChild(list);
        container.appendChild(dropdown);

        // Container for selected project cards
        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'project-cards-container';
        cardsContainer.id = 'project-cards';
        container.appendChild(cardsContainer);

        return container;
    }

    async loadProjects(path) {
        const projects = [];
        
        // Try to load up to 20 projects
        for (let i = 1; i <= 20; i++) {
            try {
                const projectPath = `${path}/project-${i}`;
                const response = await fetch(`${projectPath}/text.json`);
                
                if (response.ok) {
                    const data = await response.json();
                    projects.push({
                        id: `project-${i}`,
                        name: data.title || `Project ${i}`,
                        data: data,
                        path: projectPath
                    });
                }
            } catch (error) {
                // No more projects
                break;
            }
        }
        
        return projects;
    }

    async showProject(project, theme) {
        const container = document.getElementById('project-cards');
        if (!container) return;

        // Clear existing cards
        container.innerHTML = '';

        // Detect media - pass 'projects' as sectionId for generic detection
        const media = await this.detectMedia(project.path, 'projects');

        // Create project card
        const card = document.createElement('article');
        card.className = `card card--${theme}`;
        card.innerHTML = `
            <div class="card__header">
                <h3 class="card__title">${project.data.title || project.name}</h3>
            </div>
            <div class="card__content">
                <div class="card__media-text-wrapper">
                    ${media.images.length > 0 ? `<img src="${project.path}/${media.images[0]}" alt="${project.name}" class="card__image">` : ''}
                    <div class="card__text">
                        ${project.data.description ? `<p>${project.data.description}</p>` : ''}
                        ${media.pdfs.length > 0 ? `<a href="${project.path}/${media.pdfs[0]}" class="card__pdf-link" target="_blank">📄 View Project PDF</a>` : ''}
                    </div>
                </div>
            </div>
        `;

        container.appendChild(card);

        // Smooth scroll to card
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    async renderFeaturedSection(section, path) {
        const container = document.createElement('div');
        container.className = `card-row section-${section.id}`;

        // Load all folders in featured
        const featuredItems = await this.loadFeaturedItems(path);

        for (const item of featuredItems) {
            const card = document.createElement('article');
            card.className = `card card--${section.theme}`;
            
            card.innerHTML = `
                <div class="card__header">
                    <h3 class="card__title">${item.data.title || item.name}</h3>
                </div>
                <div class="card__content">
                    <div class="card__media-text-wrapper">
                        ${item.media.images.length > 0 ? `<img src="${item.path}/${item.media.images[0]}" alt="${item.name}" class="card__image">` : ''}
                        <div class="card__text">
                            ${item.data.description ? `<p>${item.data.description}</p>` : ''}
                            ${item.media.pdfs.length > 0 ? `<a href="${item.path}/${item.media.pdfs[0]}" class="card__pdf-link" target="_blank">📄 Learn More</a>` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(card);
        }

        return container;
    }

    async loadFeaturedItems(path) {
        const items = [];
        const commonFolders = ['launch', 'announcement', 'event', 'special', 'news'];

        for (const folder of commonFolders) {
            try {
                const itemPath = `${path}/${folder}`;
                const response = await fetch(`${itemPath}/text.json`);
                
                if (response.ok) {
                    const data = await response.json();
                    const media = await this.detectMedia(itemPath, 'featured');
                    
                    items.push({
                        name: folder,
                        data: data,
                        media: media,
                        path: itemPath
                    });
                }
            } catch (error) {
                // Folder doesn't exist, continue
            }
        }

        return items;
    }

    async loadJSON(path) {
        try {
            const response = await fetch(path);
            return await response.json();
        } catch (error) {
            console.error(`Error loading JSON from ${path}:`, error);
            return null;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize month switcher first
    const monthSwitcher = new MonthSwitcher();
    await monthSwitcher.init();
    
    // Then load content for selected month
    const loader = new ContentLoader(monthSwitcher.getCurrentMonth());
    loader.init();
});
