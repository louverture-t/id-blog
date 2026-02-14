#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const ejs = require('ejs');
const matter = require('gray-matter');
const { program } = require('commander');

class InfectiousDiseaseGenerator {
    constructor() {
        this.srcDir = path.join(__dirname, 'src');
        this.contentDir = path.join(this.srcDir, 'content');
        this.postsDir = path.join(this.contentDir, 'posts');
        this.templatesDir = path.join(this.srcDir, 'templates');
        this.outputDir = path.join(__dirname, 'docs');
        this.postsOutputDir = path.join(this.outputDir, 'posts');
        this.assetsDir = path.join(this.srcDir, 'assets');

        // Load site configuration
        const configPath = path.join(__dirname, 'site.config.json');
        try {
            this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        } catch {
            this.config = {};
        }
        this.siteUrl = (this.config.siteUrl || 'https://id-blog.github.io').replace(/\/+$/, '');
    }

    async build() {
        console.log('🦠 Building Infectious Disease Blog...');

        try {
            // Clean only HTML outputs (keep compiled assets intact)
            await this.cleanHtmlOutputs();

            // Generate individual post pages (with related posts)
            await this.generatePages();

            // Generate index pages (with pagination)
            await this.generateIndex();

            // Generate tag pages
            await this.generateTagPages();

            // Generate sitemap and RSS feed
            await this.generateSitemap();
            await this.generateRssFeed();

            // Generate 404 page
            await this.generate404();

            console.log('✅ Blog built successfully! Output in docs/ folder');
        } catch (error) {
            console.error('❌ Build failed:', error.message);
            process.exit(1);
        }
    }

    // Remove previously generated HTML files while preserving assets
    async cleanHtmlOutputs() {
        // Remove root-level HTML and XML files
        const entries = await fs.readdir(this.outputDir).catch(() => []);
        for (const name of entries) {
            const full = path.join(this.outputDir, name);
            const stat = await fs.stat(full);
            if (stat.isFile() && (name.endsWith('.html') || name.endsWith('.xml'))) {
                await fs.remove(full);
            }
        }
        // Remove posts HTML directory
        await fs.remove(this.postsOutputDir).catch(() => {});
        await fs.ensureDir(this.postsOutputDir);
        // Remove pagination directory
        await fs.remove(path.join(this.outputDir, 'page')).catch(() => {});
        // Remove tags directory
        await fs.remove(path.join(this.outputDir, 'tags')).catch(() => {});
        console.log('🧹 Cleaned HTML outputs');
    }

    // Helper: collect all post data (frontmatter + metadata) for reuse
    async getAllPostsData() {
        const allMarkdownFiles = await this.getAllMarkdownFiles();
        const posts = [];

        for (const fileInfo of allMarkdownFiles) {
            const content = await fs.readFile(fileInfo.fullPath, 'utf8');
            const { data: frontMatter, content: markdownContent } = matter(content);

            const slug = path.basename(fileInfo.fileName, '.md');
            const isPost = fileInfo.directory === 'posts';
            const href = isPost ? `posts/${slug}.html` : `${slug}.html`;
            const tags = Array.isArray(frontMatter.tags) ? frontMatter.tags : [];

            posts.push({
                title: frontMatter.title || slug,
                date: frontMatter.date || new Date().toDateString(),
                author: frontMatter.author || 'Disease Reporter',
                category: frontMatter.category || 'General',
                description: frontMatter.description || 'Latest infectious disease news',
                tags,
                slug,
                href,
                directory: fileInfo.directory,
                markdownContent,
                fullPath: fileInfo.fullPath,
                fileName: fileInfo.fileName
            });
        }

        // Sort by date descending
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        return posts;
    }

    // Find related posts based on shared tags
    findRelatedPosts(currentPost, allPosts, maxCount) {
        if (typeof maxCount === 'undefined') maxCount = 3;
        const currentTags = new Set(currentPost.tags);
        if (currentTags.size === 0) return [];

        const scored = allPosts
            .filter(function(p) { return p.slug !== currentPost.slug; })
            .map(function(p) {
                var shared = p.tags.filter(function(t) { return currentTags.has(t); }).length;
                return { post: p, score: shared };
            })
            .filter(function(s) { return s.score > 0; })
            .sort(function(a, b) {
                return b.score - a.score || new Date(b.post.date) - new Date(a.post.date);
            });

        return scored.slice(0, maxCount).map(function(s) { return s.post; });
    }

