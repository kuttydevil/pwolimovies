// Reusable fetch function with error handling
async function fetchData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Fetch error:", error);
      // Optionally display a user-friendly error message here using a toast or alert
      return null;
    }
  }
  
  
  // Function to deduplicate torrents based on magnet link
  function deduplicateTorrents(torrents) {
      const seenMagnets = new Set();
      return torrents.filter(torrent => {
          if (!torrent.Magnet || seenMagnets.has(torrent.Magnet)) {
              return false;
          }
          seenMagnets.add(torrent.Magnet);
          return true;
      });
  }
  
  
  
  // Function to display a user-friendly error message
  // You might want to use a more sophisticated notification library for this
  function displayErrorMessage(message, containerId = 'movie-details-container') {
    const container = document.getElementById(containerId);
    container.innerHTML = `<p class="error-message">${message}</p>`;
  }
  
  //Export the functions
  export { fetchData, deduplicateTorrents, displayErrorMessage };