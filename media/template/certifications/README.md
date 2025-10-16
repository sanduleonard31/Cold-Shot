# Certifications Folder Structure

This folder contains announcements for newly certified Coffee Masters.

## Structure

Each certification announcement should be in its own subfolder with:
- `text.json` - Required: Contains title and description
- `picture.png` - Optional: Photo of the new Coffee Master

## Example

```
certifications/
├── featured-items.json (list of folders)
├── New Coffee Master - Name/
│   ├── text.json
│   └── picture.png
└── Another Coffee Master/
    ├── text.json
    └── picture.png
```

## text.json Format

```json
{
    "title": "New Coffee Master - Name",
    "description": "Description of their journey and achievements..."
}
```

## featured-items.json Format

```json
{
  "folders": [
    "New Coffee Master - Name",
    "Another Coffee Master"
  ]
}
```

## Notes

- Folder names can include spaces and special characters
- The title in text.json will be displayed as the card heading
- Description will be the card content
- Image is optional but recommended
- Images will be lazy-loaded for performance
