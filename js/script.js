const apiLocation = 'https://api.themoviedb.org/3';
const apiKey = 'e51447e837048930952e694908564da1'; // Replace with your actual TMDb API key
const torrentSearchAPI = 'https://itorrentsearch.vercel.app/api/';

// Function to show/hide loading spinners
function showLoading(element) {
  element.querySelector('.loading-spinner').style.display = 'block';
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
  return await response.json();
}

// Fetch popular movies
let currentPageMovies = 1;
async function getPopularMovies(page = currentPageMovies) {
  const movieList = document.getElementById('movie-details');
  showLoading(movieList); // Show loading spinner

  try {
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
      currentPageMovies = page + 1; // Update the current page number
      moveLoadMoreButtonToEnd('movie-details', 'load-more-movies-container'); // Move button to the end
      const loadMoreButton = document.getElementById('load-more-movies-container');
      if (data.results.length < 20) { // Disable the button if there are fewer than 20 results on the current page
        loadMoreButton.querySelector('p').textContent = "No More Movies";
        loadMoreButton.style.cursor = 'default'; // Change cursor to default
      }
    } else {
      // ... (Handle "No More Movies" message if needed) ...
    }
  } catch (error) {
    console.error("Error fetching popular movies:", error);
    movieList.innerHTML += `<p>Error fetching movies: ${error.message}</p>`;
  } finally {
    hideLoading(movieList); // Hide loading spinner
  }
}

// Fetch latest Malayalam Movies
let currentPageMalayalam = 1;
async function getMalayalamMovies(page = currentPageMalayalam) {
  const malayalamMovieList = document.getElementById('malayalam-movies');
  showLoading(malayalamMovieList); // Show loading spinner

  try {
    // Use the 'discover/movie' endpoint with 'release_date.gte' parameter 
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
      currentPageMalayalam = page + 1; // Update the current page number
      moveLoadMoreButtonToEnd('malayalam-movies', 'load-more-malayalam-container');
      const loadMoreButton = document.getElementById('load-more-malayalam-container');
      if (data.results.length < 20) { // Disable the button if there are fewer than 20 results on the current page
        loadMoreButton.querySelector('p').textContent = "No More Movies";
        loadMoreButton.style.cursor = 'default'; // Change cursor to default
      }
    } else {
      // ... (Handle "No More Malayalam Movies" message if needed) ...
    }
  } catch (error) {
    console.error("Error fetching Malayalam movies:", error);
    malayalamMovieList.innerHTML += `<p>Error fetching Malayalam movies: ${error.message}</p>`;
  } finally {
    hideLoading(malayalamMovieList); // Hide loading spinner
  }
}

