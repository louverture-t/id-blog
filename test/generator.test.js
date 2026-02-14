const path = require('path');
const fs = require('fs-extra');
const matter = require('gray-matter');
const { marked } = require('marked');

const ROOT = path.resolve(__dirname, '..');

// --- Helper: load a markdown file and return parsed frontmatter + html ---
function parsePost(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(raw);
    const html = marked(content);
    return { data, html };
}

// ────────────────────────────────────────────
// 1. Site config
// ────────────────────────────────────────────
describe('site.config.json', () => {
    const configPath = path.join(ROOT, 'site.config.json');

    test('exists and is valid JSON', () => {
        expect(fs.existsSync(configPath)).toBe(true);
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        expect(config).toBeDefined();
    });

    test('contains required siteUrl field', () => {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        expect(typeof config.siteUrl).toBe('string');
        expect(config.siteUrl).toMatch(/^https?:\/\//);
    });
});

// ────────────────────────────────────────────
// 2. Frontmatter parsing
// ────────────────────────────────────────────
describe('Frontmatter parsing', () => {
    const contentDir = path.join(ROOT, 'src', 'content');
    const postsDir = path.join(contentDir, 'posts');

    // Collect all markdown files
    const mdFiles = [];
    if (fs.existsSync(contentDir)) {
        fs.readdirSync(contentDir)
            .filter(f => f.endsWith('.md'))
            .forEach(f => mdFiles.push(path.join(contentDir, f)));
    }
    if (fs.existsSync(postsDir)) {
        fs.readdirSync(postsDir)
            .filter(f => f.endsWith('.md'))
            .forEach(f => mdFiles.push(path.join(postsDir, f)));
    }

    test('at least one markdown file exists', () => {
        expect(mdFiles.length).toBeGreaterThan(0);
    });

    test.each(mdFiles)('%s has valid frontmatter with title and date', (filePath) => {
        const { data } = parsePost(filePath);
        expect(data.title).toBeDefined();
        expect(typeof data.title).toBe('string');
        expect(data.date).toBeDefined();
    });
});

// ────────────────────────────────────────────
// 3. Markdown → HTML conversion
// ────────────────────────────────────────────
describe('Markdown to HTML', () => {
    test('converts headings and paragraphs', () => {
        const md = '# Hello\n\nSome text here.';
        const html = marked(md);
        expect(html).toContain('<h1>');
        expect(html).toContain('Hello');
        expect(html).toContain('<p>');
    });

    test('converts lists', () => {
        const md = '- item one\n- item two';
        const html = marked(md);
        expect(html).toContain('<ul>');
        expect(html).toContain('<li>');
    });

    test('converts links', () => {
        const md = '[CDC](https://www.cdc.gov/)';
        const html = marked(md);
        expect(html).toContain('href="https://www.cdc.gov/"');
    });
});

// ────────────────────────────────────────────
// 4. Generator class
// ────────────────────────────────────────────
describe('InfectiousDiseaseGenerator', () => {
    const Generator = require('../index');

    test('can be instantiated', () => {
        const gen = new Generator();
        expect(gen).toBeDefined();
        expect(gen.siteUrl).toBeDefined();
    });

    test('loads siteUrl from config', () => {
        const gen = new Generator();
        expect(gen.siteUrl).toMatch(/^https?:\/\//);
        // Should not have a trailing slash
        expect(gen.siteUrl).not.toMatch(/\/$/);
    });

    test('getAllMarkdownFiles returns files', async () => {
        const gen = new Generator();
        const files = await gen.getAllMarkdownFiles();
        expect(files.length).toBeGreaterThan(0);
        files.forEach(f => {
            expect(f.fileName).toMatch(/\.md$/);
            expect(['root', 'posts']).toContain(f.directory);
        });
    });
});

// ────────────────────────────────────────────
// 5. Templates
// ────────────────────────────────────────────
describe('EJS templates', () => {
    const templatesDir = path.join(ROOT, 'src', 'templates');

    test.each(['index.ejs', 'post.ejs', 'layout.ejs', 'tag.ejs'])('%s exists', (name) => {
        expect(fs.existsSync(path.join(templatesDir, name))).toBe(true);
    });

    test('layout.ejs uses siteUrl variable (no hardcoded domain)', () => {
        const layout = fs.readFileSync(path.join(templatesDir, 'layout.ejs'), 'utf8');
        expect(layout).toContain('<%= siteUrl %>');
        expect(layout).not.toContain('yourdomain.com');
        // Verify the Arabic-character typo is gone
        expect(layout).not.toContain('youردomain');
    });

    test('all templates include navbar-toggle button', () => {
        ['index.ejs', 'post.ejs', 'layout.ejs', 'tag.ejs'].forEach(name => {
            const content = fs.readFileSync(path.join(templatesDir, name), 'utf8');
            expect(content).toContain('navbar-toggle');
        });
    });
});

// ────────────────────────────────────────────
// 6. New features
// ────────────────────────────────────────────
describe('New features', () => {
    const Generator = require('../index');

    test('getAllPostsData returns posts with tags', async () => {
        const gen = new Generator();
        const posts = await gen.getAllPostsData();
        expect(posts.length).toBeGreaterThan(0);
        posts.forEach(p => {
            expect(p.title).toBeDefined();
            expect(Array.isArray(p.tags)).toBe(true);
            expect(p.slug).toBeDefined();
        });
    });

    test('findRelatedPosts returns related posts based on shared tags', async () => {
        const gen = new Generator();
        const posts = await gen.getAllPostsData();
        if (posts.length > 1) {
            const related = gen.findRelatedPosts(posts[0], posts, 3);
            expect(Array.isArray(related)).toBe(true);
            // Related posts should not include the post itself
            related.forEach(rp => {
                expect(rp.slug).not.toBe(posts[0].slug);
            });
        }
    });

    test('site.config.json has no placeholder domains', () => {
        const configPath = path.join(path.resolve(__dirname, '..'), 'site.config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        expect(config.siteUrl).not.toContain('yourdomain.com');
        expect(config.siteUrl).not.toContain('example.com');
    });

    test('post.ejs contains JSON-LD structured data', () => {
        const templatesDir = path.join(path.resolve(__dirname, '..'), 'src', 'templates');
        const postTemplate = fs.readFileSync(path.join(templatesDir, 'post.ejs'), 'utf8');
        expect(postTemplate).toContain('application/ld+json');
        expect(postTemplate).toContain('@type');
        expect(postTemplate).toContain('Article');
    });
});
