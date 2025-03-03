let wikiIndex = {};

    fetch('articles.json')
      .then(response => response.json())
      .then(data => {
        wikiIndex = data;
        // Optionally, load a default article into the content area via AJAX if desired.
        // For example, uncomment the following line to load the Main Page into the current page:
        // loadArticle('Main_Page');
      })
      .catch(err => {
        console.error('Error loading article index:', err);
      });

    function loadArticle(articleId) {
      if (wikiIndex[articleId]) {
        const articleInfo = wikiIndex[articleId];
        fetch(articleInfo.file)
          .then(response => response.text())
          .then(content => {
            document.getElementById('content').innerHTML = content;
            document.title = articleInfo.title + ' - SimpleWiki';
          })
          .catch(err => {
            console.error('Error loading article:', err);
          });
      } else {
        document.getElementById('content').innerHTML = `
          <div class="article">
            <h1 class="article-title">Article Not Found</h1>
            <div class="article-content">
              <p>The article "${articleId}" does not exist. You can return to the <a href="articles/Main_Page.html">Main Page</a> or check the <a href="articles/Help.html">Help</a> section.</p>
            </div>
          </div>
        `;
      }
    }

    function searchWiki() {
      const searchInput = document.getElementById('searchInput');
      const searchTerm = searchInput.value.toLowerCase();
      const contentDiv = document.getElementById('content');
      
      if (searchTerm.trim() === '') {
        // Optionally, you can load a default article here if the search is empty.
        // For example: loadArticle('Main_Page');
        contentDiv.innerHTML = '';
        return;
      }
      
      const results = [];
      
      // Search through the external wikiIndex
      for (const articleId in wikiIndex) {
        // Skip any special keys if needed (e.g., Random_Article if not searchable)
        if (articleId !== 'Random_Article') {
          const article = wikiIndex[articleId];
          // Search in both the title and the snippet
          if (article.title.toLowerCase().includes(searchTerm) ||
              article.snippet.toLowerCase().includes(searchTerm)) {
            results.push({
              id: articleId,
              title: article.title,
              snippet: article.snippet
            });
          }
        }
      }
      
      // Build the HTML for search results with links to separate article files
      if (results.length > 0) {
        let resultsHTML = `
          <div class="search-results">
            <h2>Search Results for "${searchTerm}"</h2>
        `;
        results.forEach(result => {
          resultsHTML += `
            <div class="result-item">
              <div class="result-title">
                <a href="${wikiIndex[result.id].file}">${result.title}</a>
              </div>
              <div class="result-snippet">${result.snippet}</div>
            </div>
          `;
        });
        resultsHTML += '</div>';
        contentDiv.innerHTML = resultsHTML;
        document.title = `Search: ${searchTerm} - SimpleWiki`;
      } else {
        contentDiv.innerHTML = `
          <div class="search-results">
            <h2>Search Results for "${searchTerm}"</h2>
            <p>No results found. Try different keywords or check the <a href="articles/Help.html">Help</a> section.</p>
          </div>
        `;
        document.title = `Search: ${searchTerm} - SimpleWiki`;
      }
    }

    // Allow search on pressing the Enter key
    document.getElementById('searchInput').addEventListener('keyup', function(event) {
      if (event.key === 'Enter') {
        searchWiki();
      }
    });
