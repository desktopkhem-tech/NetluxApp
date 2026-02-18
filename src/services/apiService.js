const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

function getApiKey() {
  if (typeof process !== 'undefined' && process.env && process.env.TMDB_API_KEY) {
    return process.env.TMDB_API_KEY;
  }
  if (typeof global !== 'undefined' && global.TMDB_API_KEY) {
    return global.TMDB_API_KEY;
  }
  return '';
}

function mapTmdbItem(item, fallback) {
  return {
    tmdbId: item.id,
    title: item.title || item.name || fallback.title,
    year: parseInt((item.release_date || item.first_air_date || '').slice(0, 4), 10) || fallback.year || null,
    mediaType: item.media_type === 'tv' ? 'series' : 'movie',
    poster: item.poster_path ? `${IMAGE_BASE}${item.poster_path}` : '',
    backdrop: item.backdrop_path ? `${IMAGE_BASE}${item.backdrop_path}` : '',
    rating: item.vote_average || 0,
    overview: item.overview || '',
    genres: [],
  };
}

async function searchMediaByTitle(detection) {
  const apiKey = getApiKey();
  if (!apiKey || !detection.title) return null;

  const url = `${TMDB_BASE}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(detection.title)}&include_adult=false`;
  const response = await fetch(url);
  const json = await response.json();
  const best = (json.results || []).find((item) => item.media_type === 'movie' || item.media_type === 'tv');
  if (!best) return null;

  const media = mapTmdbItem(best, detection);
  const details = await getMediaDetails(media.mediaType, media.tmdbId, apiKey);
  return Object.assign({}, media, details);
}

async function getMediaDetails(type, id, apiKeyInput) {
  const apiKey = apiKeyInput || getApiKey();
  if (!apiKey || !id) return { genres: [], trailerUrl: '' };

  const endpoint = type === 'series' ? 'tv' : 'movie';
  const [detailsResponse, videosResponse] = await Promise.all([
    fetch(`${TMDB_BASE}/${endpoint}/${id}?api_key=${apiKey}`),
    fetch(`${TMDB_BASE}/${endpoint}/${id}/videos?api_key=${apiKey}`),
  ]);
  const details = await detailsResponse.json();
  const videos = await videosResponse.json();
  const trailer = (videos.results || []).find((v) => v.site === 'YouTube' && /trailer/i.test(v.type || ''));

  return {
    genres: (details.genres || []).map((g) => g.name),
    overview: details.overview || '',
    trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '',
  };
}

module.exports = {
  searchMediaByTitle,
};
