/**
 * Archive Content Loader
 * Loads and displays archived content with filtering by month and section
 */

class ArchiveLoader {
    constructor() {
        this.basePath = './media';
        this.availableMonths = [];
        this.selectedMonth = 'all';
        this.selectedSection = 'all';
        this.allContent = [];
        this.links = {};
        this.lazyLoader = null;
        
        this.monthSelector = document.getElementById('month-selector');
        this.sectionSelector = document.getElementById('section-selector');
        this.archiveContainer = document.getElementById('archive-container');
    }

    async init() {
        try {
            // Initialize lazy loader
            if (typeof LazyLoader !== 'undefined') {
                this.lazyLoader = new LazyLoader({
                    rootMargin: '100px',
                    threshold: 0.01
                });
                this.lazyLoader.init();
            }
            
            // Load links
            await this.loadLinks();
            
            // Discover available months
            await this.discoverMonths();
            
            // Populate month selector
            this.populateMonthSelector();
            
            // Load all content
            await this.loadAllContent();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initial render
            this.renderArchive();
            
            // Refresh lazy loader for new elements
            if (this.lazyLoader) {
                this.lazyLoader.refresh();
            }
            
            console.log('Archive loaded successfully!');
        } catch (error) {
            console.error('Error initializing archive:', error);
            if (this.archiveContainer) {
                this.archiveContainer.innerHTML = `
                    <div class="error-message">
                        <h3>Error Loading Archive</h3>
                        <p>Unable to load archive content. Please check the console for details.</p>
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

    async discoverMonths() {
        // Try common month patterns
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const months = [];

        // Check last 24 months
        for (let i = 0; i < 24; i++) {
            const date = new Date(currentYear, currentDate.getMonth() - i, 1);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const monthFolder = `${month}.${year}`;

            try {
                const response = await fetch(`${this.basePath}/${monthFolder}/sections.json`);
                if (response.ok) {
                    months.push(monthFolder);
                }
            } catch (error) {
                // Month doesn't exist, continue
            }
        }

        this.availableMonths = months.sort((a, b) => {
            const [aMonth, aYear] = a.split('.').map(Number);
            const [bMonth, bYear] = b.split('.').map(Number);
            return bYear - aYear || bMonth - aMonth;
        });
    }

    populateMonthSelector() {
        if (!this.monthSelector) return;

        // Clear existing options
        this.monthSelector.innerHTML = '<option value="all">All Months</option>';

        // Add month options
        this.availableMonths.forEach(month => {
            const [monthNum, year] = month.split('.');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthName = monthNames[parseInt(monthNum) - 1];
            
            const option = document.createElement('option');
            option.value = month;
            option.textContent = `${monthName} ${year}`;
            this.monthSelector.appendChild(option);
        });
    }

    async loadAllContent() {
        this.allContent = [];

        for (const month of this.availableMonths) {
            try {
                const sectionsResponse = await fetch(`${this.basePath}/${month}/sections.json`);
                const sectionsData = await sectionsResponse.json();

                for (const section of sectionsData.sections) {
                    const sectionPath = `${this.basePath}/${month}/${section.folder}`;
                    
                    // Load section data
                    const sectionContent = await this.loadSectionContent(section, sectionPath, month);
                    
                    if (sectionContent) {
                        this.allContent.push({
                            month: month,
                            section: section,
                            content: sectionContent,
                            path: sectionPath
                        });
                    }
                }

                // Populate section selector from first month
                if (month === this.availableMonths[0]) {
                    this.populateSectionSelector(sectionsData.sections);
                }
            } catch (error) {
                console.error(`Error loading content for ${month}:`, error);
            }
        }
    }

    populateSectionSelector(sections) {
        if (!this.sectionSelector) return;

        // Clear existing options
        this.sectionSelector.innerHTML = '<option value="all">All Sections</option>';

        // Get unique section types
        const uniqueSections = [...new Set(sections.map(s => s.id))];

        uniqueSections.forEach(sectionId => {
            const section = sections.find(s => s.id === sectionId);
            const option = document.createElement('option');
            option.value = sectionId;
            option.textContent = section.title;
            this.sectionSelector.appendChild(option);
        });
    }

    async loadSectionContent(section, path, month) {
        try {
            // Special handling for projects section - load all sub-projects
            if (section.id === 'projects') {
                return await this.loadProjectsContent(path);
            }
            
            // Special handling for featured section - load all sub-items
            if (section.id === 'featured') {
                return await this.loadFeaturedContent(path);
            }
            
            // Detect available media
            const media = await this.detectMedia(path, section.id);
            
            if (media.json.length === 0) return null;

            // Load JSON data
            const response = await fetch(`${path}/${media.json[0]}`);
            const data = await response.json();

            return {
                data: data,
                media: media
            };
        } catch (error) {
            console.error(`Error loading section content from ${path}:`, error);
            return null;
        }
    }

    async loadProjectsContent(path) {
        const projects = [];
        
        // Try to load up to 20 projects
        for (let i = 1; i <= 20; i++) {
            try {
                const projectPath = `${path}/project-${i}`;
                const response = await fetch(`${projectPath}/text.json`);
                
                if (response.ok) {
                    const data = await response.json();
                    const media = await this.detectMedia(projectPath, 'projects');
                    
                    projects.push({
                        id: `project-${i}`,
                        data: data,
                        media: media,
                        path: projectPath
                    });
                } else {
                    // No more projects
                    break;
                }
            } catch (error) {
                // No more projects
                break;
            }
        }
        
        // Return null if no projects found
        if (projects.length === 0) return null;
        
        return { projects: projects };
    }

    async loadFeaturedContent(path) {
        const items = [];
        
        // Try to load a featured-items.json manifest file first
        try {
            const manifestResponse = await fetch(`${path}/featured-items.json`);
            if (manifestResponse.ok) {
                const manifest = await manifestResponse.json();
                const folders = manifest.folders || manifest.items || [];
                
                for (const folder of folders) {
                    try {
                        const itemPath = `${path}/${folder}`;
                        const response = await fetch(`${itemPath}/text.json`);
                        
                        if (response.ok) {
                            const data = await response.json();
                            const media = await this.detectMedia(itemPath, 'featured');
                            
                            items.push({
                                id: folder,
                                data: data,
                                media: media,
                                path: itemPath
                            });
                        }
                    } catch (error) {
                        console.warn(`Could not load featured item: ${folder}`, error);
                    }
                }
                
                // Return items if manifest was found and processed
                if (items.length === 0) return null;
                return { items: items };
            }
        } catch (error) {
            // No manifest file, fall back to discovery approach
            console.log('No featured-items.json manifest found in archive, trying common folder names...');
        }

        // Fallback: Try common folder names and any numbered folders
        const commonFolders = ['launch', 'announcement', 'event', 'special', 'news', 'update', 'feature', 'story', 'spotlight'];
        
        // Also try numbered folders (featured-1, featured-2, etc.)
        for (let i = 1; i <= 20; i++) {
            commonFolders.push(`featured-${i}`);
            commonFolders.push(`item-${i}`);
            commonFolders.push(`${i}`);
        }

        for (const folder of commonFolders) {
            try {
                const itemPath = `${path}/${folder}`;
                const response = await fetch(`${itemPath}/text.json`);
                
                if (response.ok) {
                    const data = await response.json();
                    const media = await this.detectMedia(itemPath, 'featured');
                    
                    items.push({
                        id: folder,
                        data: data,
                        media: media,
                        path: itemPath
                    });
                }
            } catch (error) {
                // Folder doesn't exist, continue silently
            }
        }

        // Return null if no items found
        if (items.length === 0) return null;

        return { items: items };
    }

    async detectMedia(path, sectionId) {
        const media = {
            json: [],
            images: [],
            pdfs: []
        };

        const fileMap = {
            'champion': { json: ['champion.json'], images: ['champion.png'], pdfs: [] },
            'editor': { json: ['editor.json'], images: ['editor.png'], pdfs: [] },
            'matcha-zone': { json: ['text.json'], images: ['picture.png'], pdfs: ['project.pdf'] },
            'knowledge-bites': { json: ['knowledge-bites.json'], images: [], pdfs: [] },
            'spread-kindness': { json: ['spread-kindness.json'], images: [], pdfs: [] },
            'master-speaks': { json: ['text.json'], images: ['master.png'], pdfs: [] },
            'changing-timezones': { 
                json: ['text.json'], 
                images: ['master-1-then.png', 'master-1-now.png', 'master-2-then.png', 'master-2-now.png'], 
                pdfs: [] 
            },
            'projects': { json: ['text.json'], images: ['picture.png'], pdfs: ['project.pdf'] },
            'featured': { json: ['text.json'], images: ['picture.png'], pdfs: ['project.pdf'] }
        };

        const expectedFiles = fileMap[sectionId] || {
            json: ['text.json', 'content.json', 'data.json'],
            images: ['picture.png', 'image.png'],
            pdfs: ['project.pdf', 'document.pdf']
        };

        const tryFiles = async (files, type) => {
            for (const file of files) {
                try {
                    const response = await fetch(`${path}/${file}`, { method: 'HEAD' });
                    if (response.ok) {
                        media[type].push(file);
                    }
                } catch (error) {
                    // File doesn't exist
                }
            }
        };

        await tryFiles(expectedFiles.json, 'json');
        await tryFiles(expectedFiles.images, 'images');
        await tryFiles(expectedFiles.pdfs, 'pdfs');

        return media;
    }

    setupEventListeners() {
        if (this.monthSelector) {
            this.monthSelector.addEventListener('change', (e) => {
                this.selectedMonth = e.target.value;
                this.renderArchive();
            });
        }

        if (this.sectionSelector) {
            this.sectionSelector.addEventListener('change', (e) => {
                this.selectedSection = e.target.value;
                this.renderArchive();
            });
        }
    }

    renderArchive() {
        if (!this.archiveContainer) return;

        // Clear container
        this.archiveContainer.innerHTML = '';

        // Filter content
        const filteredContent = this.allContent.filter(item => {
            const monthMatch = this.selectedMonth === 'all' || item.month === this.selectedMonth;
            const sectionMatch = this.selectedSection === 'all' || item.section.id === this.selectedSection;
            return monthMatch && sectionMatch;
        });

        if (filteredContent.length === 0) {
            this.archiveContainer.innerHTML = `
                <div class="archive-empty">
                    <p>No content found for the selected filters.</p>
                </div>
            `;
            return;
        }

        // Group by section for better organization
        const groupedBySectionType = {};
        filteredContent.forEach(item => {
            if (!groupedBySectionType[item.section.id]) {
                groupedBySectionType[item.section.id] = [];
            }
            groupedBySectionType[item.section.id].push(item);
        });

        // Render each group
        Object.entries(groupedBySectionType).forEach(([sectionId, items]) => {
            items.forEach(item => {
                const sectionElement = this.renderSection(item);
                if (sectionElement) {
                    this.archiveContainer.appendChild(sectionElement);
                }
            });
        });
        
        // Refresh lazy loader for new images
        if (this.lazyLoader) {
            this.lazyLoader.refresh();
        }
    }

    renderSection(item) {
        const { month, section, content, path } = item;
        
        // Create section container
        const container = document.createElement('div');
        container.className = `archive-section archive-section--${section.id}`;
        
        // Add month label
        const [monthNum, year] = month.split('.');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthLabel = `${monthNames[parseInt(monthNum) - 1]} ${year}`;
        
        // Render based on section type
        let sectionHTML = '';
        
        switch (section.id) {
            case 'champion':
            case 'editor':
                sectionHTML = this.renderProfileSection(section, content, path, monthLabel);
                break;
            case 'master-speaks':
                sectionHTML = this.renderMasterSpeaksSection(section, content, path, monthLabel);
                break;
            case 'changing-timezones':
                sectionHTML = this.renderChangingTimezonesSection(section, content, path, monthLabel);
                break;
            case 'projects':
                sectionHTML = this.renderProjectsSection(section, content, path, monthLabel);
                break;
            case 'featured':
            case 'matcha-zone':
                sectionHTML = this.renderMediaSection(section, content, path, monthLabel);
                break;
            case 'knowledge-bites':
                sectionHTML = this.renderKnowledgeBitesSection(section, content, path, monthLabel);
                break;
            case 'spread-kindness':
                sectionHTML = this.renderSpreadKindnessSection(section, content, path, monthLabel);
                break;
            default:
                sectionHTML = this.renderGenericSection(section, content, path, monthLabel);
        }
        
        container.innerHTML = sectionHTML;
        return container;
    }

    renderProfileSection(section, content, path, monthLabel) {
        const data = content.data;
        return `
            <div class="archive-card archive-card--${section.theme}">
                <div class="archive-card__header">
                    <h3 class="archive-card__title">${section.title}</h3>
                    <span class="archive-card__date">${monthLabel}</span>
                </div>
                <div class="archive-card__content">
                    <div class="archive-card__profile">
                        <p class="archive-card__name">${data.name || ''}</p>
                        ${this.formatText(data.message)}
                    </div>
                </div>
            </div>
        `;
    }

    renderMasterSpeaksSection(section, content, path, monthLabel) {
        const data = content.data;
        return `
            <div class="archive-card archive-card--${section.theme}">
                <div class="archive-card__header">
                    <h3 class="archive-card__title">${section.title}</h3>
                    <span class="archive-card__date">${monthLabel}</span>
                </div>
                <div class="archive-card__content">
                    <div class="archive-card__profile">
                        <p class="archive-card__name">${data.name || ''}</p>
                        ${this.formatText(data.message)}
                    </div>
                </div>
            </div>
        `;
    }

    renderChangingTimezonesSection(section, content, path, monthLabel) {
        const data = content.data;
        const masters = this.extractMasters(data);
        
        // Create separate cards for each person with proper spacing
        let cardsHTML = '<div class="archive-timezone-cards">';
        masters.forEach(master => {
            cardsHTML += `
                <div class="archive-card archive-card--${section.theme} archive-card--timezone">
                    <div class="archive-card__header">
                        <h3 class="archive-card__title">${section.title}: ${master.name}</h3>
                        <span class="archive-card__date">${monthLabel}</span>
                    </div>
                    <div class="archive-card__content">
                        <div class="archive-card__timeline">
                            <div class="archive-card__timeline-item">
                                ${this.createLazyImageHTML(`${path}/${master.thenImage}`, `${master.name} - ${master.then}`)}
                                <h4 class="archive-card__timeline-label">${master.then}</h4>
                                ${this.formatText(master.thenDesc)}
                            </div>
                            <div class="archive-card__timeline-item">
                                ${this.createLazyImageHTML(`${path}/${master.nowImage}`, `${master.name} - Now`)}
                                <h4 class="archive-card__timeline-label">Now</h4>
                                ${this.formatText(master.nowDesc)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        cardsHTML += '</div>';
        
        return cardsHTML;
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

    // Escape HTML special characters
    escapeHtml(text) {
        if (!text && text !== 0) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Convert newlines into paragraphs and <br>
    formatText(text) {
        if (!text && text !== 0) return '';
        const normalized = String(text).replace(/\r\n/g, '\n');
        const escaped = this.escapeHtml(normalized);
        const paragraphs = escaped.split(/\n\s*\n/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`);
        return paragraphs.join('');
    }

    /**
     * Create lazy-loaded image HTML
     */
    createLazyImageHTML(src, alt = '', cssClass = 'archive-card__image') {
        const placeholder = typeof LazyLoader !== 'undefined' 
            ? LazyLoader.createImagePlaceholder(400, 300) 
            : '';
        return `<img data-src="${src}" alt="${alt}" class="${cssClass} lazy-image" loading="lazy" src="${placeholder}">`;
    }

    renderProjectsSection(section, content, path, monthLabel) {
        // If we have multiple projects, render them all
        if (content.projects && content.projects.length > 0) {
            let projectsHTML = '';
            
            content.projects.forEach(project => {
                const imgHTML = project.media.images.length > 0 
                    ? this.createLazyImageHTML(`${project.path}/${project.media.images[0]}`, project.data.title) 
                    : '';
                projectsHTML += `
                    <div class="archive-card archive-card--${section.theme} archive-section--projects">
                        <div class="archive-card__header">
                            <h3 class="archive-card__title">${project.data.title || 'Project'}</h3>
                            <span class="archive-card__date">${monthLabel}</span>
                        </div>
                        <div class="archive-card__content archive-card__content--project">
                            ${imgHTML}
                            <div class="archive-card__text-group">
                                ${this.formatText(project.data.description)}
                                ${project.media.pdfs.length > 0 ? `<a href="${project.path}/${project.media.pdfs[0]}" class="archive-card__button" target="_blank">📄 View PDF</a>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            return projectsHTML;
        }
        
        // Fallback for single project
        const data = content.data;
        const media = content.media;
        const imgHTML = media.images.length > 0 
            ? this.createLazyImageHTML(`${path}/${media.images[0]}`, data.title) 
            : '';
        
        return `
            <div class="archive-card archive-card--${section.theme}">
                <div class="archive-card__header">
                    <h3 class="archive-card__title">${data.title || section.title}</h3>
                    <span class="archive-card__date">${monthLabel}</span>
                </div>
                <div class="archive-card__content archive-card__content--project">
                    ${imgHTML}
                    <div class="archive-card__text-group">
                        ${this.formatText(data.description)}
                        ${media.pdfs.length > 0 ? `<a href="${path}/${media.pdfs[0]}" class="archive-card__button" target="_blank">📄 View PDF</a>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderMediaSection(section, content, path, monthLabel) {
        // If we have multiple featured items, render them all
        if (content.items && content.items.length > 0) {
            let itemsHTML = '';
            
            content.items.forEach(item => {
                const imgHTML = item.media.images.length > 0 
                    ? this.createLazyImageHTML(`${item.path}/${item.media.images[0]}`, item.data.title) 
                    : '';
                itemsHTML += `
                    <div class="archive-card archive-card--${section.theme}">
                        <div class="archive-card__header">
                            <h3 class="archive-card__title">${item.data.title || section.title}</h3>
                            <span class="archive-card__date">${monthLabel}</span>
                        </div>
                        <div class="archive-card__content archive-card__content--project">
                            ${imgHTML}
                            <div class="archive-card__text-group">
                                ${this.formatText(item.data.description)}
                                ${item.media.pdfs.length > 0 ? `<a href="${item.path}/${item.media.pdfs[0]}" class="archive-card__button" target="_blank">📄 Read More</a>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            return itemsHTML;
        }
        
        // Fallback for single media item
        const data = content.data;
        const media = content.media;
        const imgHTML = media.images.length > 0 
            ? this.createLazyImageHTML(`${path}/${media.images[0]}`, data.title) 
            : '';
        
        return `
            <div class="archive-card archive-card--${section.theme}">
                <div class="archive-card__header">
                    <h3 class="archive-card__title">${data.title || section.title}</h3>
                    <span class="archive-card__date">${monthLabel}</span>
                </div>
                <div class="archive-card__content archive-card__content--project">
                    ${imgHTML}
                    <div class="archive-card__text-group">
                        ${this.formatText(data.description)}
                        ${media.pdfs.length > 0 ? `<a href="${path}/${media.pdfs[0]}" class="archive-card__button" target="_blank">📄 Read More</a>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    renderKnowledgeBitesSection(section, content, path, monthLabel) {
        const data = content.data;
        const media = content.media;
        const bites = data.bites || [];
        const imgHTML = media.images.length > 0 
            ? this.createLazyImageHTML(`${path}/${media.images[0]}`, section.title) 
            : '';
        
        return `
            <div class="archive-card archive-card--${section.theme}">
                <div class="archive-card__header">
                    <h3 class="archive-card__title">${data.title || section.title}</h3>
                    <span class="archive-card__date">${monthLabel}</span>
                </div>
                <div class="archive-card__content ${media.images.length > 0 ? 'archive-card__content--project' : ''}">
                    ${imgHTML}
                    ${media.images.length > 0 ? '<div class="archive-card__text-group">' : ''}
                        <ul class="archive-card__list">
                            ${bites.map(bite => `<li>${bite}</li>`).join('')}
                        </ul>
                    ${media.images.length > 0 ? '</div>' : ''}
                </div>
            </div>
        `;
    }

    renderSpreadKindnessSection(section, content, path, monthLabel) {
        const data = content.data;
        const media = content.media;
        const imgHTML = media.images.length > 0 
            ? this.createLazyImageHTML(`${path}/${media.images[0]}`, section.title) 
            : '';
        
        return `
            <div class="archive-card archive-card--${section.theme}">
                <div class="archive-card__header">
                    <h3 class="archive-card__title">${data.title || section.title}</h3>
                    <span class="archive-card__date">${monthLabel}</span>
                </div>
                <div class="archive-card__content ${media.images.length > 0 ? 'archive-card__content--project' : ''}">
                    ${imgHTML}
                    ${media.images.length > 0 ? '<div class="archive-card__text-group">' : ''}
                        ${this.formatText(data.content)}
                    ${media.images.length > 0 ? '</div>' : ''}
                </div>
            </div>
        `;
    }

    renderGenericSection(section, content, path, monthLabel) {
        return `
            <div class="archive-card archive-card--${section.theme}">
                <div class="archive-card__header">
                    <h3 class="archive-card__title">${section.title}</h3>
                    <span class="archive-card__date">${monthLabel}</span>
                </div>
                <div class="archive-card__content">
                    ${this.formatText(section.description)}
                </div>
            </div>
        `;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const archiveLoader = new ArchiveLoader();
    archiveLoader.init();
});
