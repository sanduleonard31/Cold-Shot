/**
 * International Loader Component
 * Loads and displays international folders as cards
 */

class InternationalLoader {
    constructor() {
        this.basePath = './media/international';
        this.container = document.getElementById('international-container');
        this.items = [];
    }

    async init() {
        try {
            // Load international items
            await this.loadInternationalItems();
            
            // Render cards
            this.renderCards();
            
            console.log('International loader initialized successfully');
        } catch (error) {
            console.error('Error initializing international loader:', error);
            this.showError();
        }
    }

    async loadInternationalItems() {
        try {
            // First, scan the international folder for subdirectories
            // Since we can't directly list directories in browser, we'll try to load from known folders
            // For now, let's try to fetch the project folder
            const folders = await this.discoverFolders();
            
            for (const folder of folders) {
                try {
                    const response = await fetch(`${this.basePath}/${folder}/text.json`);
                    if (response.ok) {
                        const data = await response.json();
                        
                        // Check for image
                        const imageUrl = await this.findImage(folder);
                        
                        // Check for files
                        const files = await this.findFiles(folder);
                        
                        this.items.push({
                            folder: folder,
                            title: data.title || folder,
                            description: data.description || '',
                            image: imageUrl,
                            files: files
                        });
                    }
                } catch (error) {
                    console.error(`Error loading ${folder}:`, error);
                }
            }
        } catch (error) {
            console.error('Error loading international items:', error);
        }
    }

    async discoverFolders() {
        try {
            // Try to load from configuration file first
            const configResponse = await fetch(`${this.basePath}/international-items.json`);
            if (configResponse.ok) {
                const config = await configResponse.json();
                return config.folders || [];
            }
        } catch (error) {
            console.log('No configuration file found, using default folders');
        }
        
        // Fallback to known folders
        const knownFolders = ['project'];
        const discoveredFolders = [];
        
        for (const folder of knownFolders) {
            try {
                const response = await fetch(`${this.basePath}/${folder}/text.json`);
                if (response.ok) {
                    discoveredFolders.push(folder);
                }
            } catch (error) {
                // Folder doesn't exist or is not accessible
            }
        }
        
        return discoveredFolders;
    }

    async findImage(folder) {
        // Try common image extensions
        const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
        const imageNames = ['picture', 'image', 'cover', 'thumbnail'];
        
        for (const name of imageNames) {
            for (const ext of imageExtensions) {
                try {
                    const response = await fetch(`${this.basePath}/${folder}/${name}.${ext}`, { method: 'HEAD' });
                    if (response.ok) {
                        return `${this.basePath}/${folder}/${name}.${ext}`;
                    }
                } catch (error) {
                    // Image doesn't exist
                }
            }
        }
        
        return null;
    }

    async findFiles(folder) {
        // Try to find common file types
        const fileExtensions = ['pdf', 'docx', 'pptx', 'xlsx'];
        const files = [];
        
        for (const ext of fileExtensions) {
            try {
                // Try common names
                const commonNames = ['project', 'document', 'presentation', folder];
                for (const name of commonNames) {
                    const response = await fetch(`${this.basePath}/${folder}/${name}.${ext}`, { method: 'HEAD' });
                    if (response.ok) {
                        files.push({
                            name: `${name}.${ext}`,
                            path: `${this.basePath}/${folder}/${name}.${ext}`,
                            type: ext
                        });
                    }
                }
            } catch (error) {
                // File doesn't exist
            }
        }
        
        return files;
    }

    renderCards() {
        if (!this.container) {
            console.error('International container not found');
            return;
        }

        if (this.items.length === 0) {
            this.container.innerHTML = `
                <div class="no-content-message">
                    <p>No international content available at this time.</p>
                </div>
            `;
            return;
        }

        const cardsHTML = this.items.map(item => this.createCard(item)).join('');
        this.container.innerHTML = `
            <div class="media-grid">
                ${cardsHTML}
            </div>
        `;
    }

    createCard(item) {
        const imageHTML = item.image ? `
            <div class="international-card__image-container">
                <img src="${item.image}" alt="${this.escapeHtml(item.title)}" class="international-card__image">
            </div>
        ` : '';

        const filesHTML = item.files.length > 0 ? `
            <div class="media-card__files">
                <h4 class="media-card__files-title">Available Resources:</h4>
                <div class="media-card__files-list">
                    ${item.files.map(file => {
                        const icon = this.getFileIcon(file.type);
                        return `
                            <a href="${file.path}" class="media-card__file-link" download>
                                <img src="${icon}" alt="" class="media-card__file-icon" aria-hidden="true">
                                <span class="media-card__file-name">${this.escapeHtml(file.name)}</span>
                            </a>
                        `;
                    }).join('')}
                </div>
            </div>
        ` : '';

        return `
            <article class="international-card media-card theme-important">
                ${imageHTML}
                <div class="media-card__header">
                    <h3 class="media-card__title">${this.escapeHtml(item.title)}</h3>
                </div>
                <div class="media-card__body">
                    <p class="media-card__description">${this.escapeHtml(item.description)}</p>
                    ${filesHTML}
                </div>
            </article>
        `;
    }

    getFileIcon(fileType) {
        const iconMap = {
            'pdf': './assets/icons/file-pdf.svg',
            'pptx': './assets/icons/file-ppt.svg',
            'docx': './assets/icons/file-doc.svg',
            'xlsx': './assets/icons/file-excel.svg',
            'png': './assets/icons/file-image.svg',
            'jpg': './assets/icons/file-image.svg',
            'jpeg': './assets/icons/file-image.svg'
        };
        
        return iconMap[fileType] || './assets/icons/file.svg';
    }

    escapeHtml(text) {
        if (!text && text !== 0) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="error-message">
                    <h3>Error Loading International Content</h3>
                    <p>Unable to load international content. Please try again later.</p>
                </div>
            `;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const loader = new InternationalLoader();
    loader.init();
});
