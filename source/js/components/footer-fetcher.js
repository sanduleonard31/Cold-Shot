class MyFooter extends HTMLElement{
    connectedCallback(){
        // relative path from this JS file to the footer HTML
        const footerPath = 'source/html/components/footer.html'

        console.log('Loading footer from:', footerPath)
        fetch(footerPath)
            .then(res => {
                console.log('Footer fetch response:', res.status, res.statusText)
                if (!res.ok) throw new Error(`Failed to fetch footer: ${res.status} ${res.statusText}`)
                return res.text()
            })
            .then(html => {
                console.log('Footer loaded successfully')
                this.innerHTML = html
            })
            .catch(err => {
                console.error('Error loading footer:', err)
                // Fallback content so the element isn't empty
                this.innerHTML = '<!-- footer failed to load -->'
            })
    }
}

customElements.define('loaded-footer', MyFooter)