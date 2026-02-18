const React = require('react');
const { View, TextInput, TouchableOpacity, Text, StyleSheet } = require('react-native');

function Navbar({ theme, search, onSearch, activeFilter, setActiveFilter }) {
  const h = React.createElement;
  const filters = ['all', 'movie', 'series', 'watched', 'favorites', 'watchlist'];

  return h(View, { style: styles.wrap },
    h(TextInput, {
      value: search,
      onChangeText: onSearch,
      placeholder: 'Search titles...',
      placeholderTextColor: theme.textSecondary,
      style: [styles.input, { color: theme.textPrimary, backgroundColor: theme.card, borderColor: theme.border }],
    }),
    h(View, { style: styles.filters },
      filters.map((f) => h(TouchableOpacity, {
        key: f,
        onPress: () => setActiveFilter(f),
        style: [styles.filter, { backgroundColor: activeFilter === f ? theme.primary : theme.card }],
      }, h(Text, { style: { color: '#fff', fontSize: 12 } }, f.toUpperCase())))
    )
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  filter: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7, marginRight: 6, marginBottom: 6 },
});

module.exports = Navbar;
