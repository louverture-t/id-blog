module.exports = function(grunt) {
    // Load all grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        // Clean the docs directory before building
        clean: {
            docs: ['docs/**/*']
        },

        // Copy assets that don't need processing
        copy: {
            images: {
                expand: true,
                cwd: 'src/assets/images/',
                src: ['**/*.{png,jpg,jpeg,gif,svg,ico}'],
                dest: 'docs/assets/images/'
            }
        },

        // Compile Sass to CSS
        sass: {
            options: {
                implementation: require('sass'),
                sourceMap: true,
                style: 'expanded'
            },
            dist: {
                files: {
                    'docs/assets/css/main.css': 'src/assets/css/main.scss'
                }
            }
        },

        // Minify CSS
        cssmin: {
            target: {
                files: {
                    'docs/assets/css/main.min.css': 'docs/assets/css/main.css'
                }
            }
        },

        // Minify JavaScript
        uglify: {
            options: {
                mangle: true,
                compress: true,
                sourceMap: true
            },
            dist: {
                files: {
                    'docs/assets/js/main.min.js': ['src/assets/js/**/*.js']
                }
            }
        },

        // Optimize images
        imagemin: {
            dynamic: {
                files: [{
                    expand: true,
                    cwd: 'src/assets/images/',
                    src: ['**/*.{png,jpg,jpeg,gif,svg}'],
                    dest: 'docs/assets/images/'
                }]
            }
        },

        // Development server with live reload
        connect: {
            server: {
                options: {
                    port: 3000,
                    base: 'docs',
                    hostname: 'localhost',
                    livereload: 35730, // Use different port to avoid conflicts
                    open: true,
                    // Ensure dev always serves the latest files (no browser cache)
                    middleware: function(connect, options, middlewares) {
                        middlewares.unshift(function noCache(req, res, next) {
                            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
                            res.setHeader('Pragma', 'no-cache');
                            res.setHeader('Expires', '0');
                            res.setHeader('Surrogate-Control', 'no-store');
                            next();
                        });
                        return middlewares;
                    }
                }
            }
        },

        // Watch for file changes
        watch: {
            options: {
                livereload: 35730 // Use same port as connect
            },
            sass: {
                files: ['src/assets/css/**/*.scss'],
                tasks: ['sass', 'cssmin']
            },
            js: {
                files: ['src/assets/js/**/*.js'],
                tasks: ['uglify']
            },
            images: {
                files: ['src/assets/images/**/*.{png,jpg,jpeg,gif,svg}'],
                tasks: ['newer:imagemin', 'newer:copy:images']
            },
            content: {
                files: ['src/content/**/*.md', 'src/content/posts/**/*.md', 'src/templates/**/*.ejs'],
                tasks: ['shell:build']
            },
            livereload: {
                files: ['docs/**/*.html', 'docs/assets/css/*.css', 'docs/assets/js/*.js']
            }
        },

        // Shell commands
        shell: {
            build: {
                command: 'node index.js build'
            },
            install: {
                command: 'npm install'
            }
        }
    });

    // Load additional plugins
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-newer');

    // Register tasks
    grunt.registerTask('default', [
        'clean',
        'shell:build',
        'sass',
        'cssmin',
        'uglify',
        'imagemin',
        'copy:images'
    ]);

    // "serve" should behave like a dev server that keeps rebuilding and reloading
    grunt.registerTask('serve', [
        'default',
        'connect:server',
        'watch'
    ]);

    grunt.registerTask('dev', [
        'default',
        'connect:server',
        'watch'
    ]);

    grunt.registerTask('build-prod', [
        'clean',
        'shell:build',
        'sass',
        'cssmin',
        'uglify',
        'imagemin',
        'copy:images'
    ]);
};