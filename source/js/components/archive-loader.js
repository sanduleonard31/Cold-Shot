/**
 * Optimized Archive Content Loader
 * Loads and displays archived content with month/section filtering
 */

class ArchiveLoader {
    constructor() {
        this.basePath = './media';
        this.availableMonths = [];
        this.allContent = [];
        this.filters = { month: 'all', section: 'all' };
        this.selectors = {
            month: document.getElementById('month-selector'),
            section: document.getElementById('section-selector'),
            container: document.getElementById('archive-container')
        };
    }

    async init() {
        try {
            await this.discoverMonths();
            this.populateSelectors();
            await this.loadAllContent();
            this.setupEventListeners();
            this.render();
            console.log('Archive loaded successfully!');
        } catch (error) {
            this.showError('Error loading archive content');
            console.error(error);
        }
    }

    async discoverMonths() {
        const months = [];
        const currentDate = new Date();
        
        for (let i = 0; i < 24; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const folder = `${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
            
            try {
                const response = await fetch(`${this.basePath}/${folder}/sections.json`);
                if (response.ok) months.push(folder);
            } catch (e) { /* Month doesn't exist */ }
        }
        
        this.availableMonths = months.sort((a, b) => {
            const [aM, aY] = a.split('.').map(Number);
            const [bM, bY] = b.split('.').map(Number);
            return bY - aY || bM - aM;
        });
    }

    populateSelectors() {
        if (this.selectors.month) {
            this.selectors.month.innerHTML = '<option value="all">All Months</option>' +
                this.availableMonths.map(m => 
                    `<option value="${m}">${ContentUtils.formatMonthLabel(m, true)}</option>`
                ).join('');
        }
    }

    async loadAllContent() {
        for (const month of this.availableMonths) {
            try {
                const sectionsData = await (await fetch(`${this.basePath}/${month}/sections.json`)).json();
                
                for (const section of sectionsData.sections) {
                    const content = await this.loadSectionContent(section, `${this.basePath}/${month}/${section.folder}`);
                    if (content) {
                        this.allContent.push({ month, section, content, path: `${this.basePath}/${month}/${section.folder}` });
                    }
                }
                
                if (month === this.availableMonths[0] && this.selectors.section) {
                    const uniqueSections = [...new Set(sectionsData.sections.map(s => s.id))];
                    this.selectors.section.innerHTML = '<option value="all">All Sections</option>' +
                        uniqueSections.map(id => {
                            const s = sectionsData.sections.find(sec => sec.id === id);
                            return `<option value="${id}">${s.title}</option>`;
                        }).join('');
                }
            } catch (error) {
                console.error(`Error loading ${month}:`, error);
            }
        }
    }

    async loadSectionContent(section, path) {
        if (section.id === 'projects') return await this.loadMultiItems(path, 'project', 20);
        if (section.id === 'featured') return await this.loadMultiItems(path, 'featured', ['launch', 'announcement', 'event', 'special', 'news']);
        
        const media = await ContentUtils.detectMedia(path, section.id);
        if (!media.json.length) return null;
        
        const data = await (await fetch(`${path}/${media.json[0]}`)).json();
        return { data, media };
    }

    async loadMultiItems(path, type, items) {
        const results = [];
        const itemList = Array.isArray(items) ? items : Array.from({ length: items }, (_, i) => `${type}-${i + 1}`);
        
        for (const item of itemList) {
            try {
                const itemPath = `${path}/${item}`;
                const response = await fetch(`${itemPath}/text.json`);
                if (!response.ok) break;
                
                const data = await response.json();
                const media = await ContentUtils.detectMedia(itemPath, type === 'featured' ? 'featured' : 'projects');
                results.push({ id: item, data, media, path: itemPath });
            } catch (e) { break; }
        }
        
        return results.length ? (type === 'project' ? { projects: results } : { items: results }) : null;
    }

    setupEventListeners() {
        ['month', 'section'].forEach(type => {
            if (this.selectors[type]) {
                this.selectors[type].addEventListener('change', e => {
                    this.filters[type] = e.target.value;
                    this.render();
                });
            }
        });
    }

    render() {
        if (!this.selectors.container) return;
        
        const filtered = this.allContent.filter(item =>
            (this.filters.month === 'all' || item.month === this.filters.month) &&
            (this.filters.section === 'all' || item.section.id === this.filters.section)
        );
        
        if (!filtered.length) {
            this.selectors.container.innerHTML = '<div class="archive-empty"><p>No content found for the selected filters.</p></div>';
            return;
        }
        
        this.selectors.container.innerHTML = filtered.map(item => this.renderSection(item)).join('');
    }

    renderSection(item) {
        const { month, section, content, path } = item;
        const monthLabel = ContentUtils.formatMonthLabel(month);
        const html = this[`render${this.toCamelCase(section.id)}`]?.(section, content, path, monthLabel) ||
                     this.renderGeneric(section, content, path, monthLabel);
        
        return `<div class="archive-section archive-section--${section.id}">${html}</div>`;
    }

    toCamelCase(str) {
        return str.split('-').map((word, i) => i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : 
               word.charAt(0).toUpperCase() + word.slice(1)).join('').replace('-', '');
    }

    renderCard(section, monthLabel, content) {
        return `<div class="archive-card archive-card--${section.theme}">
            <div class="archive-card__header">
                <h3 class="archive-card__title">${section.title}</h3>
                <span class="archive-card__date">${monthLabel}</span>
            </div>
            <div class="archive-card__content">${content}</div>
        </div>`;
    }

    renderChampion(section, content, path, monthLabel) {
        return this.renderCard(section, monthLabel, `
            <div class="archive-card__profile">
                <p class="archive-card__name">${content.data.name || ''}</p>
                <p class="archive-card__text">${content.data.message || ''}</p>
            </div>
        `);
    }

    renderEditor = (section, content, path, monthLabel) => this.renderChampion(section, content, path, monthLabel);
    renderMasterspeaks = (section, content, path, monthLabel) => this.renderChampion(section, content, path, monthLabel);

    renderChangingtimezones(section, content, path, monthLabel) {
        const masters = ContentUtils.extractMasters(content.data);
        return '<div class="archive-timezone-cards">' + masters.map(master => `
            <div class="archive-card archive-card--${section.theme} archive-card--timezone">
                <div class="archive-card__header">
                    <h3 class="archive-card__title">${section.title}: ${master.name}</h3>
                    <span class="archive-card__date">${monthLabel}</span>
                </div>
                <div class="archive-card__content">
                    <div class="archive-card__timeline">
                        ${['then', 'now'].map((time, i) => `
                            <div class="archive-card__timeline-item">
                                <img src="${path}/${master[time === 'then' ? 'thenImage' : 'nowImage']}" 
                                     alt="${master.name} - ${time}" class="archive-card__image">
                                <h4 class="archive-card__timeline-label">${i === 0 ? master.then : 'Now'}</h4>
                                <p class="archive-card__text">${master[time === 'then' ? 'thenDesc' : 'nowDesc']}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('') + '</div>';
    }

    renderProjects(section, content, path, monthLabel) {
        if (!content.projects?.length) return '';
        return content.projects.map(project => this.renderCard(section, monthLabel, `
            <div class="archive-card__content--project">
                ${project.media.images.length ? `<img src="${project.path}/${project.media.images[0]}" alt="${project.data.title}" class="archive-card__image">` : ''}
                <div class="archive-card__text-group">
                    <p class="archive-card__text">${project.data.description || ''}</p>
                    ${project.media.pdfs.length ? `<a href="${project.path}/${project.media.pdfs[0]}" class="archive-card__button" target="_blank">📄 View PDF</a>` : ''}
                </div>
            </div>
        `)).join('');
    }

    renderFeatured(section, content, path, monthLabel) {
        if (!content.items?.length) return '';
        return content.items.map(item => this.renderCard(section, monthLabel, `
            <div class="archive-card__content--column">
                ${item.media.images.length ? `<img src="${item.path}/${item.media.images[0]}" alt="${item.data.title}" class="archive-card__image">` : ''}
                <p class="archive-card__text">${item.data.description || ''}</p>
                ${item.media.pdfs.length ? `<a href="${item.path}/${item.media.pdfs[0]}" class="archive-card__button" target="_blank">📄 Read More</a>` : ''}
            </div>
        `)).join('');
    }

    renderMatchazone = (section, content, path, monthLabel) => this.renderFeatured(section, content, path, monthLabel);

    renderKnowledgebites(section, content, path, monthLabel) {
        const bites = content.data.bites || [];
        return this.renderCard(section, monthLabel, `
            <ul class="archive-card__list">${bites.map(bite => `<li>${bite}</li>`).join('')}</ul>
        `);
    }

    renderSpreadkindness(section, content, path, monthLabel) {
        return this.renderCard(section, monthLabel, `<p class="archive-card__text">${content.data.content || ''}</p>`);
    }

    renderGeneric(section, content, path, monthLabel) {
        return this.renderCard(section, monthLabel, `<p class="archive-card__text">${section.description}</p>`);
    }

    showError(message) {
        if (this.selectors.container) {
            this.selectors.container.innerHTML = `
                <div class="error-message">
                    <h3>Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => new ArchiveLoader().init());
