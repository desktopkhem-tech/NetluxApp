const React = require('react');
const { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform, useWindowDimensions } = require('react-native');
const Navbar = require('../components/Navbar');
const UploadForm = require('../components/UploadForm');
const MovieCard = require('../components/MovieCard');
const DetailModal = require('../components/DetailModal');
const { parseFilename } = require('../utils/parserUtil');
const { searchMediaByTitle } = require('../services/apiService');

function HomeScreen({ theme, library, setLibrary }) {
  const h = React.createElement;
  const { width } = useWindowDimensions();
  const [search, setSearch] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [selected, setSelected] = React.useState(null);

  const filtered = React.useMemo(() => {
    return library.filter((item) => {
      const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (activeFilter === 'all') return true;
      if (activeFilter === 'movie' || activeFilter === 'series') return item.mediaType === activeFilter;
      if (activeFilter === 'watched') return !!item.watched;
      if (activeFilter === 'favorites') return !!item.favorite;
      if (activeFilter === 'watchlist') return !!item.watchlist;
      return true;
    });
  }, [library, search, activeFilter]);

  const columns = width > 1200 ? 6 : width > 900 ? 5 : width > 700 ? 4 : width > 500 ? 3 : 2;

  const updateMovie = React.useCallback((id, patch) => {
    setLibrary((prev) => prev.map((m) => (m.id === id ? Object.assign({}, m, patch) : m)));
  }, [setLibrary]);

  const onUpload = React.useCallback(() => {
    if (Platform.OS !== 'web') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
      const detection = parseFilename(file.name);
      const tmdb = await searchMediaByTitle(detection).catch(() => null);
      const base = {
        id: String(Date.now()),
        title: detection.title,
        year: detection.year,
        mediaType: detection.mediaType,
        season: detection.season,
        episode: detection.episode,
        rating: 0,
        overview: '',
        genres: [],
        poster: '',
        backdrop: '',
        watched: false,
        favorite: false,
        watchlist: true,
        trailerUrl: '',
      };
      const merged = Object.assign({}, base, tmdb || {}, {
        fileName: file.name,
        fileUri: URL.createObjectURL(file),
      });
      setLibrary((prev) => [merged].concat(prev));
    };
    input.click();
  }, [setLibrary]);

  const playSelected = () => {
    if (selected && selected.fileUri && Platform.OS === 'web') {
      window.open(selected.fileUri, '_blank');
      updateMovie(selected.id, { watched: true });
      setSelected(Object.assign({}, selected, { watched: true }));
    }
  };

  return h(View, { style: [styles.container, { backgroundColor: theme.background }] },
    h(Text, { style: [styles.heading, { color: theme.textPrimary }] }, 'Netlux • Movie & Series Manager'),
    h(UploadForm, { theme, onUpload }),
    h(Navbar, { theme, search, onSearch: setSearch, activeFilter, setActiveFilter }),
    h(FlatList, {
      data: filtered,
      key: `grid-${columns}`,
      keyExtractor: (item) => item.id,
      numColumns: columns,
      contentContainerStyle: { paddingBottom: 120 },
      renderItem: ({ item }) => h(MovieCard, { movie: item, theme, onPress: () => setSelected(item) }),
      ListEmptyComponent: h(Text, { style: { color: theme.textSecondary, marginTop: 30 } }, 'No items yet. Upload a file to get started.'),
    }),
    h(DetailModal, {
      theme,
      visible: !!selected,
      movie: selected,
      onClose: () => setSelected(null),
      onPlay: playSelected,
      onToggleFavorite: () => {
        if (!selected) return;
        const value = !selected.favorite;
        updateMovie(selected.id, { favorite: value });
        setSelected(Object.assign({}, selected, { favorite: value }));
      },
      onToggleWatchlist: () => {
        if (!selected) return;
        const value = !selected.watchlist;
        updateMovie(selected.id, { watchlist: value });
        setSelected(Object.assign({}, selected, { watchlist: value }));
      },
      onToggleWatched: () => {
        if (!selected) return;
        const value = !selected.watched;
        updateMovie(selected.id, { watched: value });
        setSelected(Object.assign({}, selected, { watched: value }));
      },
    })
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  heading: { fontSize: 24, fontWeight: '800', marginBottom: 10 },
});

module.exports = HomeScreen;
