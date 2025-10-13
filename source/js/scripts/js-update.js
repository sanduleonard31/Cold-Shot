const fs = require('fs');
const path = require('path');

// Project layout assumptions: project root contains index.html
const projectRoot = path.resolve(__dirname, '../../../');
const indexPath = path.join(projectRoot, 'index.html');
const componentsDir = path.join(projectRoot, 'source/js/components');
const pagesDir = path.join(projectRoot, 'source/html/pages');

function listFiles(dir, ext) {
    try {
        return fs.readdirSync(dir)
            .filter(name => name.toLowerCase().endsWith(ext))
            .map(name => path.join(dir, name));
    } catch (e) {
        return [];
    }
}

function readFile(p) {
    try { return fs.readFileSync(p, 'utf8'); } catch (e) { return null; }
}

function writeFile(p, content) {
    fs.writeFileSync(p, content, 'utf8');
}

function removeOldInjections(html) {
    // Remove script tags that point to js/components (any relative path)
    html = html.replace(/<script\b[^>]*\bsrc=["'][^"']*js\/components\/[^"']*["'][^>]*>\s*<\/script>\s*/gi, '');
    // Remove template blocks with id starting with page-
    html = html.replace(/<template\b[^>]*id=["']page-[^"']*["'][\s\S]*?<\/template>\s*/gi, '');
    return html;
}

function insertScriptsIntoHtml(html, scriptsHtml) {
    // If there's an empty <script></script> placeholder, replace it
    if (/<script\s*>\s*<\/script>/i.test(html)) {
        return html.replace(/<script\s*>\s*<\/script>/i, scriptsHtml);
    }
    // Otherwise, insert before </body> if present
    if (html.includes('</body>')) {
        return html.replace('</body>', scriptsHtml + '\n</body>');
    }
    // Fallback: append
    return html + '\n' + scriptsHtml;
}

function buildScriptsForTarget(targetPath, componentFiles) {
    const targetDir = path.dirname(targetPath);
    return componentFiles.map(c => {
        const rel = path.relative(targetDir, c).split(path.sep).join('/');
        return `<script src="${rel}"></script>`;
    }).join('\n');
}

function updateFileWithScripts(targetPath, componentFiles) {
    const html = readFile(targetPath);
    if (html === null) {
        console.warn('Cannot read', targetPath);
        return;
    }

    let cleaned = removeOldInjections(html);
    const scriptsHtml = buildScriptsForTarget(targetPath, componentFiles);
    const updated = insertScriptsIntoHtml(cleaned, scriptsHtml);

    writeFile(targetPath, updated);
    console.log('Updated', targetPath);
}

function main() {
    const componentFiles = listFiles(componentsDir, '.js');
    if (componentFiles.length === 0) {
        console.warn('No component JS files found in', componentsDir);
    }

    // Update index.html (project root)
    if (!fs.existsSync(indexPath)) {
        console.error('index.html not found at', indexPath);
        process.exit(1);
    }
    updateFileWithScripts(indexPath, componentFiles);

    // Update each page file in source/html/pages
    const pageFiles = listFiles(pagesDir, '.html');
    if (pageFiles.length === 0) {
        console.warn('No page HTML files found in', pagesDir);
    }

    pageFiles.forEach(page => updateFileWithScripts(page, componentFiles));

    console.log('Done. Injected', componentFiles.length, 'scripts into index and', pageFiles.length, 'pages.');
}

main();
