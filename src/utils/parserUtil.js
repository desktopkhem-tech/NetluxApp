const NOISE_WORDS = [
  '1080p', '720p', '2160p', '4k', 'bluray', 'blu-ray', 'brrip', 'bdrip', 'hdrip',
  'webrip', 'web-dl', 'webdl', 'x264', 'x265', 'h264', 'h265', 'hevc', 'dvdrip',
  'proper', 'repack', 'aac', 'ac3', 'dts', 'yify', 'rarbg'
];

function cleanTitle(raw) {
  let value = raw.replace(/[._]/g, ' ').replace(/\s+/g, ' ').trim();
  NOISE_WORDS.forEach((word) => {
    const token = word.replace('-', '[- ]?');
    value = value.replace(new RegExp(`\\b${token}\\b`, 'ig'), ' ');
  });
  return value.replace(/\s+/g, ' ').trim();
}

function parseFilename(name) {
  const base = name.replace(/\.[^/.]+$/, '');
  const withoutBrackets = base.replace(/[\[(][^\])]*[\])]/g, ' ');
  const seasonEpisodeMatch = withoutBrackets.match(/\bS(\d{1,2})E(\d{1,2})\b/i) ||
    withoutBrackets.match(/\b(\d{1,2})x(\d{1,2})\b/i);
  const yearMatch = withoutBrackets.match(/\b(19\d{2}|20\d{2})\b/);

  const isSeries = Boolean(seasonEpisodeMatch);
  const season = seasonEpisodeMatch ? parseInt(seasonEpisodeMatch[1], 10) : null;
  const episode = seasonEpisodeMatch ? parseInt(seasonEpisodeMatch[2], 10) : null;
  const year = yearMatch ? parseInt(yearMatch[1], 10) : null;

  let titleChunk = withoutBrackets;
  if (seasonEpisodeMatch) {
    titleChunk = titleChunk.replace(seasonEpisodeMatch[0], ' ');
  }
  if (yearMatch) {
    titleChunk = titleChunk.slice(0, yearMatch.index);
  }

  const title = cleanTitle(titleChunk) || cleanTitle(withoutBrackets);

  return {
    title,
    year,
    mediaType: isSeries ? 'series' : 'movie',
    season,
    episode,
  };
}

module.exports = {
  parseFilename,
};