// Fetch popular TV series
let currentPageTVShows = 1;
async function getPopularTVSeries(page = currentPageTVShows) {
  const tvSeriesList = document.getElementById('tv-series-details');
  showLoading(tvSeriesList); // Show loading spinner

  try {
    const response = await fetch(`${apiLocation}/tv/popular?api_key=${apiKey}&page=${page}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data && data.results) {
      data.results.forEach(tvSeries => {
        const tvSeriesCard = createMovieCard(tvSeries);
        tvSeriesList.appendChild(tvSeriesCard);
      });
      currentPageTVShows = page + 1; // Update the current page number
      moveLoadMoreButtonToEnd('tv-series-details', 'load-more-tv-shows-container');
      const loadMoreButton = document.getElementById('load-more-tv-shows-container');
      if (data.results.length < 20) { // Disable the button if there are fewer than 20 results on the current page
        loadMoreButton.querySelector('p').textContent = "No More TV Shows";
        loadMoreButton.style.cursor = 'default'; // Change cursor to default
      }
    } else {
      // ... (Handle "No More TV Shows" message if needed) ...
    }
  } catch (error) {
    console.error("Error fetching popular TV series:", error);
    tvSeriesList.innerHTML += `<p>Error fetching TV series: ${error.message}</p>`;
  } finally {
    hideLoading(tvSeriesList); // Hide loading spinner
  }
}

// Create a movie card
function createMovieCard(movie) {
  const movieCard = document.createElement('div');
  movieCard.classList.add('movie-card');
  movieCard.dataset.movieId = movie.id;

  // Use the correct field for the title:
  const titleField = movie.name || movie.title; 

  movieCard.dataset.movieTitle = titleField; 
  movieCard.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${titleField}">
    <h3>${titleField}</h3>
  `;
  movieCard.addEventListener('click', () => {
    showMovieDetails(movie.id, encodeURIComponent(titleField)); 
  });
  return movieCard;
}

// Search for movies or TV shows
async function searchMovies() {
  const query = document.getElementById('search-input').value.trim();
  const searchType = document.querySelector('input[name="search_type"]:checked').value;

  if (!query) {
    alert("Please enter a search query.");
    return;
  }

  const searchUrl = `${apiLocation}/search/${searchType}?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

  try {
    const movieList = document.getElementById('movie-details');
    showLoading(movieList); // Show loading spinner

    const tvSeriesList = document.getElementById('tv-series-details');
    showLoading(tvSeriesList); // Show loading spinner

    const malayalamMovieList = document.getElementById('malayalam-movies');
    showLoading(malayalamMovieList); // Show loading spinner

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
          movieList.appendChild(movieCard);
        });
      } else if (searchType === 'tv') {
        data.results.forEach(tvSeries => {
          const tvSeriesCard = createMovieCard(tvSeries);
          tvSeriesList.appendChild(tvSeriesCard);
        });
      } 
    } else {
      if (searchType === 'movie') {
        movieList.innerHTML = '<p>No results found.</p>';
      } else if (searchType === 'tv') {
        tvSeriesList.innerHTML = '<p>No TV series results found.</p>';
      }
    }
  } catch (error) {
    console.error("Error searching movies:", error);
    const movieList = document.getElementById('movie-details');
    const tvSeriesList = document.getElementById('tv-series-details');
    const malayalamMovieList = document.getElementById('malayalam-movies'); 

    if (searchType === 'movie') {
      movieList.innerHTML = `<p>Error searching movies: ${error.message}</p>`;
    } else if (searchType === 'tv') {
      tvSeriesList.innerHTML = `<p>Error searching TV series: ${error.message}</p>`;
    }
  } finally {
    hideLoading(movieList); // Hide loading spinner
    hideLoading(tvSeriesList); // Hide loading spinner
    hideLoading(malayalamMovieList); // Hide loading spinner
  }
}

// Function to create and display movie details (Modified for separate page)
async function showMovieDetails(movieId, encodedMovieTitle) {
  // Redirect to the details page with movie ID and title
  window.location.href = `movie-details.html?id=${movieId}&title=${encodedMovieTitle}`; 
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
    searchMovies();  // Trigger the search
  }
}

// Function to move the Load More button to the end of the container
function moveLoadMoreButtonToEnd(containerId, buttonId) {
  const container = document.getElementById(containerId);
  const loadMoreButtonContainer = document.getElementById(buttonId);
  container.appendChild(loadMoreButtonContainer);
}

// Call the function to handle URL query when the page loads
window.addEventListener('DOMContentLoaded', handleURLQuery);

// Load More Buttons
document.getElementById('load-more-movies-container').addEventListener('click', () => {
  getPopularMovies(currentPageMovies);
});

document.getElementById('load-more-malayalam-container').addEventListener('click', () => {
  getMalayalamMovies(currentPageMalayalam);
});

document.getElementById('load-more-tv-shows-container').addEventListener('click', () => {
  getPopularTVSeries(currentPageTVShows);
});

// Initialize the page content after DOM is loaded
window.addEventListener('DOMContentLoaded', function () {
  getPopularMovies(); 
  getPopularTVSeries(); 
  getMalayalamMovies(); 
});