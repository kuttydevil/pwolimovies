const apiLocation = 'https://api.themoviedb.org/3';
const apiKey = '9b92d50baa23664db9f1455d0bbc74fc'; // Replace with your actual TMDb API key
const initialPagesToLoad = 3; // Number of initial pages to load
let currentPageMovies = 1;
let currentPageMalayalam = 1;
let currentPageTVShows = 1;
let isInitialLoad = true;

// --------------------- Utility Functions ---------------------

/**
 * Shows the loading spinner within a specified HTML element.
 * @param {HTMLElement} element - The HTML element to display the loading spinner within.
 */
function showLoading(element) {
    if (element) {
      const spinner = element.querySelector('.loading-spinner'); // Find the spinner within the parent
      if (spinner) {
           spinner.style.display = 'flex';
       } else {
           console.error("Error: loading-spinner not found within the element provided to showLoading(). Check your HTML structure.");
       }
    } else {
        console.error("Error: Element passed to showLoading() is null or undefined.");
    }
}

/**
 * Hides the loading spinner within a specified HTML element.
 * @param {HTMLElement} element - The HTML element to hide the loading spinner within.
 */
function hideLoading(element) {
  if (element) {
    const spinner = element.querySelector('.loading-spinner'); // Find the spinner within the parent
     if(spinner){
        spinner.style.display = 'none';
      }
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
 * @param {boolean} [append=false] - If true, appends the new movies to the existing list.
 */

async function getPopularMovies(page = 1, append = false) {
    const movieList = document.getElementById('popular-movies');
    const loadMoreLink = document.getElementById('load-more-popular-movies-link');
    const movieListSpinner = document.getElementById('popular-movies-section'); // Correctly getting the section
    if (movieListSpinner) {  // add the null check
        showLoading(movieListSpinner);
    }
    try {
        if (!append) {
            movieList.innerHTML = '';
        }
        const response = await fetch(`${apiLocation}/movie/popular?api_key=${apiKey}&page=${page}`);
        if (!response.ok) {
            throw new Error(`HTTP error fetching popular movies! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.results) {
            data.results.forEach(movie => {
                const movieCard = createMovieCard(movie);
                movieList.appendChild(movieCard);
            });

            if (data.page < data.total_pages) {
                loadMoreLink.style.display = 'block';
                // Update Load More Link URL
                const newUrl = new URL(window.location.href);
                newUrl.searchParams.set('moviePage', page + 1);
                loadMoreLink.href = newUrl.toString();
            } else {
                loadMoreLink.style.display = 'none';
            }

        } else {
            loadMoreLink.style.display = 'none';
        }
    } catch (error) {
        console.error("Error fetching popular movies:", error);
        movieList.innerHTML += `<p>Error fetching movies: ${error.message}</p>`;
    } finally {
        if(movieListSpinner){ // add the null check
          hideLoading(movieListSpinner);
        }
    }

}

/**
 * Fetches and displays the latest Malayalam movies from the TMDb API.
 * @param {number} [page=1] - The page number to fetch. Defaults to 1.
 * @param {boolean} [append=false] - If true, appends the new movies to the existing list.
 */

async function getMalayalamMovies(page = 1, append = false) {
    const malayalamMovieList = document.getElementById('malayalam-movies');
    const loadMoreLink = document.getElementById('load-more-malayalam-movies-link');
      const malayalamMoviesSpinner = document.getElementById('malayalam-movies-section');
    if(malayalamMoviesSpinner){
      showLoading(malayalamMoviesSpinner);
    }
        try {
            if (!append) {
                malayalamMovieList.innerHTML = '';
            }
            const response = await fetch(`${apiLocation}/discover/movie?api_key=${apiKey}&with_original_language=ml&sort_by=release_date.desc&release_date.gte=${new Date().getFullYear()}-01-01&page=${page}`);
            if (!response.ok) {
                throw new Error(`HTTP error fetching Malayalam movies! status: ${response.status}`);
            }
            const data = await response.json();

            if (data && data.results) {
                data.results.forEach(movie => {
                    const movieCard = createMovieCard(movie);
                    malayalamMovieList.appendChild(movieCard);
                });

                if (data.page < data.total_pages) {
                    loadMoreLink.style.display = 'block';
                    // Update Load More Link URL
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.set('malayalamPage', page + 1);
                    loadMoreLink.href = newUrl.toString();
                } else {
                    loadMoreLink.style.display = 'none';
                }

            } else {
                loadMoreLink.style.display = 'none';
            }
        } catch (error) {
            console.error("Error fetching Malayalam movies:", error);
            malayalamMovieList.innerHTML += `<p>Error fetching Malayalam movies: ${error.message}</p>`;
        } finally {
           if(malayalamMoviesSpinner){
              hideLoading(malayalamMoviesSpinner);
          }
        }
}

/**
 * Fetches and displays popular TV series from the TMDb API.
 * @param {number} [page=1] - The page number to fetch. Defaults to 1.
 * @param {boolean} [append=false] - If true, appends the new series to the existing list.
 */

async function getPopularTVSeries(page = 1, append = false) {
    const tvSeriesList = document.getElementById('popular-tv-shows');
    const loadMoreLink = document.getElementById('load-more-popular-tv-shows-link');
      const tvShowsSpinner = document.getElementById('popular-tv-shows-section');
     if (tvShowsSpinner) {
        showLoading(tvShowsSpinner);
     }
        try {
            if (!append) {
                tvSeriesList.innerHTML = '';
            }

            const response = await fetch(`${apiLocation}/tv/top_rated?api_key=${apiKey}&page=${page}`);
            if (!response.ok) {
                throw new Error(`HTTP error fetching popular TV series! status: ${response.status}`);
            }
            const data = await response.json();
            if (data && data.results) {
                data.results.forEach(tvSeries => {
                    const tvSeriesCard = createMovieCard(tvSeries);
                    tvSeriesList.appendChild(tvSeriesCard);
                });
                if (data.page < data.total_pages) {
                    loadMoreLink.style.display = 'block';
                    // Update Load More Link URL
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.set('tvPage', page + 1);
                    loadMoreLink.href = newUrl.toString();
                } else {
                    loadMoreLink.style.display = 'none';
                }

            } else {
                loadMoreLink.style.display = 'none';
            }
        } catch (error) {
            console.error("Error fetching popular TV series:", error);
            tvSeriesList.innerHTML += `<p>Error fetching TV series: ${error.message}</p>`;
        } finally {
            if(tvShowsSpinner){
              hideLoading(tvShowsSpinner);
            }
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
    let basePath = window.location.pathname;

    if (basePath.startsWith('/multi/')) {
        basePath = basePath.substring(0, basePath.lastIndexOf('/multi/') + 1);
    } else {
        basePath = '/';
    }

    const movieDetailsUrl = `${basePath}movie-details.html?id=${media.id}&title=${encodeURIComponent(media.title || media.name)}&type=${media.title ? 'movie' : 'tv'}`;
    
    movieCardLink.href = movieDetailsUrl;
    movieCardLink.classList.add('movie-card');

    // Construct the image URL, handling null poster_path
    const posterUrl = media.poster_path 
        ? `https://image.tmdb.org/t/p/w300${media.poster_path}`
        : '/img/404.jpg'; // Use your 404 image as the default

    movieCardLink.innerHTML = `
        <div class="placeholder">
            <div class="spinner"></div>
        </div>
        <img src="${posterUrl}" alt="${media.title || media.name}" loading="lazy">
        <h3>${media.title || media.name}</h3>
    `;

    const img = movieCardLink.querySelector('img');
    const placeholder = movieCardLink.querySelector('.placeholder');

    img.onload = () => {
        img.classList.add('loaded');
        placeholder.classList.add('loaded');
    };

    // No need for onerror, as we set a valid default src

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
    const searchResultsContainer = document.getElementById('search-results');
    const moviesLoadMore = document.getElementById('load-more-popular-movies-link');
    const tvShowsLoadMore = document.getElementById('load-more-popular-tv-shows-link');
    const resultsTitle = document.getElementById('resultsTitle');
    const popularMoviesSection = document.getElementById('popular-movies-section');
    const popularTVShowsSection = document.getElementById('popular-tv-shows-section');
    const malayalamMoviesSection = document.getElementById('malayalam-movies-section');
    // Show loading spinners only if the elements exist
    if (popularMoviesSection) showLoading(popularMoviesSection);
    if (popularTVShowsSection) showLoading(popularTVShowsSection);
    if (malayalamMoviesSection) showLoading(malayalamMoviesSection);

    try {
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        searchResultsContainer.innerHTML = '';
        if (data.results && data.results.length > 0) {
            searchResultsContainer.style.display = 'grid';
            popularMoviesSection.style.display = 'none';
            popularTVShowsSection.style.display = 'none';
            malayalamMoviesSection.style.display = 'none';
            resultsTitle.textContent = `Search Results for "${decodeURIComponent(query)}"`; // Update the title
            if (searchType === 'movie') {
                data.results.forEach(movie => {
                    const movieCard = createMovieCard(movie);
                    searchResultsContainer.appendChild(movieCard);

                });

            } else if (searchType === 'tv') {

                data.results.forEach(tvSeries => {
                    const tvSeriesCard = createMovieCard(tvSeries);
                    searchResultsContainer.appendChild(tvSeriesCard);

                });

            }
        } else {
            searchResultsContainer.style.display = 'none';
            popularMoviesSection.style.display = 'block';
            popularTVShowsSection.style.display = 'block';
            malayalamMoviesSection.style.display = 'block';
            resultsTitle.textContent = `No results found for "${decodeURIComponent(query)}"`; // Update the title
        }

        handleLoadMoreVisibilityAfterSearch(searchType, data.total_pages, moviesLoadMore, tvShowsLoadMore);
        scrollToTop(); // Scroll to top after search
    } catch (error) {
        resultsTitle.textContent = `Error searching: ${error.message}`; // Update the title
        if (movieList) movieList.innerHTML = `<p>Error searching movies: ${error.message}</p>`;
        if (tvSeriesList) tvSeriesList.innerHTML = `<p>Error searching TV series: ${error.message}</p>`;
        if (malayalamMovieList) malayalamMovieList.innerHTML = `<p>Error searching Malayalam movies: ${error.message}</p>`;
    } finally {
        // Hide loading spinners after API call
        if(popularMoviesSection) hideLoading(popularMoviesSection);
        if(popularTVShowsSection) hideLoading(popularTVShowsSection);
        if(malayalamMoviesSection) hideLoading(malayalamMoviesSection);
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
            currentPageMovies = 1;
        } else if (searchType === 'tv') {
            tvShowsLoadMore.style.display = 'block';
            currentPageTVShows = 1;
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
    if (document.getElementById('load-more-popular-movies-link').style.display !== 'none') {
        const movieListSpinner = document.getElementById('popular-movies-section');
        showLoading(movieListSpinner);

        const nextPage = currentPageMovies + 1; // Calculate next page
        currentPageMovies = nextPage; // Update the current page

        getPopularMovies(nextPage, true).finally(() => hideLoading(movieListSpinner));
        history.pushState({}, "", `?moviePage=${nextPage}`); // Update URL
        console.log("Load more movies clicked. Current page:", nextPage);
    }
});

document.getElementById('load-more-malayalam-movies-link').addEventListener('click', (event) => {
    event.preventDefault();
    if (document.getElementById('load-more-malayalam-movies-link').style.display !== 'none') {
        const malayalamMoviesSpinner = document.getElementById('malayalam-movies-section');
        showLoading(malayalamMoviesSpinner);

        const nextPage = currentPageMalayalam + 1;
        currentPageMalayalam = nextPage;

        getMalayalamMovies(nextPage, true).finally(() => hideLoading(malayalamMoviesSpinner));
        history.pushState({}, "", `?malayalamPage=${nextPage}`);
        console.log("Load more Malayalam movies clicked. Current page:", nextPage);
    }
});

document.getElementById('load-more-popular-tv-shows-link').addEventListener('click', (event) => {
    event.preventDefault();
    if (document.getElementById('load-more-popular-tv-shows-link').style.display !== 'none') {
        const tvShowsSpinner = document.getElementById('popular-tv-shows-section');
        showLoading(tvShowsSpinner);

        const nextPage = currentPageTVShows + 1;
        currentPageTVShows = nextPage;

        getPopularTVSeries(nextPage, true).finally(() => hideLoading(tvShowsSpinner));
        history.pushState({}, "", `?tvPage=${nextPage}`);
        console.log("Load more TV shows clicked. Current page:", nextPage);
    }
});

// Dispatch a custom event when all API data is loaded
function dispatchAPILoadedEvent() {
    const event = new Event('apiDataLoaded');
    document.dispatchEvent(event);
}

// --------------------- Auto Scroll to Top Function ---------------------
/**
 * Scrolls the window to the top of the page.
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Optional: for smooth scrolling
    });
}

// --------------------- Initial Page Load & Infinite Scroll ---------------------

/**
 * Updates the document title with the movie title after movie detail is loaded.
 * Fetches initial content if no query parameter is present and also manages the title of the page.
 */
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');
    const moviePage = urlParams.get('moviePage');
    const malayalamPage = urlParams.get('malayalamPage');
    const tvPage = urlParams.get('tvPage');
    const titleElement = document.getElementById('dynamicTitle');
    const searchResultsContainer = document.getElementById('search-results');
    const popularMoviesSection = document.getElementById('popular-movies-section');
    const popularTVShowsSection = document.getElementById('popular-tv-shows-section');
    const malayalamMoviesSection = document.getElementById('malayalam-movies-section');

    function updateTitle() {
        const urlParams = new URLSearchParams(window.location.search);
        const title = urlParams.get('title');
        const type = urlParams.get('type');

        if (title && type) {
            const decodedTitle = decodeURIComponent(title);
            titleElement.textContent = `Watch ${decodedTitle} Free Online - PwoliMovies`;
        } else {
            titleElement.textContent = `PwoliMovies - Watch Free Movies & TV Shows Online`;
        }
    }
    updateTitle();

    if (query) {
        //Remove any spaces from query before setting input value
        const processedQuery = decodeURIComponent(query).replace(/\s+/g, "");
        document.getElementById('search-input').value = processedQuery;

        searchMovies(); // Trigger search with the query from the URL
    } else {
        // Load default content if no query parameter
        searchResultsContainer.style.display = 'none';
        popularMoviesSection.style.display = 'block';
        popularTVShowsSection.style.display = 'block';
        malayalamMoviesSection.style.display = 'block';

        // Reset page counters to 1 on initial load without a search query
        currentPageMovies = 1;
        currentPageMalayalam = 1;
        currentPageTVShows = 1;

        // Remove URL parameters after initial load
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('moviePage');
        newUrl.searchParams.delete('malayalamPage');
        newUrl.searchParams.delete('tvPage');
        history.replaceState({}, '', newUrl.toString());

        Promise.all([
            getPopularMovies(1),
            getMalayalamMovies(1),
            getPopularTVSeries(1),
        ]).then(() => {
            dispatchAPILoadedEvent();
            // Load initial pages 2 and 3
            for (let i = 2; i <= initialPagesToLoad; i++) {
                Promise.all([
                    getPopularMovies(i, true),
                    getMalayalamMovies(i, true),
                    getPopularTVSeries(i, true)
                ]).then(() => {
                    // Update current page after initial load
                    currentPageMovies = i;
                    currentPageMalayalam = i;
                    currentPageTVShows = i;
                });
            }
            isInitialLoad = false;
            scrollToTop(); // Scroll to top after initial load
        }).finally(() => {
            if(popularMoviesSection) hideLoading(popularMoviesSection)
            if(malayalamMoviesSection) hideLoading(malayalamMoviesSection)
            if(popularTVShowsSection) hideLoading(popularTVShowsSection)
        });

    }
    scrollToTop(); // Scroll to top on initial load
});

// Example of lazy loading images
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const image = entry.target;
            image.src = image.dataset.src;
            observer.unobserve(image);
        }
    });
});

document.querySelectorAll('img[loading="lazy"]').forEach(image => {
    observer.observe(image);
});
