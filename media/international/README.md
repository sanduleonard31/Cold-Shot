# International Folder - README

## Overview
The International section displays cards for different international coffee-related content, such as country profiles, international projects, or global coffee initiatives.

## Structure
Each international item is a folder inside `media/international/` with the following files:

```
media/international/
├── international-items.json    # Configuration file listing all folders
└── [folder-name]/
    ├── text.json               # Required: Title and description
    ├── picture.png             # Optional: Card image
    └── [files]                 # Optional: Downloadable resources (PDF, PPTX, etc.)
```

## Adding a New International Item

### Step 1: Create a Folder
Create a new folder inside `media/international/` with a descriptive name (use lowercase and hyphens):
```
media/international/my-new-country/
```

### Step 2: Create text.json
Inside your folder, create a `text.json` file with the following structure:
```json
{
    "title": "Country/Project Name",
    "description": "A detailed description of the content. This will be displayed on the card."
}
```

### Step 3: Add an Image (Optional)
Add an image file named `picture.png` (or `.jpg`, `.jpeg`, `.gif`, `.webp`). This image will be displayed at the top of the card.
- Recommended size: 800x600px or similar 4:3 ratio
- Format: PNG or JPG
- Name: `picture.png` or `picture.jpg`

### Step 4: Add Downloadable Files (Optional)
Add any downloadable resources to the folder:
- PDFs, PowerPoint presentations, Word documents, etc.
- Use descriptive filenames
- Common patterns: `project.pdf`, `document.pdf`, `presentation.pptx`

### Step 5: Update Configuration
Edit `media/international/international-items.json` and add your folder name to the `folders` array:
```json
{
  "folders": [
    "project",
    "my-new-country"
  ]
}
```

## Example

Here's a complete example for a Burundi coffee profile:

**Folder structure:**
```
media/international/burundi/
├── text.json
├── picture.png
└── burundi-profile.pdf
```

**text.json:**
```json
{
    "title": "Burundi: The Heart of African Coffee",
    "description": "A perspective on Burundi, the 'Heart of Africa', and its rapid emergence on the specialty coffee scene. From the first Arabica trees introduced by Belgian colonists in the 1920s, the country now focuses on quality over quantity."
}
```

**international-items.json:**
```json
{
  "folders": [
    "project",
    "burundi"
  ]
}
```

## File Detection
The system automatically detects:
- **Images**: Looks for `picture`, `image`, `cover`, or `thumbnail` with extensions `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`
- **Files**: Looks for common file types (`.pdf`, `.docx`, `.pptx`, `.xlsx`) with common names

## Tips
- Use clear, descriptive titles
- Keep descriptions concise but informative (2-3 sentences)
- Optimize images before uploading (compress to reduce file size)
- Use consistent naming conventions for files
- Test by opening `international.html` in a browser

## Troubleshooting

**Card doesn't appear:**
- Ensure folder name is added to `international-items.json`
- Check that `text.json` exists and is valid JSON
- Verify file permissions

**Image doesn't show:**
- Check image filename matches expected patterns
- Verify image file extension is supported
- Ensure image file exists in the folder

**Download files don't appear:**
- Check file extensions are supported
- Verify files exist in the folder
- Files must be in the root of the item folder
