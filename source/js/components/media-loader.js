/**
 * Media Loader Component
 * Loads and displays media items from the allround-media folder
 */

class MediaLoader {
    constructor() {
        this.basePath = './media/allround-media';
        this.mediaContainer = document.getElementById('media-container');
        this.mediaItems = [];
    }

    async init() {
        try {
            // Load media items configuration
            await this.loadMediaItems();
            
            // Render media cards
            this.renderMediaCards();
            
            console.log('Media loader initialized successfully');
        } catch (error) {
            console.error('Error initializing media loader:', error);
            this.showError();
        }
    }

    async loadMediaItems() {
        try {
            // Load media items configuration
            const configResponse = await fetch(`${this.basePath}/media-items.json`);
            if (!configResponse.ok) {
                throw new Error('Failed to load media items configuration');
            }
            
            const config = await configResponse.json();
            
            for (const item of config.items) {
                try {
                    const response = await fetch(`${this.basePath}/${item.folder}/text.json`);
                    if (response.ok) {
                        const data = await response.json();
                        this.mediaItems.push({
                            folder: item.folder,
                            title: data.title || item.folder,
                            content: data.content || '',
                            files: this.processFiles(item.folder, item.files || [])
                        });
                    }
                } catch (error) {
                    console.error(`Error loading ${item.folder}:`, error);
                }
            }
        } catch (error) {
            console.error('Error loading media items configuration:', error);
        }
    }

    processFiles(folder, fileNames) {
        return fileNames.map(fileName => {
            const extension = fileName.split('.').pop().toLowerCase();
            return {
                name: fileName,
                path: `${this.basePath}/${folder}/${fileName}`,
                type: extension
            };
        });
    }

    renderMediaCards() {
        if (!this.mediaContainer) {
            console.error('Media container not found');
            return;
        }

        if (this.mediaItems.length === 0) {
            this.mediaContainer.innerHTML = `
                <div class="no-media-message">
                    <p>No media items available at this time.</p>
                </div>
            `;
            return;
        }

        const cardsHTML = this.mediaItems.map(item => this.createMediaCard(item)).join('');
        this.mediaContainer.innerHTML = `
            <div class="media-grid">
                ${cardsHTML}
            </div>
        `;
    }

    createMediaCard(item) {
        const filesHTML = item.files.map(file => {
            const icon = this.getFileIcon(file.type);
            return `
                <a href="${file.path}" class="media-card__file-link" download>
                    <img src="${icon}" alt="" class="media-card__file-icon" aria-hidden="true">
                    <span class="media-card__file-name">${this.escapeHtml(file.name)}</span>
                </a>
            `;
        }).join('');

        return `
            <article class="media-card theme-important">
                <div class="media-card__header">
                    <h3 class="media-card__title">${this.escapeHtml(item.title)}</h3>
                </div>
                <div class="media-card__body">
                    <p class="media-card__description">${this.escapeHtml(item.content)}</p>
                    ${item.files.length > 0 ? `
                        <div class="media-card__files">
                            <h4 class="media-card__files-title">Available Downloads:</h4>
                            <div class="media-card__files-list">
                                ${filesHTML}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </article>
        `;
    }

    getFileIcon(fileType) {
        const iconMap = {
            'pdf': './assets/icons/file-pdf.svg',
            'pptx': './assets/icons/file-ppt.svg',
            'docx': './assets/icons/file-doc.svg',
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
        if (this.mediaContainer) {
            this.mediaContainer.innerHTML = `
                <div class="error-message">
                    <h3>Error Loading Media</h3>
                    <p>Unable to load media content. Please try again later.</p>
                </div>
            `;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const mediaLoader = new MediaLoader();
    mediaLoader.init();
});
