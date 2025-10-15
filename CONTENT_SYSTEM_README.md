# Dynamic Content System Documentation

## Overview
This system automatically loads and displays content based on folder structure and JSON configuration files. It's designed to be flexible and adapt to different types of media (text, images, PDFs) without requiring code changes.

## Folder Structure

```
media/
├── [MONTH.YEAR]/          # e.g., 08.2025, 10.2025
│   ├── sections.json      # Configuration for all sections
│   ├── champion/          # Section folder
│   │   ├── champion.json  # Content data
│   │   └── champion.png   # Optional image
│   ├── editor/
│   ├── matcha-zone/
│   ├── knowledge bites/
│   ├── spread-kindness/
│   ├── master-speaks/
│   ├── changing-timezones/
│   ├── projects/
│   │   ├── project-1/     # Individual project
│   │   │   ├── text.json
│   │   │   ├── picture.png
│   │   │   └── project.pdf
│   │   ├── project-2/
│   │   └── ...
│   └── featured/
│       ├── launch/        # Featured item
│       │   ├── text.json
│       │   ├── picture.png
│       │   └── project.pdf
│       └── ...
```

## sections.json Configuration

Each month folder must have a `sections.json` file:

```json
{
  "sections": [
    {
      "id": "unique-id",
      "title": "Display Title",
      "row": 1,
      "theme": "love",
      "layout": "column",
      "folder": "folder-name",
      "description": "Section description"
    }
  ]
}
```

### Properties:
- **id**: Unique identifier for the section
- **title**: Display title shown on the page
- **row**: Row number (sections with same row share space)
- **theme**: Visual theme (see themes below)
- **layout**: How content is displayed (column/row/dropdown/dynamic)
- **folder**: Folder name in media/[MONTH]/
- **description**: Brief description of the section

## Available Themes

Each theme has unique colors, gradients, and styling:

| Theme | Purpose | Color Scheme | Icon |
|-------|---------|--------------|------|
| `love` | Heartwarming content | Pink/Rose | ❤️ |
| `action` | Active projects | Orange/Energy | ⚡ |
| `important` | Critical info | Red/Urgent | ⚠️ |
| `news` | Updates & announcements | Blue/Info | 📰 |
| `caring` | Community & support | Green/Natural | 🌿 |
| `hard` | Challenges & intensity | Dark/Gray | 💪 |
| `astral` | Knowledge & discovery | Purple/Cosmic | ✨ |
| `legendary` | Special recognition | Gold/Premium | 👑 |
| `event` | Events & celebrations | Teal/Celebration | 🎉 |

## Layout Types

### 1. Column Layout (`"layout": "column"`)
- Single card in full width
- Good for: Single messages, quotes, simple content

### 2. Row Layout (`"layout": "row"`)
- Multiple cards side-by-side
- Good for: Comparisons, timelines, multiple items

### 3. Dropdown Layout (`"layout": "dropdown"`)
- Collapsible list of items
- Click to view individual cards
- Good for: Projects, collections

### 4. Dynamic Layout (`"layout": "dynamic"`)
- Automatically detects all folders
- Creates cards for each found item
- Good for: Featured items, varying content

## Content JSON Formats

### Basic Format
```json
{
  "title": "Card Title",
  "content": "Card content text",
  "description": "Additional description"
}
```

### Champion/Editor Format
```json
{
  "name": "Person's Name/Title",
  "title": "Section Title",
  "message": "Quote or message"
}
```

### Knowledge Bites Format
```json
{
  "title": "Knowledge Bites",
  "bites": [
    "Fact 1",
    "Fact 2",
    "Fact 3"
  ]
}
```

### Project Format
```json
{
  "title": "Project Name",
  "description": "Project description"
}
```

### Changing Timezones (Multiple Masters) Format
```json
{
  "master-1": "Name 1",
  "master-1-then": "2024",
  "master-1-then-desc": "Past description",
  "master-1-now-desc": "Current description",
  "master-2": "Name 2",
  "master-2-then": "2023",
  "master-2-then-desc": "Past description",
  "master-2-now-desc": "Current description"
}
```
Images should be named: `master-1-then.png`, `master-1-now.png`, etc.

