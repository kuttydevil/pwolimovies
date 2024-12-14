const apiLocation = 'https://api.themoviedb.org/3';
const apiKey = 'e51447e837048930952e694908564da1'; // Replace with your actual TMDb API key

// --------------------- Utility Functions ---------------------

/**
 * Shows the loading spinner within a specified HTML element.
 * @param {HTMLElement} element - The HTML element to display the loading spinner within.
 */
function showLoading(element) {
    const spinner = element.querySelector('.loading-spinner');
    if (spinner) {
        spinner.style.display = 'block';
    } else {
        console.error("Error: loading-spinner not found within the element provided to showLoading(). Check your HTML structure.");
    }
}

/**
 * Hides the loading spinner within a specified HTML element.
 * @param {HTMLElement} element - The HTML element to hide the loading spinner within.
 */
function hideLoading(element) {
    const loadingSpinner = element.querySelector('.loading-spinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = 'none';
    }
}

// --------------------- Fetching Movie/TV Details  ---------------------

/**
 * Fetches detailed information about a specific movie from the TMDb API.
 * @param {number} movieId - The ID of the movie to fetch details for.
 * @returns {Promise<object>} A promise that resolves to the movie details as a JSON object.
 * @throws {Error} If the API request fails.
 */
async function getMovieDetails(movieId) {
    const movieDetailsUrl = `${apiLocation}/movie/${movieId}?api_key=${apiKey}`;
    const response = await fetch(movieDetailsUrl);
    if (!response.ok) {
        throw new Error(`HTTP error fetching movie details! status: ${response.status}`);
    }
    return await response.json();
}

// --------------------- Fetching Content Functions (Movies, TV Series, Malayalam Movies) ---------------------

/**
 * Fetches and displays popular movies from the TMDb API.
 * @param {number} [page=1] - The page number to fetch. Defaults to 1.
 * @param {boolean} [resetPage=false] - If true, resets the page counter and clears existing movies.
 */
let currentPageMovies = 1; // Keep track of the current page for Popular Movies.
async function getPopularMovies(page = 1, resetPage = false) {
    const movieList = document.getElementById('popular-movies'); // Correct ID
    const loadMoreLink = document.getElementById('load-more-popular-movies-link'); // Correct ID
    const movieListSpinner = document.getElementById('popular-movies-spinner'); // Loading Spinner for Popular Movies

    if (movieList) {
        showLoading(movieListSpinner);
        try {
            if (resetPage) {
                currentPageMovies = 1;
                movieList.innerHTML = ''; // Clear existing content on reset
            }
            const response = await fetch(`${apiLocation}/movie/popular?api_key=${apiKey}&page=${currentPageMovies}`);
            if (!response.ok) {
                throw new Error(`HTTP error fetching popular movies! status: ${response.status}`);
            }
            const data = await response.json();
            if (data && data.results) {
                data.results.forEach(movie => {
                    const movieCard = createMovieCard(movie);
                    movieList.appendChild(movieCard);
                });
                currentPageMovies++;
                loadMoreLink.style.display = 'block'; // Show Load More after first load

                if (data.results.length < 20 || currentPageMovies > data.total_pages) {
                    loadMoreLink.style.display = 'none'; //Hide if no more pages
                }
            }
        } catch (error) {
            console.error("Error fetching popular movies:", error);
            movieList.innerHTML += `<p>Error fetching movies: ${error.message}</p>`;
        } finally {
            hideLoading(movieListSpinner);
        }
    } else {
        console.error('Error: popular-movies element not found.');
    }
}


/**
 * Fetches and displays the latest Malayalam movies from the TMDb API.
 * @param {number} [page=1] - The page number to fetch. Defaults to 1.
 * @param {boolean} [resetPage=false] - If true, resets the page counter and clears existing movies.
 */
let currentPageMalayalam = 1; // Keep track of the current page for Malayalam Movies.
async function getMalayalamMovies(page = 1, resetPage = false) {
    const malayalamMovieList = document.getElementById('malayalam-movies');
    const loadMoreLink = document.getElementById('load-more-malayalam-movies-link');
    const malayalamMoviesSpinner = document.getElementById('malayalam-movies-spinner');

    if (malayalamMovieList) {
        showLoading(malayalamMoviesSpinner);
        try {
            if (resetPage) {
                currentPageMalayalam = 1;
                malayalamMovieList.innerHTML = '';
            }

            const response = await fetch(`${apiLocation}/discover/movie?api_key=${apiKey}&with_original_language=ml&sort_by=release_date.desc&release_date.gte=${new Date().getFullYear()}-01-01&page=${currentPageMalayalam}`);
            if (!response.ok) {
                throw new Error(`HTTP error fetching Malayalam movies! status: ${response.status}`);
            }
            const data = await response.json();

            if (data && data.results) {
                data.results.forEach(movie => {
                    const movieCard = createMovieCard(movie);
                    malayalamMovieList.appendChild(movieCard);
                });
                currentPageMalayalam++;
                loadMoreLink.style.display = 'block'; // Show Load More after first load

                if (data.results.length < 20 || currentPageMalayalam > data.total_pages) {
                  loadMoreLink.style.display = 'none'; //Hide if no more pages
                }
            }
        } catch (error) {
            console.error("Error fetching Malayalam movies:", error);
            malayalamMovieList.innerHTML += `<p>Error fetching Malayalam movies: ${error.message}</p>`;
        } finally {
             hideLoading(malayalamMoviesSpinner);
        }
    } else {
        console.error('Error: malayalam-movies element not found.');
    }
}

