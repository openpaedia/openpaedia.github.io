document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('search-box');
    const searchResultsContainer = document.getElementById('search-results');
    const articleContentContainer = document.getElementById('article-content');
    let articles = []; // To store the list of articles {title, file}

    // --- Fetch the list of articles from the JSON manifest ---
    async function fetchArticleList() {
        try {
            const response = await fetch('articles.json');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            articles = await response.json();
            // console.log('Articles loaded:', articles);
            checkForUrlParams(); // Check if we need to load an article immediately
        } catch (error) {
            console.error('Error fetching article list:', error);
            articleContentContainer.innerHTML = `<h2>Error</h2><p>Could not load the list of articles. Please ensure 'articles.json' is present and valid.</p>`;
        }
    }

    // --- Fetch and display a specific article ---
    async function fetchAndDisplayArticle(filename, title) {
        if (!filename) return;

        // Show loading state
        articleContentContainer.innerHTML = `<h2>Loading ${title || 'Article'}...</h2><p>Please wait.</p>`;
        searchResultsContainer.style.display = 'none'; // Hide results
        searchBox.value = ''; // Clear search box

        try {
            const response = await fetch(`articles/${filename}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const textContent = await response.text();

            // Display the fetched content
            // Basic rendering: replace newlines with <br> and wrap in paragraphs potentially
            // More sophisticated rendering (like Markdown) would require a library
            articleContentContainer.innerHTML = `<h2>${title || filename}</h2>`;
            // Split into paragraphs, preserve preformatted blocks if needed
            const lines = textContent.split('\n');
            let currentParagraph = '';
            lines.forEach(line => {
                if (line.trim() === '') {
                    if (currentParagraph) {
                        const p = document.createElement('p');
                        p.textContent = currentParagraph;
                        articleContentContainer.appendChild(p);
                        currentParagraph = '';
                    }
                } else {
                    currentParagraph += (currentParagraph ? '\n' : '') + line;
                }
            });
            // Add any remaining text
            if (currentParagraph) {
                 const p = document.createElement('p');
                 p.textContent = currentParagraph;
                 articleContentContainer.appendChild(p);
            }

        } catch (error) {
            console.error(`Error fetching article ${filename}:`, error);
            articleContentContainer.innerHTML = `<h2>Error</h2><p>Could not load the article '${filename}'. Please check if the file exists in the 'articles' folder and is readable.</p>`;
        }
    }

    // --- Handle search input ---
    searchBox.addEventListener('input', () => {
        const query = searchBox.value.trim().toLowerCase();

        if (query.length < 2) {
            searchResultsContainer.style.display = 'none';
            searchResultsContainer.innerHTML = '';
            return;
        }

        const filteredArticles = articles.filter(article =>
            article.title.toLowerCase().includes(query) ||
            article.file.toLowerCase().includes(query)
        );

        displaySearchResults(filteredArticles);
    });

    // --- Display search results ---
    function displaySearchResults(results) {
        searchResultsContainer.innerHTML = ''; // Clear previous results

        if (results.length === 0) {
            const noResultDiv = document.createElement('div');
            noResultDiv.textContent = 'No articles found.';
            noResultDiv.classList.add('no-results');
            searchResultsContainer.appendChild(noResultDiv);
        } else {
            results.forEach(article => {
                const resultDiv = document.createElement('div');
                resultDiv.textContent = article.title; // Show the user-friendly title
                resultDiv.dataset.filename = article.file; // Store filename in data attribute
                resultDiv.dataset.title = article.title;
                resultDiv.addEventListener('click', () => {
                    fetchAndDisplayArticle(article.file, article.title);
                });
                searchResultsContainer.appendChild(resultDiv);
            });
        }
        searchResultsContainer.style.display = 'block'; // Show the results box
    }

    // --- Hide search results when clicking outside ---
    document.addEventListener('click', (event) => {
        if (!searchBox.contains(event.target) && !searchResultsContainer.contains(event.target)) {
            searchResultsContainer.style.display = 'none';
        }
    });

    // --- Check URL parameters on load ---
    function checkForUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const articleFile = params.get('article');
        if (articleFile) {
            // Find the title associated with this file
            const articleData = articles.find(a => a.file === articleFile);
            const articleTitle = articleData ? articleData.title : articleFile; // Fallback to filename if not found
            fetchAndDisplayArticle(articleFile, articleTitle);
        }
    }


    // --- Initial Load ---
    fetchArticleList();

});