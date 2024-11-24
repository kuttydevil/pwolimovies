const apiLocation = 'https://api.themoviedb.org/3';
const apiKey = 'e51447e837048930952e694908564da1'; // Replace with your actual TMDb API key
const torrentSearchAPI = 'https://itorrentsearch.vercel.app/api/';

// Function to show/hide loading spinners
function showLoading(element) {
    const spinner = element.querySelector('.loading-spinner');
    if (spinner) {
        spinner.style.display = 'block';
    } else {
        console.error("Error: loading-spinner not found within the element provided to showLoading(). Check your HTML structure.");
    }
}

function hideLoading(element) {
  const loadingSpinner = element.querySelector('.loading-spinner');
  if (loadingSpinner) {
      loadingSpinner.style.display = 'none';
  }
}

// Fetch movie details by ID
async function getMovieDetails(movieId) {
  const movieDetailsUrl = `${apiLocation}/movie/${movieId}?api_key=${apiKey}`;
  const response = await fetch(movieDetailsUrl);
  if (!response.ok) {
      throw new Error(`HTTP error fetching movie details! status: ${response.status}`);
  }
  return await response.json();
}

// Fetch popular movies
let currentPageMovies = 1;
async function getPopularMovies(page = 1, resetPage = false) {
    const movieList = document.getElementById('movie-details');
    const loadMoreLink = document.getElementById('load-more-movies-link');

    if (movieList) {
        showLoading(movieList);
        try {
            if (resetPage) {
                currentPageMovies = 1;
                movieList.innerHTML = ''; 
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

                if (data.results.length < 20 || currentPageMovies > data.total_pages) {
                    loadMoreLink.style.display = 'none'; 
                }
            }
        } catch (error) {
            console.error("Error fetching popular movies:", error);
            movieList.innerHTML += `<p>Error fetching movies: ${error.message}</p>`;
        } finally {
            hideLoading(movieList);
        }
    } else {
        console.error('Error: movie-details element not found.');
    }
}


// Fetch latest Malayalam Movies
let currentPageMalayalam = 1;
async function getMalayalamMovies(page = 1, resetPage = false) {
    const malayalamMovieList = document.getElementById('malayalam-movies');
    const loadMoreLink = document.getElementById('load-more-malayalam-link');

    if (malayalamMovieList) {
        showLoading(malayalamMovieList);
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
                if (data.results.length < 20 || currentPageMalayalam > data.total_pages) {
                    loadMoreLink.style.display = 'none'; 
                }
            }
        } catch (error) {
            console.error("Error fetching Malayalam movies:", error);
            malayalamMovieList.innerHTML += `<p>Error fetching Malayalam movies: ${error.message}</p>`;
        } finally {
            hideLoading(malayalamMovieList);
        }
    } else {
        console.error('Error: malayalam-movies element not found.');
    }
}

// Fetch popular TV series
let currentPageTVShows = 1;
async function getPopularTVSeries(page = 1, resetPage = false) {
    const tvSeriesList = document.getElementById('tv-series-details');
    const loadMoreLink = document.getElementById('load-more-tv-shows-link');

    if (tvSeriesList) {
        showLoading(tvSeriesList);
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
                if (data.results.length < 20 || currentPageTVShows > data.total_pages) {
                    loadMoreLink.style.display = 'none'; 
                }
            }
        } catch (error) {
            console.error("Error fetching popular TV series:", error);
            tvSeriesList.innerHTML += `<p>Error fetching TV series: ${error.message}</p>`;
        } finally {
            hideLoading(tvSeriesList);
        }
    } else {
        console.error('Error: tv-series-details element not found.');
    }
}