## Media Detection

The system automatically detects and displays:
- **JSON files**: `.json` (data/text content)
- **Images**: `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`, `.webp`
- **PDFs**: `.pdf` (documents)

### Common File Names
The system looks for these common names:
- `text.json`, `content.json`, `data.json`
- `picture.png`, `image.png`
- `project.pdf`, `document.pdf`

## Adding New Content

### For a New Month:
1. Create folder: `media/[MONTH.YEAR]/`
2. Copy `sections.json` from previous month
3. Create section folders as needed
4. Add content (JSON, images, PDFs)

### For a New Section:
1. Create folder in month directory
2. Add entry to `sections.json`
3. Create content files (at minimum, a JSON file)

### For New Projects:
1. Go to `media/[MONTH]/projects/`
2. Create `project-[N]/` folder (N = next number)
3. Add `text.json` with title and description
4. Optional: Add `picture.png` and `project.pdf`

### For Featured Items:
1. Go to `media/[MONTH]/featured/`
2. Create new folder with descriptive name
3. Add `text.json`, images, and PDFs as needed

## Links Configuration

Edit `assets/links.json` to add external links:

```json
{
  "coffee-master-apply": "https://...",
  "champion-instagram": "https://...",
  "editor-instagram": "https://...",
  "matcha-instagram": "https://...",
  "youtube-podcast": "https://..."
}
```

These links are automatically used in relevant cards.

## JavaScript Implementation

### Main File: `content-loader.js`

```javascript
// Change the month dynamically
const loader = new ContentLoader('10.2025');
loader.init();
```

### Key Methods:
- `loadLinks()`: Loads external links
- `loadSections()`: Loads section configuration
- `detectMedia()`: Automatically finds media files
- `renderSection()`: Creates cards based on layout type
- `loadProjects()`: Loads project dropdown items
- `loadFeaturedItems()`: Loads dynamic featured cards

## Best Practices

### ✅ DO:
- Keep JSON files properly formatted
- Use descriptive folder names
- Include alt text for images
- Test PDFs before uploading
- Follow naming conventions
- Keep file sizes reasonable

### ❌ DON'T:
- Use spaces in folder names (use hyphens)
- Mix different content types in wrong sections
- Forget to update sections.json
- Use very large image files
- Leave empty folders

## Troubleshooting

### Content Not Showing?
1. Check browser console for errors
2. Verify `sections.json` is valid JSON
3. Ensure folder names match exactly
4. Check file names are correct

### Wrong Theme Colors?
1. Verify theme name in `sections.json`
2. Check spelling (case-sensitive)
3. Available: love, action, important, news, caring, hard, astral, legendary, event

### Projects Not Loading?
1. Folders must be named `project-1`, `project-2`, etc.
2. Each must have `text.json`
3. Start numbering from 1 with no gaps

### Images Not Displaying?
1. Check file path is correct
2. Verify file extension (.png, .jpg)
3. Check file exists in correct folder
4. Ensure file isn't corrupted

## Future-Proof Design

The system is designed to handle:
- ✅ New months automatically
- ✅ Different media combinations
- ✅ Variable number of projects
- ✅ Dynamic featured items
- ✅ New section types
- ✅ Missing media gracefully

Simply add content to folders following the structure, and the system adapts automatically!

## Examples

### Minimal Section (Text Only)
```
matcha-zone/
└── text.json
```

### Full Section (All Media)
```
matcha-zone/
├── text.json
├── picture.png
└── project.pdf
```

### Multiple Projects
```
projects/
├── project-1/
│   ├── text.json
│   └── picture.png
├── project-2/
│   ├── text.json
│   ├── picture.png
│   └── project.pdf
└── project-3/
    └── text.json
```

---

**Version:** 1.0  
**Last Updated:** October 2025  
**Author:** Cold Shot Development Team
