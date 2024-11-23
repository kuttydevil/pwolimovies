const apiLocation = 'https://api.themoviedb.org/3';
const apiKey = 'e51447e837048930952e694908564da1'; // Replace with your actual TMDb API key
const torrentSearchAPIs = {
  piratebay: 'https://itorrentsearch.vercel.app/api/piratebay/',
  torlock: 'https://itorrentsearch.vercel.app/api/torlock/',
  yts: 'https://itorrentsearch.vercel.app/api/yts/',
};

// Reusable fetch function
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error; 
  }
}

// Function to create a card for torrent data
function createTorrentCard(torrent) {
  const torrentCard = document.createElement('div');
  torrentCard.classList.add('torrent-card');

  torrentCard.innerHTML = `
    <div class="torrent-info">
      <h3>${torrent.Name || "N/A"}</h3>
      <p>Quality: ${torrent.Quality || "N/A"}</p>
      <p>Size: ${torrent.Size || "N/A"}</p>
      <p>Seeders: ${torrent.Seeders || "N/A"}</p>
    </div>
    <div class="torrent-actions">
      <button class="copy-magnet" data-magnet="${torrent.Magnet}">Copy Magnet</button>
      <a href="/player?m=${btoa(torrent.Magnet)}" target="_blank" rel="noopener noreferrer" class="play-torrent">Play</a>
    </div>
  `;

  torrentCard.querySelector('.copy-magnet').addEventListener('click', async () => {
    const magnetLink = torrentCard.querySelector('.copy-magnet').dataset.magnet;
    try {
      await navigator.clipboard.writeText(magnetLink);
      alert("Magnet link copied!");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy Magnet link. Check browser permissions.");
    }
  });

  return torrentCard;
}

// Function to create the torrent card container 
function createTorrentCardContainer(torrentData) {
  const torrentContainer = document.createElement('div');
  torrentContainer.classList.add('torrent-card-container');

  torrentData.forEach(torrent => {
    const torrentCard = createTorrentCard(torrent);
    torrentContainer.appendChild(torrentCard);
  });

  return torrentContainer;
}

// Function to create a card for movie details 
function createMovieDetailsCard(movie) {
    const movieDetailsCard = document.createElement('div');
    movieDetailsCard.classList.add('movie-details-card');
  
    movieDetailsCard.innerHTML = `
      <div class="poster-container">
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path || '/path/to/default-poster.jpg'}" alt="${movie.title || movie.name}">
      </div>
      <div class="movie-info">
        <h2>${movie.title || movie.name}</h2>
        <p>Release Date: ${movie.release_date || movie.first_air_date}</p>
        <p>Overview: ${movie.overview}</p>
        <p>Rating: ${movie.vote_average}/10</p>
        <p>Genres: ${movie.genres?.map(genre => genre.name).join(', ') || 'N/A'}</p> </div>
    `;
  
    return movieDetailsCard;
  }

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

// Function to update page title and metadata
function updatePageMetadata(movie) {
    const title = movie.title || movie.name;
    document.title = `Watch ${title} Online Free - PwoliMovies`;
    document.querySelector('meta[name="description"]').content = `Watch ${title} online for free at PwoliMovies. Stream high-quality movies and TV shows without limits.`;

    // Update Open Graph tags
    document.querySelector('meta[property="og:title"]').content = `Watch ${title} Online Free - PwoliMovies`;
    document.querySelector('meta[property="og:description"]').content = `Watch ${title} online for free at PwoliMovies. Stream high-quality movies and TV shows without limits.`;
    document.querySelector('meta[property="og:image"]').content = `https://image.tmdb.org/t/p/w500${movie.poster_path || '/path/to/default-poster.jpg'}`; 

    // Update Twitter Card data
    document.querySelector('meta[name="twitter:title"]').content = `Watch ${title} Online Free - PwoliMovies`;
    document.querySelector('meta[name="twitter:description"]').content = `Watch ${title} online for free at PwoliMovies. Stream high-quality movies and TV shows without limits.`;
    document.querySelector('meta[name="twitter:image"]').content = `https://image.tmdb.org/t/p/w500${movie.poster_path || '/path/to/default-poster.jpg'}`; 

    // Add Schema.org structured data for Movie 
    const movieSchema = {
        "@context": "http://schema.org",
        "@type": "Movie",
        "name": title,
        "description": movie.overview,
        "image": `https://image.tmdb.org/t/p/w500${movie.poster_path || '/path/to/default-poster.jpg'}`,
        "dateCreated": movie.release_date || movie.first_air_date,
        "genre": movie.genres?.map(genre => genre.name) || [],
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(movieSchema);
    document.head.appendChild(script);

}

// Function to load movie details on the details page
async function loadMovieDetails() {
  const movieDetailsContainer = document.getElementById('movie-details-container');
  showLoading(movieDetailsContainer);

  const params = new URLSearchParams(window.location.search);
  const movieId = params.get('id');
  const encodedMovieTitle = params.get('title');

  try {
    const movie = await fetchData(`${apiLocation}/movie/${movieId}?api_key=${apiKey}`);
    const detailsContainer = document.createElement('div');
    detailsContainer.classList.add('movie-details-container');

    const movieDetailsCard = createMovieDetailsCard(movie);
    detailsContainer.appendChild(movieDetailsCard);

    // Fetch torrents from multiple sources
    const torrentPromises = Object.entries(torrentSearchAPIs).map(
      async ([sourceName, apiUrl]) => {
        try {
          const torrentData = await fetchData(`${apiUrl}${decodeURIComponent(encodedMovieTitle)}/1`); // Decode the title
          if (torrentData && Array.isArray(torrentData)) {
            return { source: sourceName, data: torrentData };
          } else {
            console.warn(`No torrents found on ${sourceName}`);
            return null;
          }
        } catch (error) {
          console.error(`Error fetching from ${sourceName}:`, error);
          return null;
        }
      }
    );

    const torrentResults = await Promise.all(torrentPromises);
    const allTorrents = torrentResults.flatMap(result => result?.data || []);

    // Sort all torrents by seeders
    allTorrents.sort((a, b) => b.Seeders - a.Seeders);

    const torrentCardContainer = createTorrentCardContainer(allTorrents);
    detailsContainer.appendChild(torrentCardContainer);

    movieDetailsContainer.innerHTML = '';
    movieDetailsContainer.appendChild(detailsContainer);
    updatePageMetadata(movie); // Update metadata after fetching movie data

  } catch (error) {
    console.error("Error:", error);
    movieDetailsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
  } finally {
    hideLoading(movieDetailsContainer);
  }
}

function updateCanonicalAndOgUrl() {
  const currentUrl = window.location.href;
  document.querySelector('link[rel="canonical"]').href = currentUrl;
  document.querySelector('meta[property="og:url"]').content = currentUrl;
}

// Load movie details when the page loads
window.addEventListener('DOMContentLoaded', loadMovieDetails);