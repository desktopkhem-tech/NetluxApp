const { Platform } = require('react-native');

const KEY = 'netlux-library-v1';
let memoryStore = null;

async function saveLibrary(data) {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    localStorage.setItem(KEY, JSON.stringify(data));
    return;
  }
  memoryStore = data;
}

async function loadLibrary() {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  }
  return memoryStore;
}

async function clearLibrary() {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    localStorage.removeItem(KEY);
  }
  memoryStore = null;
}

module.exports = {
  saveLibrary,
  loadLibrary,
  clearLibrary,
};