    async generatePages() {
        const allPosts = await this.getAllPostsData();
        const template = await fs.readFile(path.join(this.templatesDir, 'post.ejs'), 'utf8');

        for (const post of allPosts) {
            const htmlContent = marked(post.markdownContent);
            const isPost = post.directory === 'posts';
            const outDir = isPost ? this.postsOutputDir : this.outputDir;
            const basePath = isPost ? '../' : '';

            // Find related posts
            const relatedPosts = this.findRelatedPosts(post, allPosts, 3);

            await fs.ensureDir(outDir);

            // Build relative hrefs for related posts
            const relatedPostsData = relatedPosts.map(function(rp) {
                var rpHref;
                if (isPost && rp.directory === 'posts') {
                    rpHref = rp.slug + '.html';
                } else if (isPost && rp.directory !== 'posts') {
                    rpHref = '../' + rp.slug + '.html';
                } else if (!isPost && rp.directory === 'posts') {
                    rpHref = 'posts/' + rp.slug + '.html';
                } else {
                    rpHref = rp.slug + '.html';
                }
                return {
                    title: rp.title,
                    date: rp.date,
                    description: rp.description,
                    href: rpHref
                };
            });

            const html = ejs.render(template, {
                title: post.title,
                date: post.date,
                author: post.author,
                category: post.category,
                content: htmlContent,
                description: post.description,
                tags: post.tags,
                slug: post.slug,
                relatedPosts: relatedPostsData,
                basePath,
                siteUrl: this.siteUrl
            });

            await fs.writeFile(path.join(outDir, post.slug + '.html'), html);
            console.log('📄 Generated: ' + (isPost ? 'posts/' : '') + post.slug + '.html');
        }
    }

    async getAllMarkdownFiles() {
        const allFiles = [];

        // Get files from content root
        try {
            const contentFiles = await fs.readdir(this.contentDir);
            const rootMarkdownFiles = contentFiles.filter(file => file.endsWith('.md'));

            for (const file of rootMarkdownFiles) {
                allFiles.push({
                    fileName: file,
                    fullPath: path.join(this.contentDir, file),
                    directory: 'root'
                });
            }
        } catch (error) {
            console.log('Content directory not found or empty');
        }

        // Get files from posts subdirectory
        try {
            const postsFiles = await fs.readdir(this.postsDir);
            const postsMarkdownFiles = postsFiles.filter(file => file.endsWith('.md'));

            for (const file of postsMarkdownFiles) {
                allFiles.push({
                    fileName: file,
                    fullPath: path.join(this.postsDir, file),
                    directory: 'posts'
                });
            }
        } catch (error) {
            console.log('Posts directory not found or empty');
        }

        // Deduplicate by slug; prefer entries from posts/ over root/
        const bySlug = new Map();
        for (const fi of allFiles) {
            const slug = path.basename(fi.fileName, '.md');
            const existing = bySlug.get(slug);
            if (!existing) {
                bySlug.set(slug, fi);
            } else {
                // Prefer posts directory when duplicate slugs exist
                if (existing.directory === 'root' && fi.directory === 'posts') {
                    bySlug.set(slug, fi);
                }
            }
        }

        return Array.from(bySlug.values());
    }

    async generateIndex() {
        const allPosts = await this.getAllPostsData();
        const postsPerPage = 6;
        const totalPages = Math.max(1, Math.ceil(allPosts.length / postsPerPage));

        const template = await fs.readFile(path.join(this.templatesDir, 'index.ejs'), 'utf8');

        for (var page = 1; page <= totalPages; page++) {
            var startIdx = (page - 1) * postsPerPage;
            var pagePosts = allPosts.slice(startIdx, startIdx + postsPerPage);

            // Determine basePath and output location
            var isFirstPage = page === 1;
            var basePath = isFirstPage ? '' : '../../';
            var prevPage = null;
            var nextPage = null;

            if (page > 1) {
                prevPage = page === 2 ? (isFirstPage ? null : '../../index.html') : '../../page/' + (page - 1) + '.html';
            }
            if (page < totalPages) {
                nextPage = isFirstPage ? 'page/' + (page + 1) + '.html' : '../../page/' + (page + 1) + '.html';
            }

            // Adjust hrefs for paginated pages (posts hrefs need basePath prefix)
            var adjustedPosts = pagePosts.map(function(p) {
                return Object.assign({}, p, {
                    href: isFirstPage ? p.href : '../../' + p.href
                });
            });

            var html = ejs.render(template, {
                posts: adjustedPosts,
                allPosts: allPosts,
                title: 'Infectious Disease News Blog',
                description: 'Stay informed about the latest infectious disease outbreaks, research, and public health updates',
                basePath: basePath,
                siteUrl: this.siteUrl,
                currentPage: page,
                totalPages: totalPages,
                prevPage: prevPage,
                nextPage: nextPage
            });

            if (isFirstPage) {
                await fs.writeFile(path.join(this.outputDir, 'index.html'), html);
                console.log('🏠 Generated: index.html (page 1 of ' + totalPages + ')');
            } else {
                var pageDir = path.join(this.outputDir, 'page');
                await fs.ensureDir(pageDir);
                await fs.writeFile(path.join(pageDir, page + '.html'), html);
                console.log('🏠 Generated: page/' + page + '.html');
            }
        }
    }

