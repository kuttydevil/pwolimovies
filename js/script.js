const apiLocation = 'https://api.themoviedb.org/3';
const apiKey = 'e51447e837048930952e694908564da1'; // Replace with your actual TMDb API key
const initialPagesToLoad = 3; // Number of initial pages to load
let currentPageMovies = 1;
let currentPageMalayalam = 1;
let currentPageTVShows = 1;


// --------------------- Utility Functions ---------------------

/**
 * Shows the loading spinner within a specified HTML element.
 * @param {HTMLElement} element - The HTML element containing the loading spinner.
 */
function showLoading(element) {
    if (element) {
        element.style.display = 'flex'; 
    } else {
        console.error("Error: loading-spinner element not found.");
    }
}

/**
 * Hides the loading spinner within a specified HTML element.
 * @param {HTMLElement} element - The HTML element containing the loading spinner.
 */
function hideLoading(element) {
    if (element) {
        element.style.display = 'none';
    }
}

// --------------------- Fetching Movie/TV Details  ---------------------

async function getMovieDetails(movieId) {
    const movieDetailsUrl = `${apiLocation}/movie/${movieId}?api_key=${apiKey}`;
    const response = await fetch(movieDetailsUrl);
    if (!response.ok) {
        throw new Error(`HTTP error fetching movie details! status: ${response.status}`);
    }
    return await response.json();
}


// --------------------- Fetching Content Functions ---------------------


async function getPopularMovies(page = 1, append = false) {
    const movieList = document.getElementById('popular-movies');
    const loadMoreLink = document.getElementById('load-more-popular-movies-link');
    const movieListSpinner = document.getElementById('popular-movies-spinner');

    if (movieList) {
        showLoading(movieListSpinner);
        try {
            if (!append) {
                movieList.innerHTML = ''; // Clear existing content if not appending
            }

            const response = await fetch(`${apiLocation}/movie/popular?api_key=${apiKey}&page=${page}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data && data.results) {
                data.results.forEach(movie => {
                    const movieCard = createMovieCard(movie);
                    movieList.appendChild(movieCard);
                });

                // Update Load More link visibility and URL
                updateLoadMoreLink(loadMoreLink, data.page, data.total_pages, 'moviePage');


            } else {
               loadMoreLink.style.display = 'none'; // Hide if no results

            }
        } catch (error) {
            console.error("Error fetching popular movies:", error);
             movieList.innerHTML = `<p>Error fetching movies: ${error.message}</p>`; // Display error message
        } finally {
            hideLoading(movieListSpinner);
        }
    } else {
        console.error('Error: popular-movies element not found.');
    }
}


async function getMalayalamMovies(page = 1, append = false) {
    const malayalamMovieList = document.getElementById('malayalam-movies');
        const loadMoreLink = document.getElementById('load-more-malayalam-movies-link');
    const malayalamMoviesSpinner = document.getElementById('malayalam-movies-spinner');


    if (malayalamMovieList) {
         showLoading(malayalamMoviesSpinner);
        try {

            if (!append) {
                malayalamMovieList.innerHTML = ''; // Clear existing content if not appending
            }

          const response = await fetch(`${apiLocation}/discover/movie?api_key=${apiKey}&with_original_language=ml&sort_by=release_date.desc&release_date.gte=${new Date().getFullYear()}-01-01&page=${page}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data && data.results) {
                data.results.forEach(movie => {
                    const movieCard = createMovieCard(movie);
                     malayalamMovieList.appendChild(movieCard);
                });
                  // Update Load More link visibility and URL
                updateLoadMoreLink(loadMoreLink, data.page, data.total_pages, 'malayalamPage');


            } else {
               loadMoreLink.style.display = 'none'; // Hide if no results

            }

        } catch (error) {
            console.error("Error fetching Malayalam movies:", error);
            malayalamMovieList.innerHTML = `<p>Error fetching Malayalam movies: ${error.message}</p>`; // Display error message
        } finally {
            hideLoading(malayalamMoviesSpinner);
        }
    } else {
        console.error('Error: malayalam-movies element not found.');
    }
}


