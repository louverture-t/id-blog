// Main JavaScript for Infectious Disease Blog
(function() {
    'use strict';

    const DEBUG = false;

    // DOM Content Loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeApp();
    });

    function initializeApp() {
        // Initialize all components
        initMobileMenu();
        initSmoothScrolling();
        initSearchFunctionality();
        initSocialSharing();
        initThemeToggle();
        initNewsletterSignup();
        initAnalytics();

        if (DEBUG) console.log('🦠 Infectious Disease Blog initialized');
    }

    // Mobile hamburger menu toggle
    function initMobileMenu() {
        var toggle = document.querySelector('.navbar-toggle');
        var menu = document.querySelector('.navbar-menu');
        if (!toggle || !menu) return;

        toggle.addEventListener('click', function() {
            var expanded = toggle.classList.toggle('active');
            menu.classList.toggle('active');
            toggle.setAttribute('aria-expanded', expanded);
        });

        // Close menu when a link is clicked
        menu.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                toggle.classList.remove('active');
                menu.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Smooth scrolling for anchor links
    function initSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Search functionality (basic client-side search)
    function initSearchFunctionality() {
        // Create search input if it doesn't exist
        const navbar = document.querySelector('.navbar-menu');
        if (navbar && !document.querySelector('.search-input')) {
            const searchHTML = `
                <li class="search-container">
                    <input type="text" class="search-input" placeholder="Search articles..." />
                    <div class="search-results"></div>
                </li>
            `;
            navbar.insertAdjacentHTML('beforeend', searchHTML);
        }

        const searchInput = document.querySelector('.search-input');
        const searchResults = document.querySelector('.search-results');
        
        if (searchInput && searchResults) {
            let searchTimeout;
            
            searchInput.addEventListener('input', function() {
                clearTimeout(searchTimeout);
                const query = this.value.trim();
                
                if (query.length < 2) {
                    searchResults.innerHTML = '';
                    searchResults.style.display = 'none';
                    return;
                }
                
                searchTimeout = setTimeout(() => {
                    performSearch(query, searchResults);
                }, 300);
            });
            
            // Close search results when clicking outside
            document.addEventListener('click', function(e) {
                if (!e.target.closest('.search-container')) {
                    searchResults.style.display = 'none';
                }
            });
        }
    }

    function performSearch(query, resultsContainer) {
        // Simple client-side search through post cards
        const postCards = document.querySelectorAll('.post-card');
        const results = [];
        
        postCards.forEach(card => {
            const title = card.querySelector('.post-card-title a')?.textContent || '';
            const description = card.querySelector('.post-card-description')?.textContent || '';
            const category = card.querySelector('.category-badge')?.textContent || '';
            
            if (title.toLowerCase().includes(query.toLowerCase()) ||
                description.toLowerCase().includes(query.toLowerCase()) ||
                category.toLowerCase().includes(query.toLowerCase())) {
                
                const link = card.querySelector('.post-card-title a')?.href || '#';
                results.push({
                    title: title,
                    description: description,
                    link: link,
                    category: category
                });
            }
        });
        
        displaySearchResults(results, resultsContainer, query);
    }

    function displaySearchResults(results, container, query) {
        if (results.length === 0) {
            container.innerHTML = `
                <div class="search-result">
                    <p>No articles found for "${query}"</p>
                </div>
            `;
        } else {
            const resultsHTML = results.map(result => `
                <div class="search-result">
                    <h4><a href="${result.link}">${highlightText(result.title, query)}</a></h4>
                    <p>${highlightText(result.description.substring(0, 100), query)}...</p>
                    <span class="result-category">${result.category}</span>
                </div>
            `).join('');
            
            container.innerHTML = resultsHTML;
        }
        
        container.style.display = 'block';
    }

    function highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // Social sharing functionality
    function initSocialSharing() {
        // Add sharing buttons if they don't exist
        const postFooter = document.querySelector('.post-footer');
        if (postFooter && !document.querySelector('.post-share')) {
            const shareHTML = `
                <div class="post-share">
                    <span class="share-label">Share:</span>
                    <a href="#" class="share-link twitter" onclick="shareOnTwitter(); return false;">Twitter</a>
                    <a href="#" class="share-link facebook" onclick="shareOnFacebook(); return false;">Facebook</a>
                    <a href="#" class="share-link linkedin" onclick="shareOnLinkedIn(); return false;">LinkedIn</a>
                    <a href="#" class="share-link copy" onclick="copyLink(); return false;">Copy Link</a>
                </div>
            `;
            postFooter.insertAdjacentHTML('beforeend', shareHTML);
        }
    }

    // Global sharing functions
    window.shareOnTwitter = function() {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(document.title);
        const twitterUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}&hashtags=InfectiousDiseases,PublicHealth`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
    };

    window.shareOnFacebook = function() {
        const url = encodeURIComponent(window.location.href);
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    };

    window.shareOnLinkedIn = function() {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`;
        window.open(linkedinUrl, '_blank', 'width=600,height=400');
    };

    window.copyLink = function() {
        navigator.clipboard.writeText(window.location.href).then(function() {
            showNotification('Link copied to clipboard!', 'success');
        }).catch(function() {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('Link copied to clipboard!', 'success');
        });
    };

    // Theme toggle functionality
    function initThemeToggle() {
        const themeToggle = document.createElement('button');
        themeToggle.innerHTML = '🌓';
        themeToggle.className = 'theme-toggle';
        themeToggle.setAttribute('aria-label', 'Toggle dark mode');
        themeToggle.title = 'Toggle dark/light mode';
        
        const navbar = document.querySelector('.navbar .container');
        if (navbar) {
            navbar.appendChild(themeToggle);
        }
        
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
        }
        
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            showNotification(`Switched to ${newTheme} mode`, 'info');
        });
    }

    // Newsletter signup functionality
    function initNewsletterSignup() {
        const footer = document.querySelector('.footer .container');
        if (footer && !document.querySelector('.newsletter-signup')) {
            const newsletterHTML = `
                <div class="newsletter-signup">
                    <h3>Stay Updated</h3>
                    <p>Get the latest infectious disease news delivered to your inbox.</p>
                    <form class="newsletter-form">
                        <input type="email" placeholder="Enter your email" required>
                        <button type="submit">Subscribe</button>
                    </form>
                </div>
            `;
            
            const footerContent = footer.querySelector('.footer-content');
            if (footerContent) {
                footerContent.insertAdjacentHTML('beforeend', newsletterHTML);
            }
        }
        
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const email = this.querySelector('input[type="email"]').value;
                
                // Simulate newsletter signup
                showNotification('Thank you for subscribing! (This is a demo)', 'success');
                this.reset();
                
                // In a real application, you would send this to your backend
                if (DEBUG) console.log('Newsletter signup:', email);
            });
        }
    }

    // Basic analytics tracking
    function initAnalytics() {
        // Track page views
        trackPageView();
        
        // Track outbound links
        const externalLinks = document.querySelectorAll('a[href^="http"]:not([href*="' + window.location.hostname + '"])');
        externalLinks.forEach(link => {
            link.addEventListener('click', function() {
                trackEvent('external_link', 'click', this.href);
            });
        });
        
        // Track search queries
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', debounce(function() {
                if (this.value.length > 2) {
                    trackEvent('search', 'query', this.value);
                }
            }, 1000));
        }
    }

    function trackPageView() {
        // In a real application, you would integrate with Google Analytics, etc.
        if (DEBUG) console.log('Page view tracked:', window.location.pathname);
    }

    function trackEvent(category, action, label) {
        // In a real application, you would integrate with Google Analytics, etc.
        if (DEBUG) console.log('Event tracked:', { category, action, label });
    }

    // Utility functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '1000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'success' ? '#27ae60' : 
                           type === 'error' ? '#e74c3c' : '#3498db'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Lazy loading for images
    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for older browsers
            images.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
            });
        }
    }

    // Initialize lazy loading if there are lazy images
    if (document.querySelector('img[data-src]')) {
        initLazyLoading();
    }

    // Reading progress indicator for posts
    function initReadingProgress() {
        if (document.querySelector('.post-content')) {
            const progressBar = document.createElement('div');
            progressBar.className = 'reading-progress';
            progressBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 0%;
                height: 3px;
                background: #e74c3c;
                z-index: 1001;
                transition: width 0.1s ease;
            `;
            document.body.appendChild(progressBar);
            
            window.addEventListener('scroll', function() {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                progressBar.style.width = scrolled + '%';
            });
        }
    }

    initReadingProgress();

})();