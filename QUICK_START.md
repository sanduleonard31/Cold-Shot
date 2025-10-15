# Quick Start Guide - Adding Content

## 🚀 Quick Steps

### 1. Choose Current Month
Navigate to: `media/[MONTH.YEAR]/` (e.g., `media/08.2025/`)

### 2. Add to Existing Section
```bash
# Go to section folder
cd media/08.2025/champion/

# Add your files:
# - champion.json (required)
# - champion.png (optional)
# - document.pdf (optional)
```

### 3. Create New Project
```bash
# Go to projects folder
cd media/08.2025/projects/

# Create new folder (use next number)
mkdir project-7

# Add files
cd project-7
# Create text.json with:
{
  "title": "Your Project Title",
  "description": "Project description here"
}

# Add picture.png and project.pdf as needed
```

### 4. Add Featured Item
```bash
# Go to featured folder
cd media/08.2025/featured/

# Create new folder
mkdir holiday-special

# Add text.json, picture.png, and project.pdf
```

## 📋 JSON Templates

### Simple Card
```json
{
  "title": "Card Title",
  "content": "Your content here"
}
```

### Card with Description
```json
{
  "title": "Card Title",
  "description": "Detailed description"
}
```

### Champion/Editor Card
```json
{
  "name": "-----Title Here-----",
  "title": "Section Title",
  "message": "Quote or message"
}
```

### Knowledge Bites
```json
{
  "title": "Knowledge Bites",
  "bites": [
    "Fact 1 here",
    "Fact 2 here",
    "Fact 3 here"
  ]
}
```

## 🎨 Theme Reference

| Theme | Use For | Example |
|-------|---------|---------|
| `legendary` | Champions, awards | Champion's Word |
| `important` | Key messages | Editor's Word |
| `caring` | Wellness, community | Matcha Zone |
| `astral` | Learning, knowledge | Knowledge Bites |
| `love` | Stories, kindness | Spread Kindness |
| `hard` | Challenges, intensity | Master Speaks |
| `event` | Timelines, events | Changing Timezones |
| `action` | Projects, activities | Projects |
| `news` | Updates, featured | Featured |

## 🔗 Adding Links

Edit `assets/links.json`:
```json
{
  "new-link-id": "https://your-url-here.com"
}
```

Use in sections by referencing the ID.

## ✅ Checklist Before Publishing

- [ ] JSON files are valid (use JSONLint.com)
- [ ] Images are optimized (< 2MB each)
- [ ] PDFs are compressed
- [ ] All file names follow convention
- [ ] Folder names use hyphens (not spaces)
- [ ] sections.json is updated if adding new sections
- [ ] Test in browser locally

## 🐛 Common Issues

**Problem:** Content not showing  
**Solution:** Check browser console, verify JSON format

**Problem:** Wrong colors  
**Solution:** Check theme name in sections.json

**Problem:** Image not loading  
**Solution:** Verify file path and extension

**Problem:** Projects not in dropdown  
**Solution:** Ensure folders named project-1, project-2, etc.

## 📞 Need Help?

1. Check `CONTENT_SYSTEM_README.md` for full documentation
2. Look at existing examples in `media/08.2025/`
3. Verify JSON at jsonlint.com
4. Check browser console for error messages

---

**Remember:** The system is flexible! If media doesn't exist, it won't break. Start simple and add more as needed.
