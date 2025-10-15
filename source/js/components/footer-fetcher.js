class MyFooter extends HTMLElement{
    connectedCallback(){
        // Determine path based on current location
        const currentPath = window.location.pathname;
        let footerPath;
        let assetsPrefix;
        
        // If we're in a subdirectory (contains /source/html/pages/)
        if (currentPath.includes('/source/html/pages/')) {
            footerPath = '../components/footer.html';
            assetsPrefix = '../../../assets/';
        } else {
            // We're at root level
            footerPath = './source/html/components/footer.html';
            assetsPrefix = './assets/';
        }

        fetch(footerPath)
            .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch footer: ${res.status} ${res.statusText}`)
                return res.text()
            })
            .then(html => {
                // Replace all asset paths with the correct prefix
                const correctedHtml = html.replace(/\.\.\/\.\.\/\.\.\/assets\//g, assetsPrefix);
                this.innerHTML = correctedHtml;
            })
            .catch(err => {
                console.error('Error loading footer:', err)
                // Fallback content so the element isn't empty
                this.innerHTML = '<!-- footer failed to load -->'
            })
    }
}

customElements.define('loaded-footer', MyFooter)