const searchBar = document.getElementById('search-bar');
    const searchButton = document.getElementById('search-button');
    const resultsDiv = document.getElementById('results');

    async function fetchMovies() {
      try {
        const response = await fetch('assets/json/movie.json');
        const movies = await response.json();
        return movies["/movie"]; // Access the array of movies from the '/movie' property
      } catch (error) {
        console.error("Error loading movies:", error);
        return []; // Return an empty array on error
      }
    }

    function displayResults(movies) {
      resultsDiv.innerHTML = '';

      if (movies.length === 0) {
        resultsDiv.innerHTML = '<p>No matching movies found.</p>';
        return;
      }

      movies.forEach(movie => {
        const movieEntry = document.createElement('div');
        movieEntry.classList.add('movie-entry');

        const movieTitle = document.createElement('h2');
        movieTitle.textContent = movie.title;
        movieEntry.appendChild(movieTitle);

        const linkContainer = document.createElement('div');
        linkContainer.innerHTML = ` 
        <a href="${movie.link}" class="movie-link" target="_blank">${movie.quality}</a>
        <button class="copy-button" data-link="${movie.link}">Copy</button>
      `;
        movieEntry.appendChild(linkContainer);

        resultsDiv.appendChild(movieEntry);
      });

      // Add event listeners to copy buttons 
      const copyButtons = document.querySelectorAll('.copy-button');
      copyButtons.forEach(button => {
        button.addEventListener('click', () => {
          const linkToCopy = button.dataset.link;
          navigator.clipboard.writeText(linkToCopy)
            .then(() => {
              button.textContent = 'Copied!';
            })
            .catch(err => {
              console.error('Failed to copy link: ', err);
            });
        });
      });
    }

    async function performSearch() {
      const searchTerm = searchBar.value.trim().toLowerCase(); // Trim whitespace

      // Check if the search term is empty
      if (searchTerm === "") {
        resultsDiv.innerHTML = '<p>Please enter a movie title.</p>';
        return;
      }

      const allMovies = await fetchMovies();
      const filteredMovies = allMovies.filter(movie =>
        movie.title.toLowerCase().includes(searchTerm)
      );

      displayResults(filteredMovies);
    }

    searchButton.addEventListener('click', performSearch);