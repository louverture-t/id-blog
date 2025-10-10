# Sample Images Placeholder

Since we can't generate actual images through this interface, I'll document what images should be added to make the blog complete:

## Required Images for src/assets/images/:

1. **favicon.ico** - Website favicon (microscope or virus icon)
2. **og-image.jpg** - Open Graph image for social sharing (1200x630px)
3. **hero-bg.jpg** - Hero section background (optional)
4. **category-icons/** - Individual category icons
5. **author-avatars/** - Author profile pictures

## Existing Images:
- hitech picture.png
- in lab .png

These images are already copied to the docs/assets/images/ folder by the build process.

## Image Optimization:
The Grunt imagemin task automatically optimizes all images during the build process, reducing file sizes while maintaining quality.