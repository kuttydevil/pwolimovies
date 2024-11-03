const apiUrl = "https://yts.mx/api/v2/list_movies.json";
const container = document.getElementById('movie-container');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const currentPageDisplay = document.getElementById('current-page');
const totalPagesDisplay = document.getElementById('total-pages');
const searchInput = document.getElementById('search-input');

// Popup elements
const popup = document.getElementById('movie-popup');
const closePopupBtn = document.getElementById('close-popup');
const popupContent = document.getElementById('popup-content');

const trackers = [
    "udp://open.demonii.com:1337/announce",
    "udp://tracker.openbittorrent.com:80",
    "udp://tracker.coppersurfer.tk:6969",
    "udp://glotorrents.pw:6969/announce",
    "udp://tracker.opentrackr.org:1337/announce",
    "udp://torrent.gresille.org:80/announce",
    "udp://p4p.arenabg.com:1337",
    "udp://tracker.leechers-paradise.org:6969"
];

let currentPage = 1;
let totalPages = 1;
let searchQuery = '';


function generateMagnetLink(movie, torrent) {
    let encodedTitle = encodeURIComponent(movie.title_long);
    let magnetUrl = `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodedTitle}`;
    trackers.forEach(tracker => magnetUrl += `&tr=${tracker}`);
    return magnetUrl;
}

function generateRedirectUrl(magnetLink) {
    return "https://pwolimovies.vercel.app/player?m=" + btoa(magnetLink);
}

function fetchMovies(page = 1, query = '') {
    const url = `${apiUrl}?page=${page}&limit=20${query ? `&query_term=${query}` : ''}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'ok') {
                totalPages = Math.ceil(data.data.movie_count / 20);
                totalPagesDisplay.textContent = totalPages;
                currentPageDisplay.textContent = currentPage;

                container.innerHTML = '';

                data.data.movies.forEach(movie => {
                    const card = document.createElement('div');
                    card.classList.add('movie-card');

                    const img = document.createElement('img');
                    img.src = movie.medium_cover_image;
                    img.alt = movie.title;
                    card.appendChild(img);

                    const playButton = document.createElement('div');
                    playButton.classList.add('play-button');
                    playButton.innerHTML = '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M8,5.14V19.14L19,12.14L8,5.14Z" /></svg>';
                    playButton.addEventListener('click', () => showMovieDetails(movie));
                    card.appendChild(playButton);
                    container.appendChild(card);
                });

                updatePaginationButtons();
            } else {
                console.error("API Error:", data.status_message);
            }
        })
        .catch(error => console.error("Fetch Error:", error));
}

function showMovieDetails(movie) {
    popupContent.innerHTML = '';

    const title = document.createElement('h2');
    title.textContent = movie.title_long;
    popupContent.appendChild(title);

    const img = document.createElement('img');
    img.src = movie.large_cover_image;
    img.alt = movie.title;
    img.style.maxWidth = '300px';
    img.style.height = 'auto';
    popupContent.appendChild(img);

    const detailsList = document.createElement('ul');

    addDetailItem(detailsList, 'Rating', movie.rating);
    addDetailItem(detailsList, 'Year', movie.year);
    addDetailItem(detailsList, 'Runtime', `${movie.runtime} minutes`);
    addDetailItem(detailsList, 'Genres', movie.genres.join(', '));
    addDetailItem(detailsList, 'Language', movie.language);
    addDetailItem(detailsList, 'Synopsis', movie.synopsis || movie.description_full || 'No synopsis available.');

    popupContent.appendChild(detailsList);


    const torrentButtonsContainer = document.createElement('div');
    torrentButtonsContainer.classList.add('torrent-buttons');
    movie.torrents.forEach(torrent => {
        const torrentButton = document.createElement('button');
        torrentButton.classList.add('torrent-button');
        torrentButton.textContent = `${torrent.quality} (${torrent.size})`;
        torrentButton.addEventListener('click', () => {
            const magnetLink = generateMagnetLink(movie, torrent);
            const redirectUrl = generateRedirectUrl(magnetLink);
            window.location.href = redirectUrl;
        });
        torrentButtonsContainer.appendChild(torrentButton);
    });
    popupContent.appendChild(torrentButtonsContainer);

    popup.style.display = 'block';
}



function addDetailItem(list, label, value) {
    if (value) {
        const item = document.createElement('li');
        item.textContent = `${label}: ${value}`;
        list.appendChild(item);
    }
}



function updatePaginationButtons() {
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

prevPageBtn.addEventListener('click', () => {
    currentPage--;
    fetchMovies(currentPage, searchQuery);
});

nextPageBtn.addEventListener('click', () => {
    currentPage++;
    fetchMovies(currentPage, searchQuery);
});

searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    currentPage = 1;
    fetchMovies(currentPage, searchQuery);
});

closePopupBtn.addEventListener('click', () => {
    popup.style.display = 'none';
});

fetchMovies();
