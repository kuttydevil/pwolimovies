// details-script.js
const apiLocation = 'https://api.themoviedb.org/3';
const apiKey = 'e51447e837048930952e694908564da1'; // **REPLACE WITH YOUR ACTUAL TMDB API KEY**
const torrentSearchAPIs = {
    piratebay: 'https://itorrentsearch.vercel.app/api/piratebay/',
    torlock: 'https://itorrentsearch.vercel.app/api/torlock/',
    yts: 'https://itorrentsearch.vercel.app/api/yts/',
    // ... add more torrent search APIs as needed
};
const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
const defaultPosterPath = '/images/default-poster.jpg'; // Replace with your default poster's relative path


async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch Error:", error);
        return null;
    }
}


function createMediaDetailsCard(media) {
    const mediaDetailsCard = document.createElement('div');
    mediaDetailsCard.classList.add('media-details-card');

    const title = media.title || media.name || "N/A";
    const type = media.title ? "Movie" : "TV Series";
    const releaseDate = media.release_date || media.first_air_date || "N/A";
    const posterPath = media.poster_path ? imageBaseUrl + media.poster_path : defaultPosterPath;
    const backdropPath = media.backdrop_path ? imageBaseUrl + media.backdrop_path : defaultPosterPath;

    mediaDetailsCard.style.backgroundImage = `url(${backdropPath})`;

    mediaDetailsCard.innerHTML = `
      <div class="poster-container">
        <img src="${posterPath}" alt="${title}" onerror="this.src='${defaultPosterPath}';">
      </div>
      <div class="media-info">
        <h2>${title}</h2>
        <p>Type: ${type}</p>
        <p>Release Date: ${releaseDate}</p>
        <p>Overview: ${media.overview || "N/A"}</p>
        <p>Rating: ${media.vote_average || "N/A"}/10</p>
        <p>Genres: ${media.genres?.map(genre => genre.name).join(', ') || "N/A"}</p>
        <div id="trailer-container"></div> 
      </div>
    `;

    if (media.videos && media.videos.results) {
        const trailer = media.videos.results.find(video => video.type === "Trailer" && video.site === "YouTube");
        if (trailer) {
            const trailerContainer = mediaDetailsCard.querySelector('#trailer-container');
            const iframe = document.createElement('iframe');
            iframe.width = "560"; iframe.height = "315"; iframe.src = `https://www.youtube.com/embed/${trailer.key}`;
            iframe.title = `${title} - Trailer`; iframe.frameborder = "0";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            iframe.allowfullscreen = true; trailerContainer.appendChild(iframe);
        }
    }

    return mediaDetailsCard;
}

// ... (rest of the functions: createTorrentCard, createTorrentCardContainer, showLoading, hideLoading)


