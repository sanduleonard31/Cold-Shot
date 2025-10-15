class MyHeader extends HTMLElement{
    connectedCallback(){
        // Determine path based on current location
        const currentPath = window.location.pathname;
        let headerPath;
        let assetsPrefix;
        
        // If we're in a subdirectory (contains /source/html/pages/)
        if (currentPath.includes('/source/html/pages/')) {
            headerPath = '../components/header.html';
            assetsPrefix = '../../../assets/';
        } else {
            // We're at root level
            headerPath = './source/html/components/header.html';
            assetsPrefix = './assets/';
        }

        fetch(headerPath)
            .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch header: ${res.status} ${res.statusText}`)
                return res.text()
            })
            .then(html => {
                // Replace all asset paths with the correct prefix
                const correctedHtml = html.replace(/\.\.\/\.\.\/\.\.\/assets\//g, assetsPrefix);
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