# 🦠 Infectious Disease News Blog

A Node.js-based static site generator specifically designed for infectious disease news and updates, featuring modern web development tools and automated build processes.

## ✨ Features

- **📝 Markdown to HTML Conversion**: Write content in Markdown and automatically generate HTML pages
- **🎨 Responsive Design**: Modern, mobile-first design with infectious disease theme
- **⚡ Build Automation**: Grunt.js tasks for SASS compilation, minification, and optimization
- **🔄 Live Reloading**: Development server with automatic browser refresh
- **📱 SEO Optimized**: Meta tags, Open Graph, and Twitter Cards support
- **🔍 Search Functionality**: Client-side search through articles
- **📊 Analytics Ready**: Built-in tracking for page views and user interactions
- **🎯 Category System**: Organize content by disease type and news category
- **📲 Social Sharing**: Built-in social media sharing buttons
- **🌙 Theme Toggle**: Dark/light mode support
- **📧 Newsletter Signup**: Email subscription functionality (demo)

## 🏗️ Project Structure

```
infectious-disease-blog/
├── src/                          # Source files
│   ├── content/                  # Markdown blog posts
│   │   ├── covid19-variant-xbb15.md
│   │   ├── malaria-vaccine-breakthrough.md
│   │   └── hand-hygiene-prevention.md
│   ├── templates/                # EJS templates
│   │   ├── index.ejs            # Homepage template
│   │   ├── post.ejs             # Individual post template
│   │   └── layout.ejs           # Base layout (optional)
│   └── assets/                   # Static assets
│       ├── css/
│       │   └── main.scss        # Main SASS stylesheet
│       ├── js/
│       │   └── main.js          # JavaScript functionality
│       └── images/              # Image assets
├── docs/                         # Generated static site (output)
├── Gruntfile.js                  # Grunt task configuration
├── package.json                  # Dependencies and scripts
├── index.js                      # Main site generator
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   cd week6-capstoneBlog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the site**
   ```bash
   npm run build
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` to view your blog

## 📝 Creating Content

### Creating a New Post

Use the built-in CLI to create new posts:

```bash
# Create a new post
npm run new-post "Your Post Title"

# Or use Node.js directly
node index.js new-post "Ebola Outbreak Update"
```

This creates a new Markdown file in `src/content/` with the following frontmatter:

```markdown
---
title: "Your Post Title"
date: "2025-10-05"
author: "Disease Reporter"
category: "Breaking News"
description: "Latest updates on Your Post Title"
---

# Your Post Title

Write your infectious disease news content here...
```

### Frontmatter Options

Configure your posts with these frontmatter fields:

- **title**: Post title (required)
- **date**: Publication date
- **author**: Author name
- **category**: Content category (Breaking News, Research, Prevention, Vaccines)
- **description**: SEO description and excerpt

### Supported Categories

The blog includes predefined styles for these categories:

- **Breaking News** (🚨): Urgent disease outbreaks and alerts
- **Research** (🔬): Medical research and clinical studies
- **Prevention** (🛡️): Public health measures and guidelines
- **Vaccines** (💉): Vaccine development and distribution news
- **General**: Other infectious disease content

## 🛠️ Development Workflow

### Available Scripts

```bash
# Build the static site
npm run build

# Start development server with live reload
npm run dev

# Create a new blog post
npm run new-post "Post Title"

# Run Grunt tasks
npm start
```

### Grunt Tasks

The project includes comprehensive Grunt automation:

- **SASS Compilation**: `src/assets/css/main.scss` → `docs/assets/css/main.css`
- **CSS Minification**: Creates `main.min.css` for production
- **JavaScript Minification**: Minifies and combines JS files
- **Image Optimization**: Compresses images for web delivery
- **Live Reloading**: Automatic browser refresh during development
- **File Watching**: Monitors changes and rebuilds automatically

### Development Server

The development server includes:

- **Port**: 3000 (configurable in Gruntfile.js)
- **Live Reload**: Automatic browser refresh
- **Base Directory**: `docs/` (generated output)
- **Auto-open**: Opens browser automatically

## 🎨 Customization

### Styling

Modify the SASS variables in `src/assets/css/main.scss`:

```scss
// Brand colors
$primary-color: #e74c3c;      // Red for alerts/danger
$secondary-color: #34495e;    // Dark blue-gray
$accent-color: #3498db;       // Blue for links
$success-color: #27ae60;      // Green for success
$warning-color: #f39c12;      // Orange for warnings

// Typography
$font-family-sans: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