/**
 * Fetches and displays popular TV series from the TMDb API.
 * @param {number} [page=1] - The page number to fetch. Defaults to 1.
 * @param {boolean} [resetPage=false] - If true, resets the page counter and clears existing series.
 */
let currentPageTVShows = 1; // Keep track of the current page for TV Series.
async function getPopularTVSeries(page = 1, resetPage = false) {
    const tvSeriesList = document.getElementById('popular-tv-shows');
    const loadMoreLink = document.getElementById('load-more-popular-tv-shows-link');
    const tvShowsSpinner = document.getElementById('popular-tv-shows-spinner');

    if (tvSeriesList) {
        showLoading(tvShowsSpinner);
        try {
            if (resetPage) {
                currentPageTVShows = 1;
                tvSeriesList.innerHTML = '';
            }

            const response = await fetch(`${apiLocation}/tv/top_rated?api_key=${apiKey}&page=${currentPageTVShows}`);
            if (!response.ok) {
                throw new Error(`HTTP error fetching popular TV series! status: ${response.status}`);
            }
            const data = await response.json();

            if (data && data.results) {
                data.results.forEach(tvSeries => {
                    const tvSeriesCard = createMovieCard(tvSeries);
                    tvSeriesList.appendChild(tvSeriesCard);
                });
                currentPageTVShows++;
                loadMoreLink.style.display = 'block'; // Show Load More after first load

                if (data.results.length < 20 || currentPageTVShows > data.total_pages) {
                    loadMoreLink.style.display = 'none'; //Hide if no more pages
                }
            }
        } catch (error) {
            console.error("Error fetching popular TV series:", error);
            tvSeriesList.innerHTML += `<p>Error fetching TV series: ${error.message}</p>`;
        } finally {
             hideLoading(tvShowsSpinner);
        }
    } else {
        console.error('Error: popular-tv-shows element not found.');
    }
}

// --------------------- Creating Movie Card Function ---------------------

/**
 * Creates an HTML anchor element (movie card) for a given movie or tv series.
 * @param {object} media - The movie or tv series object from the API.
 * @returns {HTMLAnchorElement} The created movie card as an anchor element.
 */
function createMovieCard(media) {
    const movieCardLink = document.createElement('a');

    // Correct URL construction - Encode only ONCE:
    movieCardLink.href = `movie-details.html?id=${media.id}&title=${encodeURIComponent(media.title || media.name)}&type=${media.title ? 'movie' : 'tv'}`;
    movieCardLink.classList.add('movie-card');

    movieCardLink.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w300${media.poster_path}" alt="${media.title || media.name}" onerror="this.src='/img/404.jpg';">
        <h3>${media.title || media.name}</h3>
    `;

    return movieCardLink;
}

// --------------------- Search Functionality ---------------------

/**
 * Searches for movies or TV shows based on user input.
 * Updates the UI with search results and handles API errors.
 */
async function searchMovies() {
  const query = document.getElementById('search-input').value.trim();
  const searchType = document.querySelector('input[name="search_type"]:checked').value;

  if (!query) {
      alert("Please enter a search query.");
      return;
  }

  const processedQuery = query.replace(/\s+/g, ""); // Remove spaces from search query
  const newURL = `?query=${encodeURIComponent(processedQuery)}`; // Simplified URL
  history.pushState({}, "", newURL); // Update URL

  const searchUrl = `${apiLocation}/search/${searchType}?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

  const movieList = document.getElementById('popular-movies');
  const tvSeriesList = document.getElementById('popular-tv-shows');
  const malayalamMovieList = document.getElementById('malayalam-movies');
  const moviesLoadMore = document.getElementById('load-more-popular-movies-link');
  const tvShowsLoadMore = document.getElementById('load-more-popular-tv-shows-link');
  const resultsTitle = document.getElementById('resultsTitle');

  // Show loading spinners only if the elements exist
    if (movieList) showLoading(document.getElementById('popular-movies-spinner'));
    if (tvSeriesList) showLoading(document.getElementById('popular-tv-shows-spinner'));
    if (malayalamMovieList) showLoading(document.getElementById('malayalam-movies-spinner'));


  try {
      const response = await fetch(searchUrl);
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      movieList.innerHTML = ''; // Clear previous results
      tvSeriesList.innerHTML = ''; // Clear previous results
      malayalamMovieList.innerHTML = ''; // Clear previous results
      resultsTitle.textContent = `Search Results for "${decodeURIComponent(query)}"`; // Update the title

      if (data.results && data.results.length > 0) {
          if (searchType === 'movie') {
              data.results.forEach(movie => {
                  const movieCard = createMovieCard(movie);
                  movieList.appendChild(movieCard);
              });
          } else if (searchType === 'tv') {
              data.results.forEach(tvSeries => {
                  const tvSeriesCard = createMovieCard(tvSeries);
                  tvSeriesList.appendChild(tvSeriesCard);
              });
          }
      } else {
           resultsTitle.textContent = `No results found for "${decodeURIComponent(query)}"`; // Update the title
      }

       handleLoadMoreVisibilityAfterSearch(searchType, data.total_pages, moviesLoadMore, tvShowsLoadMore);

  } catch (error) {
       resultsTitle.textContent = `Error searching: ${error.message}`; // Update the title
       if (movieList) movieList.innerHTML = `<p>Error searching movies: ${error.message}</p>`;
        if (tvSeriesList) tvSeriesList.innerHTML = `<p>Error searching TV series: ${error.message}</p>`;
        if (malayalamMovieList) malayalamMovieList.innerHTML = `<p>Error searching Malayalam movies: ${error.message}</p>`;
  } finally {
      // Hide loading spinners after API call
        if (movieList) hideLoading(document.getElementById('popular-movies-spinner'));
        if (tvSeriesList) hideLoading(document.getElementById('popular-tv-shows-spinner'));
        if (malayalamMovieList) hideLoading(document.getElementById('malayalam-movies-spinner'));
  }
}


