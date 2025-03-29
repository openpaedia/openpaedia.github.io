document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('all-articles-list');

    async function fetchAndDisplayAllArticles() {
        try {
            const response = await fetch('articles.json');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const articles = await response.json();

            if (articles.length === 0) {
                listContainer.innerHTML = '<p>No articles found in the manifest file (articles.json).</p>';
                return;
            }

            // Create an unordered list
            const ul = document.createElement('ul');
            articles.forEach(article => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                // Link back to index.html with a query parameter
                a.href = `index.html?article=${encodeURIComponent(article.file)}`;
                a.textContent = article.title; // Display the user-friendly title
                li.appendChild(a);
                ul.appendChild(li);
            });

            listContainer.innerHTML = ''; // Clear loading message
            listContainer.appendChild(ul);

        } catch (error) {
            console.error('Error fetching or displaying article list:', error);
            listContainer.innerHTML = `<p><strong>Error:</strong> Could not load the list of articles. Please check 'articles.json' and ensure the server is running correctly.</p>`;
        }
    }

    // --- Initial Load ---
    fetchAndDisplayAllArticles();
});