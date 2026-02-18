const React = require('react');
const { View, Text, TouchableOpacity, Switch, StyleSheet } = require('react-native');

function SettingsScreen({ theme, darkMode, toggleDarkMode, clearLibrary }) {
  const h = React.createElement;
  return h(View, { style: [styles.container, { backgroundColor: theme.background }] },
    h(Text, { style: [styles.title, { color: theme.textPrimary }] }, 'Settings'),
    h(View, { style: [styles.row, { borderColor: theme.border }] },
      h(Text, { style: { color: theme.textPrimary, fontWeight: '700' } }, 'Dark Theme'),
      h(Switch, { value: darkMode, onValueChange: toggleDarkMode })
    ),
    h(TouchableOpacity, { style: [styles.clearBtn, { backgroundColor: '#E50914' }], onPress: clearLibrary },
      h(Text, { style: { color: '#fff', fontWeight: '700' } }, 'Clear Library'))
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 20 },
  row: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between' },
  clearBtn: { borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
});

module.exports = SettingsScreen;
