const React = require('react');
const { View, Text, Modal, TouchableOpacity, Image, StyleSheet, ScrollView, Platform } = require('react-native');

function DetailModal({ theme, visible, movie, onClose, onPlay, onToggleFavorite, onToggleWatchlist, onToggleWatched }) {
  const h = React.createElement;
  if (!movie) return null;

  return h(Modal, { visible, transparent: true, animationType: 'slide', onRequestClose: onClose },
    h(View, { style: styles.backdrop },
      h(View, { style: [styles.panel, { backgroundColor: theme.background }] },
        h(ScrollView, null,
          h(Image, { source: movie.backdrop ? { uri: movie.backdrop } : (movie.poster ? { uri: movie.poster } : { uri: 'https://placehold.co/800x450' }), style: styles.backdropImage }),
          h(View, { style: styles.content },
            h(Text, { style: [styles.title, { color: theme.textPrimary }] }, movie.title),
            h(Text, { style: [styles.sub, { color: theme.textSecondary }] }, `${movie.year || '—'} • ${movie.mediaType || 'movie'} • ⭐ ${Number(movie.rating || 0).toFixed(1)}`),
            h(Text, { style: [styles.overview, { color: theme.textSecondary }] }, movie.overview || 'No overview yet.'),
            h(Text, { style: [styles.genres, { color: theme.textPrimary }] }, `Genres: ${(movie.genres || []).join(', ') || 'N/A'}`),
            h(View, { style: styles.row },
              h(ActionButton, { label: 'Play', onPress: onPlay, color: theme.primary }),
              h(ActionButton, { label: movie.watched ? 'Unwatch' : 'Watched', onPress: onToggleWatched, color: '#2D9CDB' }),
              h(ActionButton, { label: movie.favorite ? 'Unfavorite' : 'Favorite', onPress: onToggleFavorite, color: '#F2994A' })
            ),
            h(View, { style: styles.row },
              h(ActionButton, { label: movie.watchlist ? 'Remove WL' : 'Watchlist', onPress: onToggleWatchlist, color: '#27AE60' }),
              movie.trailerUrl ? h(ActionButton, {
                label: 'Trailer',
                onPress: () => {
                  if (Platform.OS === 'web' && typeof window !== 'undefined') window.open(movie.trailerUrl, '_blank');
                },
                color: '#9B51E0',
              }) : null,
              h(ActionButton, { label: 'Close', onPress: onClose, color: '#6B7280' })
            )
          )
        )
      )
    )
  );
}

function ActionButton({ label, onPress, color }) {
  return React.createElement(TouchableOpacity, { style: [styles.btn, { backgroundColor: color }], onPress },
    React.createElement(Text, { style: styles.btnText }, label));
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  panel: { maxHeight: '90%', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' },
  backdropImage: { width: '100%', height: 180 },
  content: { padding: 12 },
  title: { fontSize: 22, fontWeight: '800' },
  sub: { marginTop: 4 },
  overview: { marginTop: 12, lineHeight: 20 },
  genres: { marginTop: 12, fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
});

module.exports = DetailModal;