// Create a movie card
function createMovieCard(media) {
    const movieCardLink = document.createElement('a');
    movieCardLink.href = `movie-details.html?id=${media.id}&title=${encodeURIComponent(media.title || media.name)}&type=${media.title ? 'movie' : 'tv'}`; 
    movieCardLink.classList.add('movie-card');

    movieCardLink.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w300${media.poster_path}" alt="${media.title || media.name}" onerror="this.src='/img/404.jpg';">
        <h3>${media.title || media.name}</h3>
    `;

    return movieCardLink;
}

// Search for movies or TV shows (Corrected)
async function searchMovies() {
  const query = document.getElementById('search-input').value.trim();
  const searchType = document.querySelector('input[name="search_type"]:checked').value;

  if (!query) {
      alert("Please enter a search query.");
      return;
  }

  const searchUrl = `${apiLocation}/search/${searchType}?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

  const movieList = document.getElementById('movie-details');
  const tvSeriesList = document.getElementById('tv-series-details');
  const malayalamMovieList = document.getElementById('malayalam-movies');
  const moviesLoadMore = document.getElementById('load-more-movies-link');
  const tvShowsLoadMore = document.getElementById('load-more-tv-shows-link');


  // Show loading spinners only if the elements exist
  if (movieList) showLoading(movieList);
  if (tvSeriesList) showLoading(tvSeriesList);
  if (malayalamMovieList) showLoading(malayalamMovieList);

  try {
      const response = await fetch(searchUrl);
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      movieList.innerHTML = ''; // Clear previous results
      tvSeriesList.innerHTML = ''; // Clear previous results
      malayalamMovieList.innerHTML = ''; // Clear previous results

      if (data.results && data.results.length > 0) {
          if (searchType === 'movie') {
              data.results.forEach(movie => {
                  const movieCard = createMovieCard(movie);
                  movieList.appendChild(movieCard); // ADDING MOVIE CARDS HERE
              });
          } else if (searchType === 'tv') {
              data.results.forEach(tvSeries => {
                  const tvSeriesCard = createMovieCard(tvSeries);
                  tvSeriesList.appendChild(tvSeriesCard); // ADDING TV SERIES CARDS HERE
              });
          }
      } else {
          // Display "No results" message
          if (searchType === 'movie') {
              movieList.innerHTML = '<p>No results found.</p>';
          } else if (searchType === 'tv') {
              tvSeriesList.innerHTML = '<p>No TV series results found.</p>';
          }
      }

      handleLoadMoreVisibilityAfterSearch(searchType, data.total_pages, moviesLoadMore, tvShowsLoadMore);

  } catch (error) {
      // Display specific error messages to the user
      if (movieList) movieList.innerHTML = `<p>Error searching movies: ${error.message}</p>`;
      if (tvSeriesList) tvSeriesList.innerHTML = `<p>Error searching TV series: ${error.message}</p>`;
      if (malayalamMovieList) malayalamMovieList.innerHTML = `<p>Error searching Malayalam movies: ${error.message}</p>`;
  } finally {
      // Hide loading spinners after API call
      if (movieList) hideLoading(movieList);
      if (tvSeriesList) hideLoading(tvSeriesList);
      if (malayalamMovieList) hideLoading(malayalamMovieList);
  }
}

// Function to manage Load More button visibility after a search
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

// Trigger search on Enter key press
document.getElementById('search-input').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    searchMovies();
  }
});

// Function to handle URL search query
function handleURLQuery() {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('query');

  if (query) {
    document.getElementById('search-input').value = query; 
    searchMovies();  
  }
}

// Function to move the Load More button to the end of the container (Not strictly necessary now that we're using links)
function moveLoadMoreButtonToEnd(containerId, buttonId) {
  const container = document.getElementById(containerId);
  const loadMoreButtonContainer = document.getElementById(buttonId);
  if (container && loadMoreButtonContainer) {
      container.appendChild(loadMoreButtonContainer);
  } else {
      console.error("Error: Container or Load More button not found.");
  }
}

// Call the function to handle URL query when the page loads
window.addEventListener('DOMContentLoaded', handleURLQuery);

// Load More Links Event Listeners:
document.getElementById('load-more-movies-link').addEventListener('click', (event) => {
    event.preventDefault(); 
    getPopularMovies(currentPageMovies);
});

document.getElementById('load-more-malayalam-link').addEventListener('click', (event) => {
    event.preventDefault(); 
    getMalayalamMovies(currentPageMalayalam);
});

document.getElementById('load-more-tv-shows-link').addEventListener('click', (event) => {
    event.preventDefault(); 
    getPopularTVSeries(currentPageTVShows);
});

// Initialize the page content after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    getPopularMovies(1, true);
    getMalayalamMovies(1, true);
    getPopularTVSeries(1, true);
});