class MyFooter extends HTMLElement{
    connectedCallback(){
        // Determine path based on current location
        const currentPath = window.location.pathname;
        let footerPath = './source/html/footer.html';

        fetch(footerPath)
            .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch footer: ${res.status} ${res.statusText}`)
                return res.text()
            })
            .then(html => {
                this.innerHTML = html;
                // Load links and update footer after HTML is loaded
                this.loadAndUpdateLinks();
            })
            .catch(err => {
                console.error('Error loading footer:', err)
                // Fallback content so the element isn't empty
                this.innerHTML = '<!-- footer failed to load -->'
            })
    }

    async loadAndUpdateLinks() {
        try {
            // Load links.json
            const response = await fetch('./assets/links.json');
            if (!response.ok) return;
            
            const links = await response.json();
            
            // Update footer links
            const socialLinks = this.querySelectorAll('.footer__social-link');
            
            if (socialLinks.length >= 4) {
                // EMEA Coffee Team Instagram (first one) - using ro-partners-instagram
                if (links['ro-partners-instagram']) {
                    socialLinks[0].href = links['ro-partners-instagram'].replace('$0', '');
                }
                
                // Coffee Ambassador Instagram (second one) - using editor-instagram
                if (links['editor-instagram']) {
                    socialLinks[1].href = links['editor-instagram'].replace('$0', '');
                }
                
                // BrewCrew Podcast YouTube
                if (links['youtube-poscast']) {
                    socialLinks[2].href = links['youtube-poscast'].replace('$0', '');
                }
                
                // EMEA Coffee Team YouTube
                if (links['emea-youtube']) {
                    socialLinks[3].href = links['emea-youtube'].replace('$0', '');
                }
            }
        } catch (error) {
            console.error('Error loading footer links:', error);
        }
    }
}

customElements.define('loaded-footer', MyFooter)