// --------------------- Load More Management Function ---------------------

/**
 * Manages the visibility of Load More buttons after a search.
 * @param {string} searchType - The type of content searched ('movie' or 'tv').
 * @param {number} totalPages - Total number of pages of search results.
 * @param {HTMLElement} moviesLoadMore - The "Load More" button for movies.
 * @param {HTMLElement} tvShowsLoadMore - The "Load More" button for TV shows.
 */
function handleLoadMoreVisibilityAfterSearch(searchType, totalPages, moviesLoadMore, tvShowsLoadMore) {
    moviesLoadMore.style.display = 'none';
    tvShowsLoadMore.style.display = 'none';

    if (totalPages > 1) {
        if (searchType === 'movie') {
            moviesLoadMore.style.display = 'block';
            currentPageMovies = 2;
        } else if (searchType === 'tv') {
            tvShowsLoadMore.style.display = 'block';
            currentPageTVShows = 2;
        }
    }
}

// --------------------- Event Listeners ---------------------

// Trigger search on Enter key press
document.getElementById('search-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchMovies();
    }
});

// Load More Links Event Listeners
document.getElementById('load-more-popular-movies-link').addEventListener('click', (event) => {
    event.preventDefault();
    getPopularMovies(currentPageMovies);
});

document.getElementById('load-more-malayalam-movies-link').addEventListener('click', (event) => {
    event.preventDefault();
    getMalayalamMovies(currentPageMalayalam);
});

document.getElementById('load-more-popular-tv-shows-link').addEventListener('click', (event) => {
    event.preventDefault();
    getPopularTVSeries(currentPageTVShows);
});

// Dispatch a custom event when all API data is loaded
function dispatchAPILoadedEvent() {
    const event = new Event('apiDataLoaded');
    document.dispatchEvent(event);
}

// --------------------- Initial Page Load ---------------------

/**
 * Updates the document title with the movie title after movie detail is loaded.
 * Fetches initial content if no query parameter is present and also manages the title of the page.
 */
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');
    const titleElement = document.getElementById('dynamicTitle');

    function updateTitle() {
       const urlParams = new URLSearchParams(window.location.search);
        const title = urlParams.get('title');
        const type = urlParams.get('type');

        if(title && type){
             const decodedTitle = decodeURIComponent(title);
            titleElement.textContent = `Watch ${decodedTitle} Free Online - PwoliMovies`;
        }else{
             titleElement.textContent = `PwoliMovies - Watch Free Movies & TV Shows Online`;
        }
    }

  updateTitle()

    if (query) {
        //Remove any spaces from query before setting input value
        const processedQuery = decodeURIComponent(query).replace(/\s+/g, "");
        document.getElementById('search-input').value = processedQuery;
        searchMovies(); // Trigger search with the query from the URL
    } else {
        // Load default content if no query parameter
        Promise.all([
            getPopularMovies(1, true),
            getMalayalamMovies(1, true),
            getPopularTVSeries(1, true)
        ]).then(() => {
            dispatchAPILoadedEvent();
        });
    }
});
