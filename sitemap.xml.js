import { promises as fs } from 'fs';
const apiLocation = 'https://api.themoviedb.org/3';
const apiKey = '9b92d50baa23664db9f1455d0bbc74fc'; // Replace with your actual TMDb API key

async function generateSitemap() {
  let urls = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
 <url>
    <loc>https://pwolimovies.vercel.app/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  // Function to fetch movies or tv shows from API
    const fetchMedia = async (type, page = 1, language = null) => {
      let url = `${apiLocation}/${type}/popular?api_key=${apiKey}&page=${page}`;
        if (language) {
          url = `${apiLocation}/discover/movie?api_key=${apiKey}&with_original_language=${language}&sort_by=release_date.desc&release_date.gte=${new Date().getFullYear()}-01-01&page=${page}`;
        }
      const response = await fetch(url);
      if (!response.ok) {
         throw new Error(`HTTP error fetching ${type}! status: ${response.status}`);
      }
      const data = await response.json();
        return data.results || [];
   };

  // Fetch movie and TV shows details
    try {
      const [popularMovies, popularTVShows, malayalamMovies] = await Promise.all([
        fetchMedia('movie', 1),
        fetchMedia('tv', 1),
        fetchMedia('movie',1, 'ml')
      ]);
    // Process the search pages
    urls += `  <url>
      <loc>https://pwolimovies.vercel.app/?search=avengers&type=movie</loc>
     <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
     </url>
      <url>
       <loc>https://pwolimovies.vercel.app/?search=avengers&type=tv</loc>
       <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
       <changefreq>weekly</changefreq>
       <priority>0.8</priority>
       </url>`;

        for (const item of [...popularMovies, ...popularTVShows, ...malayalamMovies]) {
            const titleSlug = (item.title || item.name)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
             const type = item.title ? 'movie' : 'tv';

             urls += `  <url>
            <loc>https://pwolimovies.vercel.app/movie-details.html?${titleSlug}-${type}-id=${item.id}</loc>
             <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.7</priority>
          </url>`;
        }

        // Add pages for load more content
        for(let page = 2; page <= 3; page++){
           urls += ` <url>
        <loc>https://pwolimovies.vercel.app/?malayalam-page-${page}=tv-page-1=movie-page-1</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.5</priority>
      </url>
       <url>
        <loc>https://pwolimovies.vercel.app/?malayalam-page-1=tv-page-${page}=movie-page-1</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.5</priority>
       </url>
        <url>
       <loc>https://pwolimovies.vercel.app/?malayalam-page-1=tv-page-1=movie-page-${page}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.5</priority>
      </url>`
        }

    } catch (error) {
      console.error("Error fetching movie or TV series:", error);
    }

   urls += `</urlset>`;


   await fs.writeFile('./public/sitemap.xml', urls); // Write to file

   console.log("Sitemap generated successfully");
}

generateSitemap();