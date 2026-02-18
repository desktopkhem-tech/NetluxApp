const React = require('react');
const { View, Text, TouchableOpacity, Image, StyleSheet } = require('react-native');

function MovieCard({ movie, theme, onPress }) {
  const h = React.createElement;
  return h(
    TouchableOpacity,
    { style: [styles.card, { backgroundColor: theme.card }], onPress, activeOpacity: 0.85 },
    h(Image, {
      source: movie.poster ? { uri: movie.poster } : { uri: 'https://placehold.co/300x450?text=No+Poster' },
      style: styles.poster,
    }),
    h(View, { style: styles.meta },
      h(Text, { style: [styles.title, { color: theme.textPrimary }] }, movie.title),
      h(Text, { style: [styles.sub, { color: theme.textSecondary }] }, `${movie.year || '—'} • ⭐ ${Number(movie.rating || 0).toFixed(1)}`)
    )
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, margin: 8, borderRadius: 10, overflow: 'hidden', minWidth: 145 },
  poster: { width: '100%', height: 220, backgroundColor: '#222' },
  meta: { padding: 10 },
  title: { fontSize: 14, fontWeight: '700' },
  sub: { marginTop: 4, fontSize: 12 },
});

module.exports = MovieCard;
