/**
 * Masters Store Centralization Loader
 * Browser-tab style interface for districts and stores
 */

class MastersLoader {
    constructor() {
        this.data = null;
        this.currentDistrict = null;
        this.currentStore = null;
        this.statistics = {};
    }

    async init() {
        try {
            await this.loadData();
            this.calculateStatistics();
            this.render();
            console.log('Masters loader initialized successfully');
        } catch (error) {
            console.error('Error initializing masters loader:', error);
            this.showError();
        }
    }

    async loadData() {
        try {
            const response = await fetch('./assets/centralisator.json');
            if (!response.ok) throw new Error('Failed to load data');
            this.data = await response.json();
        } catch (error) {
            console.error('Error loading centralisator data:', error);
            throw error;
        }
    }

    calculateStatistics() {
        if (!this.data || !this.data.districts) return;

        const stats = {
            totalDistricts: this.data.districts.length,
            totalStores: 0,
            totalMasters: 0,
            totalCertified: 0,
            totalToBeCertified: 0,
            districtStats: []
        };

        this.data.districts.forEach(district => {
            stats.totalStores += district.stores.length;
            
            let districtMasters = 0;
            let districtCertified = 0;
            let districtToBeCertified = 0;

            district.stores.forEach(store => {
                // Count store leader
                districtMasters++;
                stats.totalMasters++;
                
                if (store.storeLeader.isCertified) {
                    districtCertified++;
                    stats.totalCertified++;
                } else {
                    districtToBeCertified++;
                    stats.totalToBeCertified++;
                }

                // Count masters
                if (store.masters && store.masters.length > 0) {
                    districtMasters += store.masters.length;
                    stats.totalMasters += store.masters.length;
                    
                    store.masters.forEach(master => {
                        if (master.isCertified) {
                            districtCertified++;
                            stats.totalCertified++;
                        } else {
                            districtToBeCertified++;
                            stats.totalToBeCertified++;
                        }
                    });
                }
            });

            stats.districtStats.push({
                name: district.name,
                code: district.code,
                stores: district.stores.length,
                masters: districtMasters,
                certified: districtCertified,
                toBeCertified: districtToBeCertified,
                avgMastersPerStore: (districtMasters / district.stores.length).toFixed(1)
            });
        });

        stats.avgMastersPerDistrict = (stats.totalMasters / stats.totalDistricts).toFixed(1);
        stats.avgMastersPerStore = (stats.totalMasters / stats.totalStores).toFixed(1);
        stats.certificationRate = ((stats.totalCertified / stats.totalMasters) * 100).toFixed(1);

        this.statistics = stats;
    }

    render() {
        this.renderStatistics();
        this.renderDistrictTabs();
        
        // Select first district by default
        if (this.data.districts.length > 0) {
            this.selectDistrict(this.data.districts[0].id);
        }
    }

