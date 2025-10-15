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
            .then(html => this.innerHTML = html)
            .catch(err => {
                console.error('Error loading footer:', err)
                // Fallback content so the element isn't empty
                this.innerHTML = '<!-- footer failed to load -->'
            })
    }
}

customElements.define('loaded-footer', MyFooter)