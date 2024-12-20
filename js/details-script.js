const apiLocation = 'https://api.themoviedb.org/3';
const apiKey = '9b92d50baa23664db9f1455d0bbc74fc'; // **REPLACE WITH YOUR ACTUAL TMDB API KEY**
const torrentSearchAPIs = {
  piratebay: 'https://pwolisearch.vercel.app/api/piratebay/',
  torlock: 'https://pwolisearch.vercel.app/api/torlock/',
  yts: 'https://pwolisearch.vercel.app/api/yts/',
};

// Reusable fetch function with error handling
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const message = `Network response was not ok ${response.status} ${response.statusText}`;
      throw new Error(message);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
}

// Function to create a card for torrent data
function createTorrentCard(torrent) {
  const torrentCard = document.createElement('div');
  torrentCard.classList.add('torrent-card');

  torrentCard.innerHTML = `
    <article class="torrent-info">
      <h3 itemprop="name">${torrent.Name || "N/A"}</h3>
      <p itemprop="description">Quality: ${torrent.Quality || "N/A"}</p>
      <p>Size: ${torrent.Size || "N/A"}</p>
      <p>Seeders: <span itemprop="seeders">${torrent.Seeders || "N/A"}</span></p>
    </article>
    <div class="torrent-actions">
      <button class="copy-magnet" data-magnet="${torrent.Magnet}">Copy Magnet</button>
      <a href="lite/#/player?m=${btoa(torrent.Magnet)}" target="_blank" rel="noopener noreferrer" class="play-torrent" itemprop="url">Play</a>
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
  const torrentContainer = document.createElement('section');
  torrentContainer.classList.add('torrent-card-container');
  torrentContainer.setAttribute("aria-label", "Torrent Download Options");

  if (torrentData && torrentData.length > 0) {
    torrentData.forEach(torrent => {
      const torrentCard = createTorrentCard(torrent);
      torrentContainer.appendChild(torrentCard);
    });
  } else {
    torrentContainer.innerHTML = "<p>No torrent results found.</p>";
  }

  return torrentContainer;
}

// Function to create a card for movie/TV details
function createMediaDetailsCard(media) {
  const mediaDetailsCard = document.createElement('article');
  mediaDetailsCard.classList.add('media-details-card');
  mediaDetailsCard.setAttribute("itemscope", "");
  mediaDetailsCard.setAttribute("itemtype", media.title ? "http://schema.org/Movie" : "http://schema.org/TVSeries");

  const title = media.title || media.name || "N/A";
  const type = media.title ? "Movie" : "TV Series";
  const releaseDate = media.release_date || media.first_air_date || "N/A";
  const posterPath = media.poster_path
    ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
    : '/img/404.jpg';

  mediaDetailsCard.innerHTML = `
    <div class="poster-container">
      <img src="${posterPath}" alt="${title} Poster" itemprop="image" onerror="this.src='/img/404.jpg';">
    </div>
    <div class="media-info">
      <h2 itemprop="name">${title}</h2>
      <p>Type: <span itemprop="typeOfMedia">${type}</span></p>
      <p>Release Date: <time itemprop="datePublished" datetime="${releaseDate}">${releaseDate}</time></p>
      <p itemprop="description">Overview: ${media.overview || "N/A"}</p>
      <p>Rating: <span itemprop="aggregateRating" itemscope itemtype="http://schema.org/AggregateRating">
          <span itemprop="ratingValue">${media.vote_average || "N/A"}</span>/<span itemprop="bestRating">10</span>
      </span></p>
      <p>Genres: <span itemprop="genre">${media.genres?.map(genre => genre.name).join(', ') || "N/A"}</span></p>
    </div>
  `;

  return mediaDetailsCard;
}

// Function to show/hide loading spinners
function showLoading(element) {
  element.querySelector('.loading-spinner').style.display = 'flex';
}

function hideLoading(element) {
  const loadingSpinner = element.querySelector('.loading-spinner');
  if (loadingSpinner) {
    loadingSpinner.style.display = 'none';
  }
}

// Function to update page metadata
function updatePageMetadata(media) {
  const title = media.title || media.name || "N/A";
  const type = media.title ? "Movie" : "TV Series";
  const decodedTitle = decodeURIComponent(title);

  document.title = `Watch ${decodedTitle} Online Free - PwoliMovies`;
  document.querySelector('meta[name="description"]').content = `Watch ${decodedTitle} (${type}) online for free at PwoliMovies. Download or stream via torrent.`;

  document.querySelector('meta[property="og:title"]').content = `Watch ${decodedTitle} Online Free - PwoliMovies`;
  document.querySelector('meta[property="og:description"]').content = `Watch ${decodedTitle} (${type}) online for free at PwoliMovies. Download or stream via torrent.`;
  document.querySelector('meta[property="og:image"]').content = media.poster_path
    ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
    : '/img/404.jpg';
}

// Main function to load movie/TV details
async function loadMovieDetails() {
  const movieDetailsContainer = document.getElementById('movie-details-container');
  showLoading(movieDetailsContainer);

  const params = new URLSearchParams(window.location.search);
  const combinedParam = params.keys().next().value + '=' + params.get(params.keys().next().value);

  console.log("Combined Param:", combinedParam); // Debugging

  const regex = /^(.*)-(movie|tv)-id=(\d+)$/;
  const match = combinedParam.match(regex);

  if (!match) {
    console.error("Error: Invalid URL parameter format.");
    movieDetailsContainer.innerHTML = `<p>Error: Invalid URL parameter format.</p>`;
    hideLoading(movieDetailsContainer);
    return;
  }

  const slug = match[1];
  const mediaType = match[2];
  const mediaId = match[3];
  const decodedTitle = slug.replace(/-/g, " ");

  try {
    const apiUrl = mediaType === 'movie'
      ? `${apiLocation}/movie/${mediaId}?api_key=${apiKey}`
      : `${apiLocation}/tv/${mediaId}?api_key=${apiKey}`;

    const mediaData = await fetchData(apiUrl);
    if (!mediaData) throw new Error("Failed to fetch media data");

    const detailsContainer = document.createElement('div');
    detailsContainer.classList.add('movie-details-container');

    const mediaDetailsCard = createMediaDetailsCard(mediaData);
    detailsContainer.appendChild(mediaDetailsCard);

    const encodedTitle = encodeURIComponent(decodedTitle);
    const torrentPromises = Object.entries(torrentSearchAPIs).map(async ([sourceName, apiUrl]) => {
      try {
        const torrentData = await fetchData(`${apiUrl}${encodedTitle}/1`);
        if (torrentData && Array.isArray(torrentData)) {
          return { source: sourceName, data: torrentData };
        } else {
          console.warn(`No torrents found on ${sourceName} for ${encodedTitle}`);
          return null;
        }
      } catch (error) {
        console.error(`Error fetching from ${sourceName}:`, error);
        return null;
      }
    });

    const torrentResults = await Promise.all(torrentPromises);
    const allTorrents = torrentResults.flatMap(result => result?.data || []);
    allTorrents.sort((a, b) => b.Seeders - a.Seeders);

    const torrentCardContainer = createTorrentCardContainer(allTorrents);
    detailsContainer.appendChild(torrentCardContainer);

    movieDetailsContainer.innerHTML = '';
    movieDetailsContainer.appendChild(detailsContainer);
    updatePageMetadata(mediaData);
  } catch (error) {
    console.error("Error loading details:", error);
    movieDetailsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
  } finally {
    hideLoading(movieDetailsContainer);
  }
}

// Ensure async handling for DOMContentLoaded
window.addEventListener('DOMContentLoaded', async () => {
  await loadMovieDetails();
});
