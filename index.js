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
    }

    async build() {
        console.log('🦠 Building Infectious Disease Blog...');
        
        try {
            // Clean output directory
            await fs.emptyDir(this.outputDir);
            
            // Copy assets
            await this.copyAssets();
            
            // Generate pages
            await this.generatePages();
            
            // Generate index page
            await this.generateIndex();
            
            console.log('✅ Blog built successfully! Output in docs/ folder');
        } catch (error) {
            console.error('❌ Build failed:', error.message);
            process.exit(1);
        }
    }

    async copyAssets() {
        const assetsOutput = path.join(this.outputDir, 'assets');
        await fs.copy(this.assetsDir, assetsOutput);
        console.log('📁 Assets copied');
    }

    async generatePages() {
        // Get markdown files from both content root and posts subdirectory
        const allMarkdownFiles = await this.getAllMarkdownFiles();

        const template = await fs.readFile(path.join(this.templatesDir, 'post.ejs'), 'utf8');

        for (const fileInfo of allMarkdownFiles) {
            const content = await fs.readFile(fileInfo.fullPath, 'utf8');
            const { data: frontMatter, content: markdownContent } = matter(content);

            const htmlContent = marked(markdownContent);
            const fileName = path.basename(fileInfo.fileName, '.md');

            const isPost = fileInfo.directory === 'posts';
            const outDir = isPost ? this.postsOutputDir : this.outputDir;
            const basePath = isPost ? '../' : '';

            await fs.ensureDir(outDir);

            const html = ejs.render(template, {
                title: frontMatter.title || fileName,
                date: frontMatter.date || new Date().toDateString(),
                author: frontMatter.author || 'Disease Reporter',
                category: frontMatter.category || 'General',
                content: htmlContent,
                description: frontMatter.description || 'Latest infectious disease news and updates',
                basePath
            });

            await fs.writeFile(path.join(outDir, `${fileName}.html`), html);
            console.log(`📄 Generated: ${isPost ? 'posts/' : ''}${fileName}.html`);
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
        
        return allFiles;
    }

    async generateIndex() {
        const allMarkdownFiles = await this.getAllMarkdownFiles();
    const posts = [];
        
        for (const fileInfo of allMarkdownFiles) {
            const content = await fs.readFile(fileInfo.fullPath, 'utf8');
            const { data: frontMatter } = matter(content);
            
            const slug = path.basename(fileInfo.fileName, '.md');
            const href = fileInfo.directory === 'posts' ? `posts/${slug}.html` : `${slug}.html`;

            posts.push({
                title: frontMatter.title || slug,
                date: frontMatter.date || new Date().toDateString(),
                author: frontMatter.author || 'Disease Reporter',
                category: frontMatter.category || 'General',
                description: frontMatter.description || 'Latest infectious disease news',
                slug,
                href,
                directory: fileInfo.directory
            });
        }
        
        // Sort posts by date (newest first)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const template = await fs.readFile(path.join(this.templatesDir, 'index.ejs'), 'utf8');
        const html = ejs.render(template, {
            posts,
            title: 'Infectious Disease News Blog',
            description: 'Stay informed about the latest infectious disease outbreaks, research, and public health updates',
            basePath: ''
        });
        
        await fs.writeFile(path.join(this.outputDir, 'index.html'), html);
        console.log('🏠 Generated: index.html');
    }

    async newPost(title, options = {}) {
        if (!title) {
            console.error('❌ Please provide a post title');
            console.log('💡 Usage: node index.js new-post "Your Post Title"');
            console.log('💡 Usage: node index.js new-post "Your Post Title" --posts');
            return;
        }

        // Determine output directory
        const usePostsDir = options.posts || false;
        const outputDir = usePostsDir ? this.postsDir : this.contentDir;
        const dirName = usePostsDir ? 'posts' : 'content';

        // Ensure the directory exists
        await fs.ensureDir(outputDir);

        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const fileName = `${slug}.md`;
        const filePath = path.join(outputDir, fileName);
        
        // Check if file already exists
        if (await fs.pathExists(filePath)) {
            console.error(`❌ File already exists: ${fileName}`);
            console.log(`📍 Location: ${filePath}`);
            return;
        }
        
        const template = `---
title: "${title}"
date: "${new Date().toDateString()}"
author: "Disease Reporter"
category: "Breaking News"
description: "Latest updates on ${title}"
tags: ["infectious-disease", "health", "news"]
---

# ${title}

Write your infectious disease news content here...

## Key Points

- Important point 1
- Important point 2  
- Important point 3

## Impact

Describe the impact on public health...

## Background

Provide context and background information...

## Current Status

Update on the current situation...

## Expert Opinions

Include quotes from medical professionals or researchers...

## Prevention & Safety

Recommendations for the public...

## References

- [Source 1](https://example.com)
- [Source 2](https://example.com)
- World Health Organization
- Centers for Disease Control and Prevention
`;

        await fs.writeFile(filePath, template);
        console.log(`📝 Created new post: ${fileName}`);
        console.log(`📍 Location: ${filePath}`);
        console.log(`📁 Directory: src/content/${dirName}/`);
        console.log(`🔨 To build: npm run build`);
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
    .option('-p, --posts', 'Create post in src/content/posts/ directory')
    .action(async (title, options) => {
        const generator = new InfectiousDiseaseGenerator();
        await generator.newPost(title, options);
    });

// Handle direct node execution
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length === 0 || args[0] === 'build') {
        const generator = new InfectiousDiseaseGenerator();
        generator.build();
    } else if (args[0] === 'new-post' && args[1]) {
        const generator = new InfectiousDiseaseGenerator();
        const title = args.slice(1).filter(arg => !arg.startsWith('-')).join(' ');
        const options = {
            posts: args.includes('--posts') || args.includes('-p')
        };
        generator.newPost(title, options);
    } else {
        program.parse();
    }
} else {
    program.parse();
}

module.exports = InfectiousDiseaseGenerator;