function updatePageMetadata(media) {

    const title = media.title || media.name || "N/A";
    const description = media.overview || "Watch " + title + " online for free at PwoliMovies.";
    const imageUrl = media.poster_path ? imageBaseUrl + media.poster_path : defaultPosterPath;
    const url = `https://pwolimovies.vercel.app/movie/${media.id}`; // Or construct appropriate URL
    const type = media.title ? "video.movie" : "video.tv_show"; // Corrected property name

    document.title = `Watch ${title} Online Free - PwoliMovies`;

    document.querySelector('meta[name="description"]').content = description;
    document.querySelector('meta[property="og:url"]').content = url;
    document.querySelector('meta[property="og:image"]').content = imageUrl;
    document.querySelector('meta[property="og:title"]').content = `Watch ${title} Online Free - PwoliMovies`;
    document.querySelector('meta[property="og:description"]').content = description;
    document.querySelector('meta[property="og:type"]').content = type; // Set correct Open Graph type

    document.querySelector('meta[name="twitter:title"]').content = `Watch ${title} Online Free - PwoliMovies`;
    document.querySelector('meta[name="twitter:description"]').content = description;
    document.querySelector('meta[name="twitter:image"]').content = imageUrl;
    document.querySelector('link[rel="canonical"]').href = url;


    // Schema.org (updated dynamically)
    let existingSchema = document.querySelector('script[type="application/ld+json"]');
    if (!existingSchema) {
        existingSchema = document.createElement('script');
        existingSchema.type = 'application/ld+json';
        document.head.appendChild(existingSchema);
    }


    const schemaType = media.title ? "Movie" : "TVSeries"; // Or use more specific VideoObject if applicable

    const schema = {
        "@context": "https://schema.org",
        "@type": schemaType,
        "name": title,
        "description": description,
        "image": imageUrl,
        "dateCreated": media.release_date || media.first_air_date || "N/A",
        "director": media.credits && media.credits.crew && media.credits.crew.find(member => member.job === "Director"), // Include if available
        "actor": media.credits && media.credits.cast && media.credits.cast.map(actor => ({ "@type": "Person", "name": actor.name })),
        "genre": media.genres && media.genres.map(genre => genre.name) || [],
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": media.vote_average,
            "bestRating": "10",
            "ratingCount": media.vote_count || "N/A"
        },

        "potentialAction": {
            "@type": "WatchAction",
            "target": []
        }
    };



    existingSchema.textContent = JSON.stringify(schema); // Update existing schema

}


async function loadMovieDetails() {
    const movieDetailsContainer = document.getElementById('movie-details-container');
    const movieDetailsSection = document.getElementById('movie-details');
    const torrentOptionsSection = document.getElementById('torrent-options');
    const relatedMoviesSection = document.getElementById('related-movies');
    const relatedMoviesGrid = document.getElementById('related-movies-grid');

    showLoading(movieDetailsContainer);


    try {
        const params = new URLSearchParams(window.location.search);
        const mediaId = params.get('id');
        const mediaType = params.get('type') || 'movie'; // Default to 'movie' if not provided
        const encodedTitle = encodeURIComponent(params.get('title'));

        let mediaData;
        let relatedMediaUrl;

        if (mediaType === 'movie') {
            const apiUrl = `${apiLocation}/movie/${mediaId}?api_key=${apiKey}&append_to_response=videos,credits,keywords,recommendations,similar`;
            mediaData = await fetchData(apiUrl);
            relatedMediaUrl = `${apiLocation}/movie/${mediaId}/similar?api_key=${apiKey}`;

        } else { // Assuming 'tv' if not 'movie'
            const apiUrl = `${apiLocation}/tv/${mediaId}?api_key=${apiKey}&append_to_response=videos,credits,keywords,recommendations,similar`;
            mediaData = await fetchData(apiUrl);
            relatedMediaUrl = `${apiLocation}/tv/${mediaId}/similar?api_key=${apiKey}`;
        }



        if (!mediaData) {
            throw new Error("Could not fetch movie/TV show details.");
        }


        movieDetailsSection.appendChild(createMediaDetailsCard(mediaData));


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

        allTorrents.sort((a, b) => (b.Seeders || 0) - (a.Seeders || 0)); // Sort by seeders, handle missing Seeders


        torrentOptionsSection.appendChild(createTorrentCardContainer(allTorrents));

        updatePageMetadata(mediaData);


        const relatedMediaData = await fetchData(relatedMediaUrl);
        if (relatedMediaData && relatedMediaData.results.length > 0) {
          relatedMediaData.results.forEach(relatedMedia => {
              const relatedMediaCard = createMovieCard(relatedMedia);
              relatedMoviesGrid.appendChild(relatedMediaCard);
          });
          relatedMoviesSection.style.display = 'block'; 
      }


    } catch (error) {
        console.error("Error loading details:", error);
        movieDetailsContainer.innerHTML = `<p>Error: ${error.message}</p>`;
    } finally {
        hideLoading(movieDetailsContainer);
    }
}




window.addEventListener('DOMContentLoaded', loadMovieDetails);
