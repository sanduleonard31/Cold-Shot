class MyFooter extends HTMLElement{
    connectedCallback(){
        // relative path from this JS file to the header HTML
        const headerPath = '/source/html/components/footer.html'

        fetch(headerPath)
            .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch header: ${res.status} ${res.statusText}`)
                return res.text()
            })
            .then(html => this.innerHTML = html)
            .catch(err => {
                console.error('Error loading header:', err)
                // Fallback content so the element isn't empty
                this.innerHTML = '<!-- header failed to load -->'
            })
    }
}

customElements.define('loaded-footer', MyFooter)