class MyHeader extends HTMLElement{
    connectedCallback(){
        // relative path from this JS file to the header HTML
        const headerPath = 'source/html/components/header.html'

        console.log('Loading header from:', headerPath)
        fetch(headerPath)
            .then(res => {
                console.log('Header fetch response:', res.status, res.statusText)
                if (!res.ok) throw new Error(`Failed to fetch header: ${res.status} ${res.statusText}`)
                return res.text()
            })
            .then(html => {
                console.log('Header loaded successfully')
                this.innerHTML = html
            })
            .catch(err => {
                console.error('Error loading header:', err)
                // Fallback content so the element isn't empty
                this.innerHTML = '<!-- header failed to load -->'
            })
    }
}

customElements.define('loaded-header', MyHeader)