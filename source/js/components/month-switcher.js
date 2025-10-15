/**
 * Month Switcher Component
 * Allows users to switch between different month editions
 */

class MonthSwitcher {
    constructor() {
        this.currentMonth = this.detectCurrentMonth();
        this.availableMonths = [];
        this.container = null;
    }

    detectCurrentMonth() {
        // Try to get from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const monthParam = urlParams.get('month');
        
        if (monthParam) {
            return monthParam;
        }
        
        // Default to current month
        const date = new Date();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}.${year}`;
    }

    async init() {
        await this.detectAvailableMonths();
        this.render();
    }

    async detectAvailableMonths() {
        // Common months to check
        const currentYear = new Date().getFullYear();
        const monthsToCheck = [];
        
        // Check current and previous 12 months
        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            monthsToCheck.push(`${month}.${year}`);
        }

        // Check which months exist
        for (const month of monthsToCheck) {
            try {
                const response = await fetch(`./media/${month}/sections.json`, { method: 'HEAD' });
                if (response.ok) {
                    this.availableMonths.push(month);
                }
            } catch (error) {
                // Month doesn't exist
            }
        }

        // Sort in descending order (newest first)
        this.availableMonths.sort((a, b) => {
            const [monthA, yearA] = a.split('.').map(Number);
            const [monthB, yearB] = b.split('.').map(Number);
            if (yearA !== yearB) return yearB - yearA;
            return monthB - monthA;
        });
    }

    render() {
        // Create switcher UI
        this.container = document.createElement('div');
        this.container.className = 'month-switcher';
        
        if (this.availableMonths.length <= 1) {
            return; // Don't show if only one month
        }

        const label = document.createElement('label');
        label.textContent = 'Edition: ';
        label.className = 'month-switcher__label';

        const select = document.createElement('select');
        select.className = 'month-switcher__select';
        
        this.availableMonths.forEach(month => {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = this.formatMonth(month);
            if (month === this.currentMonth) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            this.switchMonth(e.target.value);
        });

        this.container.appendChild(label);
        this.container.appendChild(select);

        // Insert before content container
        const contentContainer = document.getElementById('content-container');
        if (contentContainer && contentContainer.parentNode) {
            contentContainer.parentNode.insertBefore(this.container, contentContainer);
        }
    }

    formatMonth(month) {
        const [m, y] = month.split('.');
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return `${monthNames[parseInt(m) - 1]} ${y}`;
    }

    switchMonth(newMonth) {
        // Update URL without reload
        const url = new URL(window.location);
        url.searchParams.set('month', newMonth);
        window.history.pushState({}, '', url);

        // Reload content
        window.location.reload();
    }

    getCurrentMonth() {
        return this.currentMonth;
    }
}

// Export for use in content-loader
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MonthSwitcher;
}
