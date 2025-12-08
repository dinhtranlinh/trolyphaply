# PWA Icon Generation Instructions

The file `icon.svg` contains a placeholder SVG icon with:

- Legal theme (scales of justice)
- Navy background (#0B3B70)
- Gold accent (#E5A100)
- "Trợ Lý" text

## To Generate PNG Icons:

### Option 1: Using Online Tool

1. Go to https://realfavicongenerator.net/
2. Upload `public/icon.svg`
3. Select "PWA" options
4. Generate and download
5. Copy `icon-192x192.png` and `icon-512x512.png` to `public/` folder

### Option 2: Using ImageMagick (if installed)

```bash
# Convert SVG to PNG
magick convert -density 300 -background none public/icon.svg -resize 192x192 public/icon-192x192.png
magick convert -density 300 -background none public/icon.svg -resize 512x512 public/icon-512x512.png
```

### Option 3: Using Figma/Illustrator

1. Open `public/icon.svg` in Figma or Illustrator
2. Export as PNG:
   - 192x192px → `icon-192x192.png`
   - 512x512px → `icon-512x512.png`
3. Save to `public/` folder

### Option 4: Use PWA Asset Generator (npm)

```bash
npx @vite-pwa/assets-generator --preset minimal public/icon.svg
```

## Required Files:

- `public/icon-192x192.png` - For Android home screen
- `public/icon-512x512.png` - For splash screen and high-res displays

## Note:

Until real PNG files are created, the PWA will use the SVG as fallback (browsers support SVG icons).
