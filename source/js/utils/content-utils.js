/**
 * Shared Utilities for Content Loaders
 * Common functions used across archive and content loaders
 */

const ContentUtils = {
    // Month helpers
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    
    formatMonthLabel(month, short = false) {
        const [monthNum, year] = month.split('.');
        const names = short ? this.monthNamesShort : this.monthNames;
        return `${names[parseInt(monthNum) - 1]} ${year}`;
    },
    
    getCurrentMonth() {
        const date = new Date();
        return `${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    },
    
    // File detection
    fileMap: {
        'champion': { json: ['champion.json'], images: ['champion.png'], pdfs: [] },
        'editor': { json: ['editor.json'], images: ['editor.png'], pdfs: [] },
        'matcha-zone': { json: ['text.json'], images: ['picture.png'], pdfs: ['project.pdf'] },
        'knowledge-bites': { json: ['knowledge-bites.json'], images: [], pdfs: [] },
        'spread-kindness': { json: ['spread-kindness.json'], images: [], pdfs: [] },
        'master-speaks': { json: ['text.json'], images: ['master.png'], pdfs: [] },
        'changing-timezones': { json: ['text.json'], images: ['master-1-then.png', 'master-1-now.png'], pdfs: [] },
        'projects': { json: ['text.json'], images: ['picture.png'], pdfs: ['project.pdf'] },
        'featured': { json: ['text.json'], images: ['picture.png'], pdfs: ['project.pdf'] }
    },
    
    async detectMedia(path, sectionId) {
        const media = { json: [], images: [], pdfs: [] };
        const expected = this.fileMap[sectionId] || { json: ['text.json'], images: ['picture.png'], pdfs: [] };
        
        for (const [type, files] of Object.entries(expected)) {
            for (const file of files) {
                try {
                    const response = await fetch(`${path}/${file}`, { method: 'HEAD' });
                    if (response.ok) media[type].push(file);
                } catch (e) { /* File doesn't exist */ }
            }
        }
        return media;
    },
    
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
};