    async generateTagPages() {
        const allPosts = await this.getAllPostsData();

        // Collect all unique tags and their posts
        const tagMap = {};
        for (const post of allPosts) {
            for (const tag of post.tags) {
                if (!tagMap[tag]) {
                    tagMap[tag] = [];
                }
                tagMap[tag].push(post);
            }
        }

        const template = await fs.readFile(path.join(this.templatesDir, 'tag.ejs'), 'utf8');
        const tagsDir = path.join(this.outputDir, 'tags');
        await fs.ensureDir(tagsDir);

        for (const tag of Object.keys(tagMap)) {
            var tagPosts = tagMap[tag];
            // Sort by date descending
            tagPosts.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });

            // Adjust hrefs: from tags/ we need ../posts/slug.html or ../slug.html
            var adjustedPosts = tagPosts.map(function(p) {
                return Object.assign({}, p, {
                    href: p.directory === 'posts' ? '../posts/' + p.slug + '.html' : '../' + p.slug + '.html'
                });
            });

            var html = ejs.render(template, {
                tag: tag,
                posts: adjustedPosts,
                title: 'Posts tagged "' + tag + '"',
                description: 'All posts tagged with ' + tag,
                basePath: '../',
                siteUrl: this.siteUrl
            });

            // Use tag name as filename (sanitize for filesystem)
            var tagSlug = tag.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)/g, '');
            await fs.writeFile(path.join(tagsDir, tagSlug + '.html'), html);
            console.log('🏷️  Generated: tags/' + tagSlug + '.html');
        }
    }

    async generateSitemap() {
        const allMarkdownFiles = await this.getAllMarkdownFiles();
        const urls = [this.siteUrl + '/index.html'];

        for (const fileInfo of allMarkdownFiles) {
            const slug = path.basename(fileInfo.fileName, '.md');
            const href = fileInfo.directory === 'posts' ? 'posts/' + slug + '.html' : slug + '.html';
            urls.push(this.siteUrl + '/' + href);
        }

        const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
            urls.map(function(url) { return '    <url>\n        <loc>' + url + '</loc>\n    </url>'; }).join('\n') +
            '\n</urlset>';

        await fs.writeFile(path.join(this.outputDir, 'sitemap.xml'), sitemap);
        console.log('🗺️  Generated: sitemap.xml');
    }

    async generateRssFeed() {
        const allMarkdownFiles = await this.getAllMarkdownFiles();
        const items = [];

        for (const fileInfo of allMarkdownFiles) {
            const content = await fs.readFile(fileInfo.fullPath, 'utf8');
            const { data: frontMatter } = matter(content);
            const slug = path.basename(fileInfo.fileName, '.md');
            const href = fileInfo.directory === 'posts' ? 'posts/' + slug + '.html' : slug + '.html';

            items.push({
                title: frontMatter.title || slug,
                description: frontMatter.description || 'Latest infectious disease news',
                date: frontMatter.date || new Date().toISOString().slice(0, 10),
                link: this.siteUrl + '/' + href
            });
        }

        // Sort by date descending
        items.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });

        const siteName = this.config.siteName || 'Infectious Disease News';
        const siteDescription = this.config.siteDescription || 'Latest infectious disease news and updates';

        var escapeXml = function(str) {
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        };

        const feed = '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n    <channel>\n' +
            '        <title>' + escapeXml(siteName) + '</title>\n' +
            '        <link>' + this.siteUrl + '</link>\n' +
            '        <description>' + escapeXml(siteDescription) + '</description>\n' +
            '        <lastBuildDate>' + new Date().toUTCString() + '</lastBuildDate>\n' +
            items.map(function(item) {
                return '        <item>\n' +
                    '            <title>' + escapeXml(item.title) + '</title>\n' +
                    '            <link>' + item.link + '</link>\n' +
                    '            <description>' + escapeXml(item.description) + '</description>\n' +
                    '            <pubDate>' + new Date(item.date).toUTCString() + '</pubDate>\n' +
                    '        </item>';
            }).join('\n') +
            '\n    </channel>\n</rss>';

        await fs.writeFile(path.join(this.outputDir, 'feed.xml'), feed);
        console.log('📡 Generated: feed.xml');
    }

    async generate404() {
        const template = await fs.readFile(path.join(this.templatesDir, '404.ejs'), 'utf8');
        const html = ejs.render(template, {
            title: '404 - Page Not Found',
            description: 'Page not found - Infectious Disease News',
            basePath: '',
            siteUrl: this.siteUrl
        });

        await fs.writeFile(path.join(this.outputDir, '404.html'), html);
        console.log('🚫 Generated: 404.html');
    }

    async newPost(title, options) {
        if (typeof options === 'undefined') options = {};
        if (!title) {
            console.error('❌ Please provide a post title');
            console.log('💡 Usage: node index.js new-post "Your Post Title"');
            console.log('💡 Usage: node index.js new-post "Your Post Title" --posts');
            return;
        }

        // Determine output directory (default to posts directory unless explicitly disabled)
        var usePostsDir = (typeof options.posts === 'undefined') ? true : Boolean(options.posts);
        const outputDir = usePostsDir ? this.postsDir : this.contentDir;
        const dirName = usePostsDir ? 'posts' : 'content';

        // Ensure the directory exists
        await fs.ensureDir(outputDir);

        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const fileName = slug + '.md';
        const filePath = path.join(outputDir, fileName);

        // Check if file already exists
        if (await fs.pathExists(filePath)) {
            console.error('❌ File already exists: ' + fileName);
            console.log('📍 Location: ' + filePath);
            return;
        }

        var template = '---\n' +
            'type: "post"\n' +
            'title: "' + title + '"\n' +
            'date: "' + new Date().toISOString().slice(0, 10) + '"\n' +
            'author: "ID Blog Team"\n' +
            'category: "Breaking News"\n' +
            'description: "Latest updates on ' + title + '"\n' +
            'tags: ["infectious-disease", "health", "news"]\n' +
            '---\n\n' +
            '# ' + title + '\n\n' +
            'Write your infectious disease news content here...\n\n' +
            '## Key Points\n\n' +
            '- Important point 1\n' +
            '- Important point 2\n' +
            '- Important point 3\n\n' +
            '## Impact\n\n' +
            'Describe the impact on public health...\n\n' +
            '## Background\n\n' +
            'Provide context and background information...\n\n' +
            '## Current Status\n\n' +
            'Update on the current situation...\n\n' +
            '## Expert Opinions\n\n' +
            'Include quotes from medical professionals or researchers...\n\n' +
            '## Prevention & Safety\n\n' +
            'Recommendations for the public...\n\n' +
            '## References\n\n' +
            '- [WHO](https://www.who.int/)\n' +
            '- [CDC](https://www.cdc.gov/)\n' +
            '- World Health Organization\n' +
            '- Centers for Disease Control and Prevention\n';

        await fs.writeFile(filePath, template);
        console.log('📝 Created new post: ' + fileName);
        console.log('📍 Location: ' + filePath);
        console.log('📁 Directory: src/content/' + dirName + '/');
        console.log('🔨 To build: npm run build');
    }
}

