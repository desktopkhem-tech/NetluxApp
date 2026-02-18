const React = require('react');
const { View, Text, TouchableOpacity, StyleSheet, StatusBar } = require('react-native');
const HomeScreen = require('./src/screens/HomeScreen');
const SettingsScreen = require('./src/screens/SettingsScreen');
const { loadLibrary, saveLibrary, clearLibrary } = require('./src/services/storageService');

const darkTheme = {
  primary: '#E50914',
  background: '#121212',
  card: '#1D1D1D',
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  border: '#323237',
};

const lightTheme = {
  primary: '#E50914',
  background: '#F5F5F5',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
};

const seedLibrary = [
  { id: 'seed-1', title: 'Inception', year: 2010, mediaType: 'movie', rating: 8.8, watched: false, favorite: false, watchlist: true, genres: ['Sci-Fi'], overview: 'A mind-bending heist.', poster: 'https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg' },
  { id: 'seed-2', title: 'Breaking Bad', year: 2008, mediaType: 'series', rating: 9.5, watched: true, favorite: true, watchlist: false, genres: ['Drama'], overview: 'A chemistry teacher turns to crime.', poster: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg' },
];

function App() {
  const h = React.createElement;
  const [darkMode, setDarkMode] = React.useState(true);
  const [tab, setTab] = React.useState('home');
  const [library, setLibrary] = React.useState(seedLibrary);

  React.useEffect(() => {
    loadLibrary().then((stored) => {
      if (stored && Array.isArray(stored) && stored.length) setLibrary(stored);
    });
  }, []);

  React.useEffect(() => {
    saveLibrary(library);
  }, [library]);

  const theme = darkMode ? darkTheme : lightTheme;

  return h(View, { style: [styles.app, { backgroundColor: theme.background }] },
    h(StatusBar, { barStyle: darkMode ? 'light-content' : 'dark-content' }),
    tab === 'home'
      ? h(HomeScreen, { theme, library, setLibrary })
      : h(SettingsScreen, {
          theme,
          darkMode,
          toggleDarkMode: () => setDarkMode((prev) => !prev),
          clearLibrary: async () => {
            await clearLibrary();
            setLibrary([]);
          },
        }),
    h(View, { style: [styles.bottomNav, { backgroundColor: theme.card, borderTopColor: theme.border }] },
      h(BottomTab, { label: 'Library', active: tab === 'home', onPress: () => setTab('home'), theme }),
      h(BottomTab, { label: 'Settings', active: tab === 'settings', onPress: () => setTab('settings'), theme })
    )
  );
}

function BottomTab({ label, active, onPress, theme }) {
  return React.createElement(TouchableOpacity, { style: styles.tab, onPress },
    React.createElement(Text, { style: { color: active ? theme.primary : theme.textSecondary, fontWeight: active ? '800' : '600' } }, label));
}

const styles = StyleSheet.create({
  app: { flex: 1 },
  bottomNav: {
    height: 58,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tab: { flex: 1, alignItems: 'center' },
});

module.exports = App;
