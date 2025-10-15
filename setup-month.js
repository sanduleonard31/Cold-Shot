#!/usr/bin/env node

/**
 * Month Setup Utility
 * Creates a new month folder with all necessary structure
 * Usage: node setup-month.js [MM.YYYY]
 */

const fs = require('fs');
const path = require('path');

// Get month from command line or use current month
const args = process.argv.slice(2);
const monthArg = args[0];

let month, year;
if (monthArg && /^\d{2}\.\d{4}$/.test(monthArg)) {
    [month, year] = monthArg.split('.');
} else {
    const date = new Date();
    month = String(date.getMonth() + 1).padStart(2, '0');
    year = String(date.getFullYear());
}

const monthFolder = `${month}.${year}`;
const basePath = path.join(__dirname, '..', 'media', monthFolder);

console.log(`\n🎉 Setting up month: ${monthFolder}\n`);

// Create folder structure
const folders = [
    'champion',
    'editor',
    'matcha-zone',
    'knowledge bites',
    'spread-kindness',
    'master-speaks',
    'changing-timezones',
    'projects',
    'featured'
];

// Create base folder
if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
    console.log(`✅ Created: ${monthFolder}/`);
} else {
    console.log(`⚠️  Folder already exists: ${monthFolder}/`);
}

// Create sections.json
const sectionsJson = {
    sections: [
        {
            id: "champion",
            title: "Champion's Word",
            row: 1,
            theme: "legendary",
            layout: "column",
            folder: "champion",
            description: "Words of wisdom from our National Champion"
        },
        {
            id: "editor",
            title: "Editor's Word",
            row: 1,
            theme: "important",
            layout: "column",
            folder: "editor",
            description: "Insights from the Coffee & Craft Leader"
        },
        {
            id: "matcha-zone",
            title: "Matcha Zone",
            row: 2,
            theme: "caring",
            layout: "column",
            folder: "matcha-zone",
            description: "Dive into the world of matcha"
        },
        {
            id: "knowledge-bites",
            title: "Knowledge Bites",
            row: 3,
            theme: "astral",
            layout: "column",
            folder: "knowledge bites",
            description: "Quick coffee facts to expand your knowledge"
        },
        {
            id: "spread-kindness",
            title: "Spread Kindness",
            row: 4,
            theme: "love",
            layout: "column",
            folder: "spread-kindness",
            description: "Heartwarming stories from our community"
        },
        {
            id: "master-speaks",
            title: "Master Speaks",
            row: 5,
            theme: "hard",
            layout: "row",
            folder: "master-speaks",
            description: "Coffee Masters share their journey"
        },
        {
            id: "changing-timezones",
            title: "Changing Timezones",
            row: 6,
            theme: "event",
            layout: "row",
            folder: "changing-timezones",
            description: "Coffee Masters through time"
        },
        {
            id: "projects",
            title: "Projects",
            row: 7,
            theme: "action",
            layout: "dropdown",
            folder: "projects",
            description: "Explore our ongoing coffee projects"
        },
        {
            id: "featured",
            title: "Featured",
            row: 8,
            theme: "news",
            layout: "dynamic",
            folder: "featured",
            description: "Latest highlights and announcements"
        }
    ]
};

const sectionsPath = path.join(basePath, 'sections.json');
fs.writeFileSync(sectionsPath, JSON.stringify(sectionsJson, null, 2));
console.log(`✅ Created: sections.json`);

// Create section folders
folders.forEach(folder => {
    const folderPath = path.join(basePath, folder);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        console.log(`✅ Created: ${folder}/`);
    }
});

// Create README in each section folder
const readmeTemplate = (sectionName) => `# ${sectionName}

Add your content here:
- Required: JSON file with content data
- Optional: Images (.png, .jpg)
- Optional: PDFs for documents

See CONTENT_SYSTEM_README.md for details.
`;

folders.forEach(folder => {
    const readmePath = path.join(basePath, folder, 'README.md');
    if (!fs.existsSync(readmePath)) {
        fs.writeFileSync(readmePath, readmeTemplate(folder));
    }
});

console.log(`\n✨ Month setup complete!\n`);
console.log(`📂 Location: media/${monthFolder}/`);
console.log(`\n📝 Next steps:`);
console.log(`   1. Add content to section folders`);
console.log(`   2. Create JSON files with your data`);
console.log(`   3. Add images and PDFs as needed`);
console.log(`\n📖 See QUICK_START.md for templates\n`);