// Layout
$container-max-width: 1200px;
$border-radius: 8px;
```

### Templates

Customize the EJS templates in `src/templates/`:

- **index.ejs**: Homepage layout and post listing
- **post.ejs**: Individual post page layout
- **layout.ejs**: Shared layout components (optional base template)

### JavaScript Features

The `src/assets/js/main.js` includes:

- Search functionality
- Social sharing
- Theme toggle
- Newsletter signup
- Reading progress indicator
- Lazy loading
- Analytics tracking

## 📊 Content Management

### Blog Post Structure

Each Markdown file supports:

- **Headers**: H1-H6 with automatic styling
- **Lists**: Bulleted and numbered lists
- **Links**: Internal and external links
- **Images**: Responsive image handling
- **Code**: Inline and block code formatting
- **Blockquotes**: Styled quotations
- **Tables**: Responsive table layouts

### SEO Features

Built-in SEO optimization includes:

- Meta descriptions from frontmatter
- Open Graph tags for social sharing
- Twitter Card support
- Semantic HTML structure
- Clean URLs
- Sitemap generation (can be added)

## 🌐 Deployment

### GitHub Pages

1. **Build the site**
   ```bash
   npm run build
   ```

2. **Commit the docs/ folder**
   ```bash
   git add docs/
   git commit -m "Update site build"
   git push
   ```

3. **Configure GitHub Pages**
   - Go to repository settings
   - Set source to `docs/` folder
   - Your site will be available at `https://username.github.io/repository`

### Other Hosting Platforms

The generated `docs/` folder can be deployed to:

- **Netlify**: Drag and drop the docs/ folder
- **Vercel**: Connect your GitHub repository
- **AWS S3**: Upload docs/ contents to S3 bucket
- **Traditional Web Hosting**: Upload via FTP

## 🔧 Configuration

### Grunt Configuration

Modify `Gruntfile.js` to customize build tasks:

```javascript
// Example: Change output paths
sass: {
    dist: {
        files: {
            'docs/assets/css/styles.css': 'src/assets/css/main.scss'
        }
    }
}

// Example: Add new tasks
copy: {
    fonts: {
        expand: true,
        cwd: 'src/assets/fonts/',
        src: ['**/*'],
        dest: 'docs/assets/fonts/'
    }
}
```

### Site Generator Options

Customize the site generator in `index.js`:

```javascript
class InfectiousDiseaseGenerator {
    constructor() {
        // Customize paths
        this.srcDir = path.join(__dirname, 'src');
        this.outputDir = path.join(__dirname, 'dist'); // Change output
        
        // Add custom processing
        this.customOptions = {
            dateFormat: 'YYYY-MM-DD',
            excerptLength: 150,
            postsPerPage: 10
        };
    }
}
```

## 🧪 Advanced Features

### Custom Post Types

Extend the generator to support different content types:

```javascript
// In index.js
async generatePages() {
    // Handle different content types
    const contentTypes = ['posts', 'pages', 'alerts'];
    // Implementation here
}
```

### Plugin System

Add custom plugins for additional functionality:

```javascript
// Example plugin structure
const plugins = [
    require('./plugins/rss-generator'),
    require('./plugins/sitemap-generator'),
    require('./plugins/search-index')
];
```

### API Integration

Connect to external APIs for live data:

```javascript
// Example: WHO disease outbreak API
async fetchLiveOutbreaks() {
    const response = await fetch('https://disease-api.who.int/outbreaks');
    const data = await response.json();
    // Process and display data
}
```

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style

- Use ES6+ JavaScript features
- Follow existing SASS/CSS conventions
- Write semantic HTML
- Include JSDoc comments for functions
- Test on multiple browsers

### Content Guidelines

For infectious disease content:

- Cite authoritative sources (WHO, CDC, peer-reviewed journals)
- Include publication dates
- Use clear, accessible language
- Provide context for technical terms
- Include relevant links and references

## 📚 Resources

### Infectious Disease Sources

- [World Health Organization (WHO)](https://www.who.int/)
- [Centers for Disease Control (CDC)](https://www.cdc.gov/)
- [European Centre for Disease Prevention and Control (ECDC)](https://www.ecdc.europa.eu/)
- [New England Journal of Medicine](https://www.nejm.org/)
- [The Lancet Infectious Diseases](https://www.thelancet.com/journals/laninf)

### Technical Documentation

- [Node.js Documentation](https://nodejs.org/docs/)
- [Grunt.js Guide](https://gruntjs.com/getting-started)
- [EJS Template Engine](https://ejs.co/)
- [Marked Markdown Parser](https://marked.js.org/)
- [SASS/SCSS Guide](https://sass-lang.com/guide)

## 🐛 Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**SASS Compilation Errors**
- Check syntax in `main.scss`
- Ensure all imports exist
- Verify variable declarations

**Template Errors**
- Check EJS syntax in templates
- Ensure all variables are defined
- Validate file paths

**Live Reload Not Working**
- Check if port 3000 is available
- Verify Grunt watch task configuration
- Restart the development server

### Performance Optimization

- Optimize images before adding to `src/assets/images/`
- Minimize custom CSS/JS additions
- Use CDN for external resources
- Enable GZIP compression on server
- Monitor bundle sizes

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🙏 Acknowledgments

- World Health Organization for disease classification guidelines
- Centers for Disease Control for prevention best practices
- Open source community for tools and libraries
- Medical professionals providing accurate information

---

**⚠️ Medical Disclaimer**: This blog is for informational purposes only. Always consult healthcare professionals for medical advice. Content should be verified against official health authority sources.