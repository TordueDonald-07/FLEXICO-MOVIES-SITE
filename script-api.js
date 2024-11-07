const API_KEY = '0aa14a336adc943b4f5969f512d0e1cd';
const BASE_URL = 'https://api.themoviedb.org/3';

// Function to show loading indicator
function showLoading(containerSelector) {
    const container = document.querySelector(containerSelector);
    container.innerHTML = '<div class="loading">Loading...</div>';
}

// Function to fetch data based on endpoint and container
async function fetchData(endpoint, containerSelector) {
    showLoading(containerSelector);
    try {
        const response = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}`);
        const data = await response.json();

        // Log data to check if API is responding correctly
        console.log(`Data from ${endpoint}:`, data);

        if (!data.results || data.results.length === 0) {
            const container = document.querySelector(containerSelector);
            container.innerHTML = '<div class="error">No movies found for this category.</div>';
            return;
        }

        displayMoviesInContainer(data.results, containerSelector);
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
        const container = document.querySelector(containerSelector);
        container.innerHTML = '<div class="error">Failed to load data. Please try again later.</div>';
    }
}

// Function to display movies in a specific container
function displayMoviesInContainer(movies, containerSelector) {
    const container = document.querySelector(containerSelector);
    container.innerHTML = ''; // Clear previous content

    movies.forEach(movie => {
        const movieElement = document.createElement('div');
        movieElement.className = 'carousel-item';
        movieElement.id = `movie-${movie.id}`; // Unique ID using movie ID

        // Add content to the movie item (poster, title, etc.)
        movieElement.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title || movie.name}">
            <div class="content">
                <h3>${movie.title || movie.name}</h3>
                <p>${movie.release_date || movie.first_air_date}</p>
            </div>
        `;

        // Add click event to store data and navigate to play page
        movieElement.onclick = () => openPlayPage({
            id: movie.id,
            title: movie.title || movie.name,
            poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            description: movie.overview,
            rating: movie.vote_average,
            releaseDate: movie.release_date || movie.first_air_date,
        });

        container.appendChild(movieElement);
    });
}

function openPlayPage(movie) {
    localStorage.setItem('selectedMovie', JSON.stringify(movie));
    fetchMovieDetails(movie.id); // Optionally fetch more details if needed
    window.location.href = 'watch-page.html'; // Redirect to play page
}



// Function to fetch movie details based on movie ID
async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
        const data = await response.json();

        console.log('Movie Details:', data); // Check the structure of data

        // Return relevant movie details, handling missing genres and runtime
        return {
            id: data.id,
            title: data.title,
            poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
            description: data.overview,
            rating: data.vote_average,
            releaseDate: data.release_date,
            runtime: data.runtime ? `${data.runtime} minutes` : 'Runtime not available',
            genres: data.genres && data.genres.length > 0 
                    ? data.genres.map(genre => genre.name).join(', ')
                    : 'Genres not available',
            cast: await fetchMovieCast(data.id),
        };
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
}

// Event listener to handle clicks on carousel items
document.addEventListener('click', (event) => {
    if (event.target.closest('.carousel-item')) {
        const itemId = event.target.closest('.carousel-item').id;
        const movieId = itemId.split('-')[1];
        console.log('Clicked on item with ID:', itemId);
        console.log('Extracted Movie ID:', movieId);
        fetchMovieDetails(movieId);
    }
});

// Event listener for page load to fetch data for different categories
document.addEventListener('DOMContentLoaded', () => {
    fetchData('/movie/popular', '.popular-shows-carousel');
    fetchData('/tv/popular', '.binge-worthy-shows-carousel');
    fetchData('/movie/now_playing', '.carousel');
    fetchData('/trending/movie/week', '.trending-trailers-carousel');
    fetchData('/movie/upcoming', '.coming-soon-carousel');
    fetchData('/movie/top_rated', '.crime-time-carousel');
    // Fetch TV Shows Currently On The Air
    fetchData('/tv/on_the_air', '.true-story-carousel'); // On The Air TV Shows
    // fetchData('/discover/movie?with_genres=35', '.holyday-therapy-carousel');
    fetchData('/trending/all/week', '.most-watchlisted-carousel');
    fetchData('/movie/now_playing', '.popular-in-nigeria-carousel'); // Now Playing Movies
    fetchData('/tv/popular', '.holyday-therapy-carousel'); // Popular TV Shows
     // Fetch TV Shows Airing Today
     fetchData('/tv/airing_today', '.airing-today-carousel'); // Airing Today TV Shows

});