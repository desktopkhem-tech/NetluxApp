const React = require('react');
const { View, Text, TouchableOpacity, StyleSheet } = require('react-native');

function UploadForm({ theme, onUpload }) {
  const h = React.createElement;
  return h(View, { style: [styles.wrap, { borderColor: theme.border, backgroundColor: theme.card }] },
    h(Text, { style: [styles.title, { color: theme.textPrimary }] }, 'Upload Movie or Episode'),
    h(TouchableOpacity, { style: [styles.button, { backgroundColor: theme.primary }], onPress: onUpload },
      h(Text, { style: styles.buttonText }, 'Select Video File'))
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  title: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  button: { borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
});

module.exports = UploadForm;
