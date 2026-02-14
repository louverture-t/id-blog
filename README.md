# Infectious Disease News Blog

A Node.js static site generator for infectious disease news and updates, built with EJS templates, Marked.js, Grunt, and SASS.

## Features

- **Markdown to HTML**: Write posts in Markdown with YAML frontmatter
- **Responsive Design**: Mobile-first layout with hamburger navigation
- **Build Automation**: Grunt pipeline for SASS compilation, JS/CSS minification, and image optimization
- **Live Reloading**: Development server with file watching
- **SEO**: Open Graph, Twitter Cards, JSON-LD structured data, sitemap.xml, RSS feed
- **Pagination**: Index page paginates at 6 posts per page
- **Tag System**: Auto-generated tag pages from post frontmatter
- **Related Posts**: Shows up to 3 related articles based on shared tags
- **Search**: Client-side article search
- **Social Sharing**: Twitter, Facebook, LinkedIn, copy link
- **Dark/Light Mode**: Theme toggle with localStorage persistence
- **404 Page**: Styled error page for missing routes

## Project Structure

```
id-blog/
├── src/
│   ├── content/              # Markdown blog posts
│   │   ├── posts/            # Posts subdirectory (default for new posts)
│   │   └── *.md              # Root-level content
│   ├── templates/            # EJS templates
│   │   ├── index.ejs         # Homepage with pagination
│   │   ├── post.ejs          # Individual post page
│   │   ├── layout.ejs        # Shared layout (navbar, footer, meta)
│   │   ├── tag.ejs           # Tag listing page
│   │   └── 404.ejs           # Error page
│   └── assets/
│       ├── css/main.scss     # SASS stylesheet
│       ├── js/main.js        # Client-side JavaScript
│       └── images/           # Image assets
├── docs/                     # Generated output (deployed to GitHub Pages)
├── test/                     # Jest test suite
├── site.config.json          # Site URL and metadata config
├── Gruntfile.js              # Grunt task configuration
├── index.js                  # Static site generator
├── server.js                 # Express dev server
├── .eslintrc.json            # ESLint config
├── .prettierrc               # Prettier config
└── .github/workflows/
    └── deploy.yml            # GitHub Actions CI/CD
```

## Quick Start

### Prerequisites

- Node.js v18+
- npm

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

This runs the Grunt pipeline (SASS, minify, copy assets) then generates all HTML pages, sitemap, RSS feed, tag pages, and 404 page into `docs/`.

### Development

```bash
npm run dev
```

Starts a dev server at `http://localhost:3000` with live reload and file watching.

## Creating Posts

```bash
# Create in src/content/posts/ (default)
npm run new-blog "Ebola Outbreak Update"

# Create in src/content/ (root)
node index.js new-post "Post Title" --no-posts
```

### Frontmatter

```markdown
---
type: "post"
title: "Your Post Title"
date: "2025-10-05"
author: "ID Blog Team"
category: "Breaking News"
description: "Brief description for SEO"
tags: ["infectious-disease", "health", "news"]
---
```

| Field         | Required | Description                                        |
|---------------|----------|----------------------------------------------------|
| `title`       | Yes      | Post title                                         |
| `date`        | Yes      | Publication date (YYYY-MM-DD)                      |
| `author`      | No       | Author name (default: "ID Blog Team")              |
| `category`    | No       | Category badge (Breaking News, Research, etc.)     |
| `description` | No       | SEO description and excerpt                        |
| `tags`        | No       | Array of tags for tag pages and related posts       |

## Available Scripts

| Script             | Command                | Description                              |
|--------------------|------------------------|------------------------------------------|
| `npm run build`    | `grunt`                | Full build (Grunt + site generation)     |
| `npm run build:site` | `node index.js build` | Site generation only (no Grunt)         |
| `npm run dev`      | `grunt dev`            | Dev server with live reload              |
| `npm run dev-simple` | `node server.js`     | Simple Express dev server                |
| `npm test`         | `jest`                 | Run test suite                           |
| `npm run lint`     | `eslint .`             | Lint JavaScript files                    |
| `npm run format`   | `prettier --write .`   | Format code with Prettier                |
| `npm run new-blog` | `node index.js new-post --posts` | Create new post             |

## Configuration

### site.config.json

```json
{
  "siteUrl": "https://id-blog.github.io",
  "siteName": "Infectious Disease News",
  "siteDescription": "Latest infectious disease news and updates"
}
```

`siteUrl` is used in meta tags, sitemap, RSS feed, and JSON-LD structured data. No trailing slash.

### SASS Variables

Customize colors and layout in `src/assets/css/main.scss`:

```scss
$primary-color: #e74c3c;       // Red — alerts/danger
$secondary-color: #34495e;     // Dark blue-gray
$accent-color: #3498db;        // Blue — links/buttons
$success-color: #27ae60;       // Green
$warning-color: #f39c12;       // Orange
$container-max-width: 1200px;
```

## Build Output

The `docs/` directory contains the complete static site:

```
docs/
├── index.html                 # Page 1 of posts
├── page/2.html                # Page 2+ (if enough posts)
├── posts/*.html               # Individual post pages
├── tags/*.html                # Tag listing pages
├── 404.html                   # Error page
├── sitemap.xml                # XML sitemap
├── feed.xml                   # RSS 2.0 feed
└── assets/                    # Compiled CSS, JS, images
```

## Deployment

### GitHub Pages (Automated)

Push to `main` triggers the GitHub Actions workflow which builds and deploys to GitHub Pages automatically.

### Manual

1. `npm run build`
2. Deploy the `docs/` folder to any static hosting (Netlify, Vercel, S3, etc.)

## Testing

```bash
npm test
```

26 tests covering:
- Site config validation
- Frontmatter parsing across all markdown files
- Markdown to HTML conversion
- Generator class instantiation and methods
- Template existence and correctness
- Tag system, related posts, JSON-LD, placeholder cleanup

## Content Guidelines

- Cite authoritative sources (WHO, CDC, peer-reviewed journals)
- Include publication dates
- Use clear, accessible language
- Provide context for technical terms

## Resources

- [WHO](https://www.who.int/) | [CDC](https://www.cdc.gov/) | [ECDC](https://www.ecdc.europa.eu/)
- [Node.js](https://nodejs.org/docs/) | [Grunt.js](https://gruntjs.com/) | [EJS](https://ejs.co/) | [Marked](https://marked.js.org/) | [SASS](https://sass-lang.com/guide)

## License

MIT

---

**Disclaimer**: This blog is for informational purposes only. Always consult healthcare professionals for medical advice. Verify content against official health authority sources.