// CLI Setup
program
    .name('infectious-disease-blog')
    .description('Static site generator for infectious disease news blog')
    .version('1.0.0');

program
    .command('build')
    .description('Build the static site')
    .action(async () => {
        const generator = new InfectiousDiseaseGenerator();
        await generator.build();
    });

program
    .command('new-post')
    .description('Create a new blog post')
    .argument('<title>', 'Post title')
    .option('-p, --posts', 'Create post in src/content/posts/ directory (default)')
    .option('--no-posts', 'Create post in src/content/ (root)')
    .action(async (title, options) => {
        const generator = new InfectiousDiseaseGenerator();
        await generator.newPost(title, options);
    });

// Handle direct node execution (skip when required as a module, e.g. in tests)
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length === 0 || args[0] === 'build') {
        const generator = new InfectiousDiseaseGenerator();
        generator.build();
    } else if (args[0] === 'new-post' && args[1]) {
        const generator = new InfectiousDiseaseGenerator();
        const title = args.slice(1).filter(arg => !arg.startsWith('-')).join(' ');
        // Determine posts option: --no-posts forces root, --posts/-p forces posts, otherwise undefined (default handled in newPost)
        const options = {};
        if (args.includes('--no-posts')) {
            options.posts = false;
        } else if (args.includes('--posts') || args.includes('-p')) {
            options.posts = true;
        } // else leave undefined for default-to-posts
        generator.newPost(title, options);
    } else {
        program.parse();
    }
}

module.exports = InfectiousDiseaseGenerator;
