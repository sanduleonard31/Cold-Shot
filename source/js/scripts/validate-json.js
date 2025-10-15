#!/usr/bin/env node

/**
 * JSON Validator
 * Validates all JSON files in a month folder
 * Usage: node validate-json.js [MM.YYYY]
 */

const fs = require('fs');
const path = require('path');

// Get month from command line
const args = process.argv.slice(2);
const monthArg = args[0];

if (!monthArg || !/^\d{2}\.\d{4}$/.test(monthArg)) {
    console.error('❌ Please provide month in format MM.YYYY');
    console.log('   Example: node validate-json.js 08.2025');
    process.exit(1);
}

const monthFolder = monthArg;
const basePath = path.join(__dirname, 'media', monthFolder);

console.log(`\n🔍 Validating JSON files for: ${monthFolder}\n`);

if (!fs.existsSync(basePath)) {
    console.error(`❌ Folder not found: ${basePath}`);
    process.exit(1);
}

let totalFiles = 0;
let validFiles = 0;
let errors = [];

function validateJSON(filePath) {
    totalFiles++;
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content);
        validFiles++;
        console.log(`✅ ${path.relative(basePath, filePath)}`);
        return true;
    } catch (error) {
        const relativePath = path.relative(basePath, filePath);
        console.error(`❌ ${relativePath}`);
        console.error(`   Error: ${error.message}`);
        errors.push({ file: relativePath, error: error.message });
        return false;
    }
}

function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
            scanDirectory(itemPath);
        } else if (item.endsWith('.json')) {
            validateJSON(itemPath);
        }
    });
}

// Start scanning
scanDirectory(basePath);

// Print summary
console.log(`\n${'='.repeat(50)}`);
console.log(`📊 Validation Summary`);
console.log(`${'='.repeat(50)}`);
console.log(`Total JSON files: ${totalFiles}`);
console.log(`Valid files: ${validFiles}`);
console.log(`Invalid files: ${totalFiles - validFiles}`);

if (errors.length > 0) {
    console.log(`\n❌ Errors found in ${errors.length} file(s):\n`);
    errors.forEach(({ file, error }) => {
        console.log(`   ${file}`);
        console.log(`   └─ ${error}\n`);
    });
    console.log(`\n💡 Tip: Use https://jsonlint.com to fix JSON syntax`);
    process.exit(1);
} else {
    console.log(`\n✨ All JSON files are valid!\n`);
    process.exit(0);
}
