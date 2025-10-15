class MyHeader extends HTMLElement{
    connectedCallback(){
        // Determine path based on current location
        const currentPath = window.location.pathname;
        let headerPath;
        let assetsPrefix;
        let indexPath;
        let pagesPrefix;
        
        // If we're in a subdirectory (contains /source/html/pages/)
        if (currentPath.includes('/source/html/pages/')) {
            headerPath = '../components/header.html';
            assetsPrefix = '../../../assets/';
            indexPath = '../../../index.html';
            pagesPrefix = '../pages/';
        } else {
            // We're at root level
            headerPath = './source/html/components/header.html';
            assetsPrefix = './assets/';
            indexPath = './index.html';
            pagesPrefix = './source/html/pages/';
        }

        fetch(headerPath)
            .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch header: ${res.status} ${res.statusText}`)
                return res.text()
            })
            .then(html => {
                // Replace all asset paths with the correct prefix
                let correctedHtml = html.replace(/\.\.\/\.\.\/\.\.\/assets\//g, assetsPrefix);
                // Replace index.html link
                correctedHtml = correctedHtml.replace(/href="\.\.\/\.\.\/\.\.\/index\.html"/g, `href="${indexPath}"`);
                // Replace page links
                correctedHtml = correctedHtml.replace(/href="\.\.\/pages\//g, `href="${pagesPrefix}`);
                
                console.log('Header loaded from:', headerPath);
                console.log('Assets prefix:', assetsPrefix);
                console.log('Corrected HTML:', correctedHtml.substring(0, 500));
                
                this.innerHTML = correctedHtml;
            })
            .catch(err => {
                console.error('Error loading header:', err)
                // Fallback content so the element isn't empty
                this.innerHTML = '<!-- header failed to load -->'
            })
    }
}

customElements.define('loaded-header', MyHeader)