async function getPopularTVSeries(page = 1, append = false) {
    const tvSeriesList = document.getElementById('popular-tv-shows');
    const loadMoreLink = document.getElementById('load-more-popular-tv-shows-link');
    const tvShowsSpinner = document.getElementById('popular-tv-shows-spinner');

    if (tvSeriesList) {
        showLoading(tvShowsSpinner);
        try {
             if (!append) {
                tvSeriesList.innerHTML = ''; // Clear existing content if not appending
            }
            const response = await fetch(`${apiLocation}/tv/top_rated?api_key=${apiKey}&page=${page}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data && data.results) {
                data.results.forEach(tvSeries => {
                    const tvSeriesCard = createMovieCard(tvSeries);
                    tvSeriesList.appendChild(tvSeriesCard);
                });
                // Update Load More link visibility and URL
                updateLoadMoreLink(loadMoreLink, data.page, data.total_pages, 'tvPage');

            } else {
                loadMoreLink.style.display = 'none'; // Hide if no results
            }
        } catch (error) {
            console.error("Error fetching popular TV series:", error);
             tvSeriesList.innerHTML = `<p>Error fetching TV series: ${error.message}</p>`; // Display error message

        } finally {
            hideLoading(tvShowsSpinner);
        }
    } else {
        console.error('Error: popular-tv-shows element not found.');
    }
}


function createMovieCard(media) {
    const movieCardLink = document.createElement('a');
    movieCardLink.href = `movie-details.html?id=${media.id}&title=${encodeURIComponent(media.title || media.name)}&type=${media.title ? 'movie' : 'tv'}`;
    movieCardLink.classList.add('movie-card');
    movieCardLink.innerHTML = `
        <div class="placeholder">
            <div class="spinner"></div>
        </div>
        <img src="https://image.tmdb.org/t/p/w300${media.poster_path}" alt="${media.title || media.name}" onerror="this.src='/img/404.jpg';" loading="lazy" data-src="https://image.tmdb.org/t/p/w300${media.poster_path}">
        <h3>${media.title || media.name}</h3>
    `;

    const img = movieCardLink.querySelector('img');
    const placeholder = movieCardLink.querySelector('.placeholder');

    // Image loaded successfully
    img.onload = () => {
        img.classList.add('loaded');
        placeholder.classList.add('loaded');  // Hide placeholder
    };

    // Error loading image
    img.onerror = () => {
        placeholder.classList.add('loaded'); // Hide placeholder even on error
    };

    // Trigger lazy loading
    if (img.dataset.src) {
        img.src = img.dataset.src;
    }

    return movieCardLink;
}



// --------------------- Search Functionality ---------------------

async function searchMovies() {
    const query = document.getElementById('search-input').value.trim();
    const searchType = document.querySelector('input[name="search_type"]:checked').value;

    if (!query) {
        alert("Please enter a search query.");
        return;
    }

    // Process query and update URL
    const processedQuery = query.replace(/\s+/g, "");
    const newURL = `?query=${encodeURIComponent(processedQuery)}`;
    history.pushState({}, "", newURL);

    // Construct search URL
    const searchUrl = `${apiLocation}/search/${searchType}?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

    // DOM elements
    const movieList = document.getElementById('popular-movies');
    const tvSeriesList = document.getElementById('popular-tv-shows');
    const malayalamMovieList = document.getElementById('malayalam-movies');
    const searchResultsContainer = document.getElementById('search-results');
    const resultsTitle = document.getElementById('resultsTitle');
    const popularMoviesSection = document.getElementById('popular-movies-section');
    const popularTVShowsSection = document.getElementById('popular-tv-shows-section');
    const malayalamMoviesSection = document.getElementById('malayalam-movies-section');


    // Show loading indicators for relevant sections
    if (movieList) showLoading(document.getElementById('popular-movies-spinner'));
    if (tvSeriesList) showLoading(document.getElementById('popular-tv-shows-spinner'));
    if (malayalamMovieList) showLoading(document.getElementById('malayalam-movies-spinner'));


    try {
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();


        searchResultsContainer.innerHTML = ''; // Clear previous search results

        if (data.results && data.results.length > 0) {
            // Display search results
            searchResultsContainer.style.display = 'grid';
            popularMoviesSection.style.display = 'none';
            popularTVShowsSection.style.display = 'none';
            malayalamMoviesSection.style.display = 'none';
            resultsTitle.textContent = `Search Results for "${decodeURIComponent(query)}"`;

            data.results.forEach(result => {
                const card = createMovieCard(result);
                searchResultsContainer.appendChild(card);
            });
        } else {
           // No results found
            searchResultsContainer.style.display = 'block'; //should be block to display error message
            popularMoviesSection.style.display = 'none';
            popularTVShowsSection.style.display = 'none';
            malayalamMoviesSection.style.display = 'none';
            resultsTitle.textContent = `No results found for "${decodeURIComponent(query)}"`;
        }
         scrollToTop();

    } catch (error) {
        console.error("Error during search:", error);
          resultsTitle.textContent = `Error searching: ${error.message}`;

    } finally {
          // Hide loading indicators
        if (movieList) hideLoading(document.getElementById('popular-movies-spinner'));
        if (tvSeriesList) hideLoading(document.getElementById('popular-tv-shows-spinner'));
        if (malayalamMovieList) hideLoading(document.getElementById('malayalam-movies-spinner'));
    }
}

// --------------------- Load More Functionality ---------------------
function updateLoadMoreLink(linkElement, currentPage, totalPages, pageParam) {
    if (currentPage < totalPages) {
        linkElement.style.display = 'block';
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set(pageParam, currentPage + 1);
        linkElement.href = newUrl.toString();
    } else {
        linkElement.style.display = 'none';
    }
}

// --------------------- Event Listeners ---------------------

document.getElementById('search-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchMovies();
    }
});


document.getElementById('load-more-popular-movies-link').addEventListener('click', (event) => {
    event.preventDefault();
        const movieListSpinner = document.getElementById('popular-movies-spinner');

    showLoading(movieListSpinner);

    currentPageMovies++;
    getPopularMovies(currentPageMovies, true);
     history.pushState({}, "", `?moviePage=${currentPageMovies}`);


});

document.getElementById('load-more-malayalam-movies-link').addEventListener('click', (event) => {
    event.preventDefault();
    const malayalamMoviesSpinner = document.getElementById('malayalam-movies-spinner');
     showLoading(malayalamMoviesSpinner);
    currentPageMalayalam++;
    getMalayalamMovies(currentPageMalayalam, true);
     history.pushState({}, "", `?malayalamPage=${currentPageMalayalam}`);

});

document.getElementById('load-more-popular-tv-shows-link').addEventListener('click', (event) => {
    event.preventDefault();
    const tvShowsSpinner = document.getElementById('popular-tv-shows-spinner');
     showLoading(tvShowsSpinner);
    currentPageTVShows++;
    getPopularTVSeries(currentPageTVShows, true);
     history.pushState({}, "", `?tvPage=${currentPageTVShows}`);

});


// --------------------- Auto Scroll to Top Function ---------------------

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// --------------------- Initial Page Load ---------------------

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('query');
    // ... other params ...

    const titleElement = document.getElementById('dynamicTitle');
    const searchResultsContainer = document.getElementById('search-results');
    const popularMoviesSection = document.getElementById('popular-movies-section');
    const popularTVShowsSection = document.getElementById('popular-tv-shows-section');
    const malayalamMoviesSection = document.getElementById('malayalam-movies-section');
    const movieListSpinner = document.getElementById('popular-movies-spinner');
        const malayalamMoviesSpinner = document.getElementById('malayalam-movies-spinner');
    const tvShowsSpinner = document.getElementById('popular-tv-shows-spinner');

    // ...updateTitle Function

    if (query) {
        const processedQuery = decodeURIComponent(query).replace(/\s+/g, "");
        document.getElementById('search-input').value = processedQuery;
        searchMovies();
    } else {

        searchResultsContainer.style.display = 'none';
        popularMoviesSection.style.display = 'block';
        popularTVShowsSection.style.display = 'block';
        malayalamMoviesSection.style.display = 'block';

          currentPageMovies = 1;
        currentPageMalayalam = 1;
        currentPageTVShows = 1;


        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('moviePage');
        newUrl.searchParams.delete('malayalamPage');
        newUrl.searchParams.delete('tvPage');
        history.replaceState({}, '', newUrl.toString());

        Promise.all([
            getPopularMovies(currentPageMovies),
            getMalayalamMovies(currentPageMalayalam),
            getPopularTVSeries(currentPageTVShows),
        ]).then(() => {


            for (let i = 2; i <= initialPagesToLoad; i++) {
                 showLoading(movieListSpinner);
                 showLoading(malayalamMoviesSpinner);
                 showLoading(tvShowsSpinner);
                Promise.all([
                    getPopularMovies(i, true),
                    getMalayalamMovies(i, true),
                    getPopularTVSeries(i, true)
                ]).then(() => {

                    currentPageMovies = i;
                    currentPageMalayalam = i;
                    currentPageTVShows = i;

                }).finally(() => {
           hideLoading(movieListSpinner);
           hideLoading(malayalamMoviesSpinner);
           hideLoading(tvShowsSpinner);
        });
            }

            scrollToTop();

        }).finally(() => {
           hideLoading(movieListSpinner);
           hideLoading(malayalamMoviesSpinner);
           hideLoading(tvShowsSpinner);
        });
    }


    scrollToTop();
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
