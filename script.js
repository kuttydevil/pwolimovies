const apiLocation = 'https://api.themoviedb.org/3';
const apiKey = 'e51447e837048930952e694908564da1'; // Replace with your TMDb API key
const torrentSearchAPI = 'https://itorrentsearch.vercel.app/api/';

let currentPage = 1;
let totalPages = 1;
let searchQuery = '';

function closePopup() {
    document.getElementById('movie-details-popup').style.display = 'none';
}

async function getMovieDetails(movieId) {
    const movieDetailsUrl = `${apiLocation}/movie/${movieId}?api_key=${apiKey}`;
    const response = await fetch(movieDetailsUrl);
    return await response.json();
}

async function getMovies() {
    const movieList = document.getElementById('movie-list');
    const response = await fetch(`${apiLocation}/movie/popular?api_key=${apiKey}`);
    const data = await response.json();

    if (data && data.results) {
        data.results.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');
            movieCard.dataset.movieId = movie.id;
            movieCard.dataset.movieTitle = movie.title;

            movieCard.innerHTML = `
                <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
                <h3>${movie.title}</h3>
            `;

            movieCard.addEventListener('click', () => {
                let movieTitle = movieCard.dataset.movieTitle;
                const encodedTitle = encodeURIComponent(movieTitle);
                showMovieDetails(movieCard.dataset.movieId, encodedTitle);
            });

            movieList.appendChild(movieCard);
        });
    }
}

async function searchMovies() {
    const query = document.getElementById('search-input').value.trim();
    const searchType = document.querySelector('input[name="search_type"]:checked').value;
    const searchUrl = `${apiLocation}/search/${searchType}?api_key=${apiKey}&query=${encodeURIComponent(query)}`;

    if (!query) {
        alert("Please enter a search query.");
        return;
    }

    try {
        const response = await fetch(searchUrl);
        const data = await response.json();

        const movieList = document.getElementById('movie-list');
        movieList.innerHTML = ''; // Clear previous results

        if (data.results && data.results.length > 0) {
            data.results.forEach(movie => {
                const movieCard = document.createElement('div');
                movieCard.classList.add('movie-card');
                movieCard.dataset.movieId = movie.id;
                movieCard.dataset.movieTitle = movie.title;

                movieCard.innerHTML = `
                    <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${movie.title}">
                    <h3>${movie.title}</h3>
                `;

                movieCard.addEventListener('click', () => {
                    let movieTitle = movieCard.dataset.movieTitle;
                    const encodedTitle = encodeURIComponent(movieTitle);
                    showMovieDetails(movieCard.dataset.movieId, encodedTitle);
                });

                movieList.appendChild(movieCard);
            });
        } else {
            movieList.innerHTML = '<p>No results found.</p>';
        }
    } catch (error) {
        console.error("Error fetching search results:", error);
    }
}

async function showMovieDetails(movieId, encodedMovieTitle) {
    const popup = document.getElementById('movie-details-popup');
    const poster = document.getElementById('popup-poster');
    const title = document.getElementById('popup-title');
    const torrentsDiv = document.getElementById('popup-torrents');

    try {
        const movie = await getMovieDetails(movieId);
        poster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        title.textContent = movie.title;

        const torrentSearchURL = `${torrentSearchAPI}piratebay/${encodedMovieTitle}/1`;
        const response = await fetch(torrentSearchURL);

        if (response.ok) {
            const torrentData = await response.json();

            // Sort torrents by seeders in descending order
            torrentData.sort((a, b) => b.Seeders - a.Seeders);

            torrentsDiv.innerHTML = '';
            if (torrentData && torrentData.length > 0) {
                const torrentsTable = document.createElement('table');
                const headerRow = torrentsTable.insertRow();
                headerRow.insertCell().textContent = "Title";
                headerRow.insertCell().textContent = "Quality";
                headerRow.insertCell().textContent = "Size";
                headerRow.insertCell().textContent = "Seeders";
                headerRow.insertCell().textContent = "Magnet";
                headerRow.insertCell().textContent = "Play";

                torrentData.forEach(torrent => {
                    const row = torrentsTable.insertRow();
                    row.insertCell().textContent = torrent['Name'] || "N/A";
                    row.insertCell().textContent = torrent['Quality'] || "N/A";
                    row.insertCell().textContent = torrent['Size'] || "N/A";
                    row.insertCell().textContent = torrent['Seeders'] || "N/A";

                    const magnetCell = row.insertCell();
                    const magnetButton = document.createElement('button');
                    magnetButton.textContent = "Copy Magnet";
                    magnetButton.addEventListener('click', () => {
                        navigator.clipboard.writeText(torrent['Magnet']).then(() => {
                            alert("Magnet link copied!");
                        }).catch(err => {
                            console.error("Failed to copy: ", err);
                            alert("Failed to copy Magnet link.");
                        });
                    });
                    magnetCell.appendChild(magnetButton);

                    const playCell = row.insertCell();
                    const playButton = document.createElement('button');
                    playButton.textContent = "Play";
                    playButton.addEventListener('click', () => {
                        const magnetLink = torrent['Magnet'];
                        const redirectUrl = `https://pwolimovies.vercel.app/player?m=${btoa(magnetLink)}`;
                        window.location.href = redirectUrl;
                    });
                    playCell.appendChild(playButton);
                });
                torrentsDiv.appendChild(torrentsTable);
            } else {
                torrentsDiv.textContent = 'No torrents found.';
            }
        } else {
            torrentsDiv.textContent = `Error fetching torrents: ${response.status} ${response.statusText}`;
        }
        popup.style.display = 'block';
    } catch (error) {
        console.error("Error:", error);
        torrentsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
        popup.style.display = 'block';
    }
}

// Add event listener for Enter key in search input
document.getElementById('search-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchMovies();
    }
});

getMovies();
