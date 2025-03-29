document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('search-box');
    const searchResults = document.getElementById('search-results');
    const articleContent = document.getElementById('article-content');
    const allArticlesLink = document.getElementById('all-articles-link');
    const allArticlesView = document.getElementById('all-articles-view');
    const allArticlesList = document.getElementById('all-articles-list');
    const articleView = document.getElementById('article-content'); // Renamed for clarity

    const articlesBasePath = 'articles/'; // Path to the articles folder

    // --- IMPORTANT: Manually list your article files here ---
    // The 'title' is for display, 'filename' is the actual .txt file name.
    const availableArticles = [
        { title: "Introduction", filename: "introduction.txt" },
        { title: "HTML Basics", filename: "html_basics.txt" },
        { title: "CSS Styling", filename: "css_styling.txt" },
        { title: "JavaScript Events", filename: "javascript_events.txt" },
        { title: "Advanced Search Techniques", filename: "advanced_search_techniques.txt" }
        // Add more articles here as you create the .txt files
        // { title: "Another Article", filename: "another_article.txt" },
    ];

    // --- Function to Load Article Content ---
    function loadArticle(filename) {
        const filePath = articlesBasePath + filename;
        console.log(`Workspaceing article: ${filePath}`); // Debug log

        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} - Could not find ${filename}`);
                }
                return response.text();
            })
            .then(text => {
                // Basic formatting: Convert double line breaks to paragraphs
                const paragraphs = text.split(/\n\s*\n/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');

                // Attempt to render basic markdown-like features (Headings, Code blocks)
                let formattedText = text
                    .replace(/^## (.*$)/gim, '<h3>$1</h3>') // H3
                    .replace(/^# (.*$)/gim, '<h2>$1</h2>')   // H2 (use sparingly if main title is H2)
                    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>') // Code blocks
                    .replace(/`([^`]+)`/g, '<code>$1</code>'); // Inline code

                // Convert remaining double line breaks to paragraphs for sections without headings/code
                const blocks = formattedText.split(/(\n\s*\n|<\/?h[23]>|<\/?pre>|<\/?code>)/).filter(Boolean); // Split by major blocks
                let finalHtml = '';
                let inCodeBlock = false;

                blocks.forEach(block => {
                     if (block.startsWith('<pre>')) {
                         finalHtml += block;
                         inCodeBlock = true;
                     } else if (block.endsWith('</pre>')) {
                         finalHtml += block;
                         inCodeBlock = false;
                     } else if (inCodeBlock) {
                         finalHtml += block; // Add content inside pre as is
                     } else if (block.match(/^<\/?h[23]>/) || block.match(/^<\/?code>/) ) {
                         finalHtml += block; // Add tags as is
                     } else if (block.trim().length > 0 && !block.match(/^\s*$/)) {
                         // Wrap remaining non-empty text blocks in paragraphs
                         finalHtml += block.split(/\n\s*\n/).map(p => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`).join('');
                     }
                });


                articleContent.innerHTML = `<h2>${getTitleFromFilename(filename)}</h2>${finalHtml}`;
                articleView.style.display = 'block'; // Show article view
                allArticlesView.style.display = 'none'; // Hide all articles list
                searchResults.style.display = 'none'; // Hide search results
                searchBox.value = ''; // Clear search box
                document.querySelectorAll('.sidebar nav ul li a').forEach(link => link.classList.remove('active')); // Deactivate sidebar links
            })
            .catch(error => {
                console.error("Error loading article:", error);
                articleContent.innerHTML = `<p style="color: red;">Error loading article: ${error.message}. Please check the file exists and the path is correct.</p>`;
                articleView.style.display = 'block'; // Show article view even on error
                allArticlesView.style.display = 'none';
            });
    }

    // --- Function to get a display title from filename ---
    function getTitleFromFilename(filename) {
        const matchedArticle = availableArticles.find(a => a.filename === filename);
        if (matchedArticle) {
            return matchedArticle.title;
        }
        // Fallback: Convert filename to title case if not found in list
        return filename.replace('.txt', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }


    // --- Search Box Input Event ---
    searchBox.addEventListener('input', () => {
        const searchTerm = searchBox.value.trim().toLowerCase();
        searchResults.innerHTML = ''; // Clear previous results

        if (searchTerm.length >= 2) {
            const filteredArticles = availableArticles.filter(article =>
                article.title.toLowerCase().includes(searchTerm)
            );

            if (filteredArticles.length > 0) {
                filteredArticles.forEach(article => {
                    const div = document.createElement('div');
                    div.textContent = article.title;
                    div.dataset.filename = article.filename; // Store filename
                    div.addEventListener('click', () => {
                        loadArticle(article.filename);
                    });
                    searchResults.appendChild(div);
                });
                searchResults.style.display = 'block'; // Show results
            } else {
                searchResults.style.display = 'none'; // Hide if no results
            }
        } else {
            searchResults.style.display = 'none'; // Hide if search term is too short
        }
    });

    // --- Hide search results if clicked outside ---
    document.addEventListener('click', (event) => {
        if (!searchBox.contains(event.target) && !searchResults.contains(event.target)) {
            searchResults.style.display = 'none';
        }
    });


    // --- "All Articles" Link Event ---
    allArticlesLink.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        populateAllArticlesList();
        articleView.style.display = 'none'; // Hide main article view
        searchResults.style.display = 'none'; // Hide search results
        allArticlesView.style.display = 'block'; // Show the list view

        // Style active link
        document.querySelectorAll('.sidebar nav ul li a').forEach(link => link.classList.remove('active'));
        allArticlesLink.classList.add('active');
    });

    // --- Function to Populate the All Articles List ---
    function populateAllArticlesList() {
        allArticlesList.innerHTML = ''; // Clear existing list
        availableArticles.sort((a, b) => a.title.localeCompare(b.title)); // Sort alphabetically

        availableArticles.forEach(article => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#'; // Make it clickable
            a.textContent = article.title;
            a.dataset.filename = article.filename; // Store filename
            a.addEventListener('click', (e) => {
                e.preventDefault();
                loadArticle(article.filename);
                 // Optionally remove 'active' from 'All Articles' link when an item is clicked
                allArticlesLink.classList.remove('active');
            });
            li.appendChild(a);
            allArticlesList.appendChild(li);
        });
    }

    // --- Initial Load ---
    // Load a default article (e.g., introduction) or leave the welcome message
    loadArticle("introduction.txt"); // Load introduction by default
    // Or just call populateAllArticlesList(); if you want the list ready immediately (but hidden)
    populateAllArticlesList(); // Prepare the list content for later display
});