    renderStatistics() {
        const container = document.getElementById('statistics-container');
        if (!container) return;

        const stats = this.statistics;

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card stat-card--primary">
                    <div class="stat-card__icon">🏢</div>
                    <div class="stat-card__content">
                        <h3 class="stat-card__value">${stats.totalStores}</h3>
                        <p class="stat-card__label">Total Stores</p>
                    </div>
                </div>
                
                <div class="stat-card stat-card--secondary">
                    <div class="stat-card__icon">👥</div>
                    <div class="stat-card__content">
                        <h3 class="stat-card__value">${stats.totalMasters}</h3>
                        <p class="stat-card__label">Total Masters</p>
                    </div>
                </div>
                
                <div class="stat-card stat-card--success">
                    <div class="stat-card__icon">✓</div>
                    <div class="stat-card__content">
                        <h3 class="stat-card__value">${stats.totalCertified}</h3>
                        <p class="stat-card__label">Certified</p>
                    </div>
                </div>
                
                <div class="stat-card stat-card--warning">
                    <div class="stat-card__icon">⏳</div>
                    <div class="stat-card__content">
                        <h3 class="stat-card__value">${stats.totalToBeCertified}</h3>
                        <p class="stat-card__label">To Be Certified</p>
                    </div>
                </div>
                
                <div class="stat-card stat-card--info">
                    <div class="stat-card__icon">📊</div>
                    <div class="stat-card__content">
                        <h3 class="stat-card__value">${stats.avgMastersPerStore}</h3>
                        <p class="stat-card__label">Avg per Store</p>
                    </div>
                </div>
                
                <div class="stat-card stat-card--accent">
                    <div class="stat-card__icon">%</div>
                    <div class="stat-card__content">
                        <h3 class="stat-card__value">${stats.certificationRate}%</h3>
                        <p class="stat-card__label">Certification Rate</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderDistrictTabs() {
        const container = document.getElementById('district-tabs');
        if (!container) return;

        container.innerHTML = `
            <div class="browser-tabs">
                <div class="browser-tabs__bar">
                    ${this.data.districts.map(district => `
                        <button 
                            class="browser-tab" 
                            data-district-id="${district.id}"
                            onclick="mastersLoader.selectDistrict('${district.id}')">
                            <span class="browser-tab__icon">📍</span>
                            <span class="browser-tab__label">${district.name}</span>
                            <span class="browser-tab__badge">${district.stores.length}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    selectDistrict(districtId) {
        this.currentDistrict = this.data.districts.find(d => d.id === districtId);
        if (!this.currentDistrict) return;

        // Update active tab
        document.querySelectorAll('.browser-tab').forEach(tab => {
            tab.classList.remove('browser-tab--active');
        });
        document.querySelector(`[data-district-id="${districtId}"]`)?.classList.add('browser-tab--active');

        // Render store tabs
        this.renderStoreTabs();
        
        // Select first store by default
        if (this.currentDistrict.stores.length > 0) {
            this.selectStore(this.currentDistrict.stores[0].id);
        }
    }

    renderStoreTabs() {
        const container = document.getElementById('store-tabs');
        if (!container) return;

        container.innerHTML = `
            <div class="browser-tabs browser-tabs--secondary">
                <div class="browser-tabs__bar">
                    ${this.currentDistrict.stores.map(store => {
                        const totalMasters = 1 + (store.masters?.length || 0);
                        return `
                            <button 
                                class="browser-tab browser-tab--secondary" 
                                data-store-id="${store.id}"
                                onclick="mastersLoader.selectStore('${store.id}')">
                                <span class="browser-tab__icon">🏪</span>
                                <span class="browser-tab__label">${store.name}</span>
                                <span class="browser-tab__badge">${totalMasters}</span>
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    selectStore(storeId) {
        this.currentStore = this.currentDistrict.stores.find(s => s.id === storeId);
        if (!this.currentStore) return;

        // Update active tab
        document.querySelectorAll('[data-store-id]').forEach(tab => {
            tab.classList.remove('browser-tab--active');
        });
        document.querySelector(`[data-store-id="${storeId}"]`)?.classList.add('browser-tab--active');

        // Render store content
        this.renderStoreContent();
    }

    renderStoreContent() {
        const container = document.getElementById('store-content');
        if (!container) return;

        const store = this.currentStore;
        const leader = store.storeLeader;

        container.innerHTML = `
            <div class="store-header">
                <h2 class="store-header__title">${store.name}</h2>
                <p class="store-header__code">${store.code}</p>
                <p class="store-header__address">📍 ${store.address}</p>
            </div>

            <div class="store-leader-section">
                <h3 class="section-title">
                    <span class="section-title__icon">👔</span>
                    Store Leader
                </h3>
                ${this.renderLeaderCard(leader)}
            </div>

            <div class="masters-section">
                <h3 class="section-title">
                    <span class="section-title__icon">☕</span>
                    Coffee Masters
                    <span class="section-title__count">(${store.masters?.length || 0})</span>
                </h3>
                ${this.renderMastersList(store.masters)}
            </div>
        `;
    }

    renderLeaderCard(leader) {
        const statusClass = leader.isCertified ? 'certified' : 'pending';
        const statusIcon = leader.isCertified ? '✓' : '⏳';
        const statusText = leader.isCertified ? 'Certified' : 'Certification Pending';

        return `
            <div class="leader-card leader-card--${statusClass}">
                <div class="leader-card__header">
                    <div class="leader-card__info">
                        <h4 class="leader-card__name">${leader.name}</h4>
                        <p class="leader-card__role">${leader.role}</p>
                    </div>
                    <div class="leader-card__status leader-card__status--${statusClass}">
                        <span class="status-icon">${statusIcon}</span>
                        <span class="status-text">${statusText}</span>
                    </div>
                </div>
                <div class="leader-card__details">
                    <div class="detail-item">
                        <span class="detail-item__label">Employment Date</span>
                        <span class="detail-item__value">${this.formatDate(leader.employmentDate)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-item__label">Certification Date</span>
                        <span class="detail-item__value">${this.formatDate(leader.certificationDate)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-item__label">Certification Expiry</span>
                        <span class="detail-item__value">${this.formatDate(leader.certificationExpiry)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderMastersList(masters) {
        if (!masters || masters.length === 0) {
            return '<p class="empty-message">No coffee masters registered yet.</p>';
        }

        return `
            <div class="masters-list">
                ${masters.map(master => this.renderMasterItem(master)).join('')}
            </div>
        `;
    }

    renderMasterItem(master) {
        const statusClass = master.isCertified ? 'certified' : 'pending';
        const statusIcon = master.isCertified ? '✓' : '⏳';

        return `
            <div class="master-item master-item--${statusClass}">
                <div class="master-item__header">
                    <div class="master-item__avatar">${this.getInitials(master.name)}</div>
                    <div class="master-item__info">
                        <h5 class="master-item__name">${master.name}</h5>
                        <p class="master-item__status">
                            <span class="status-icon">${statusIcon}</span>
                            ${master.isCertified ? 'Certified' : 'Pending Certification'}
                        </p>
                    </div>
                </div>
                <div class="master-item__dates">
                    <div class="date-badge">
                        <span class="date-badge__label">Employed</span>
                        <span class="date-badge__value">${this.formatDate(master.employmentDate)}</span>
                    </div>
                    <div class="date-badge">
                        <span class="date-badge__label">Cert. Date</span>
                        <span class="date-badge__value">${this.formatDate(master.certificationDate)}</span>
                    </div>
                    <div class="date-badge">
                        <span class="date-badge__label">Expires</span>
                        <span class="date-badge__value">${this.formatDate(master.certificationExpiry)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    getInitials(name) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    showError() {
        const container = document.getElementById('masters-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>Error Loading Data</h3>
                    <p>Unable to load masters data. Please check the console for details.</p>
                </div>
            `;
        }
    }
}

// Initialize on page load
let mastersLoader;
document.addEventListener('DOMContentLoaded', () => {
    mastersLoader = new MastersLoader();
    mastersLoader.init();
});
