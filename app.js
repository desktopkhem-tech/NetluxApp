const ComponentFunction = function() {
  // @section:imports @depends:[]
const React = require('react');
  const { useState, useEffect, useContext, useMemo, useCallback } = React;
  const { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform, StatusBar, ActivityIndicator, KeyboardAvoidingView, FlatList, Image, Switch, Dimensions, DocumentPicker } = require('react-native');
  const { MaterialIcons } = require('@expo/vector-icons');
  const { createBottomTabNavigator } = require('@react-navigation/bottom-tabs');
// @end:imports

  // @section:theme @depends:[]
  const storageStrategy = 'local';
  const primaryColor = '#E50914';
  const accentColor = '#E50914';
  const backgroundColor = '#FFFFFF';
  const cardColor = '#F8F9FA';
  const textPrimary = '#000000';
  const textSecondary = '#6B7280';
  const designStyle = 'modern';
  // @end:theme

  // @section:navigation-setup @depends:[]
  const Tab = createBottomTabNavigator();
  const screenWidth = Dimensions.get('window').width;
  // @end:navigation-setup

  // @section:ThemeContext @depends:[theme]
  const ThemeContext = React.createContext();
  const ThemeProvider = function(props) {
    const [darkMode, setDarkMode] = useState(true);
    const lightTheme = useMemo(function() {
      return {
        colors: {
          primary: primaryColor,
          accent: accentColor,
          background: backgroundColor,
          card: cardColor,
          textPrimary: textPrimary,
          textSecondary: textSecondary,
          border: '#E5E7EB',
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B'
        }
      };
    }, []);
    const darkTheme = useMemo(function() {
      return {
        colors: {
          primary: primaryColor,
          accent: accentColor,
          background: '#141414',
          card: '#2F2F2F',
          textPrimary: '#FFFFFF',
          textSecondary: '#B3B3B3',
          border: '#404040',
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B'
        }
      };
    }, []);
    const theme = darkMode ? darkTheme : lightTheme;
    const toggleDarkMode = useCallback(function() {
      setDarkMode(function(prev) { return !prev; });
    }, []);
    const value = useMemo(function() {
      return { theme: theme, darkMode: darkMode, toggleDarkMode: toggleDarkMode, designStyle: designStyle };
    }, [theme, darkMode, toggleDarkMode]);
    return React.createElement(ThemeContext.Provider, { value: value }, props.children);
  };
  const useTheme = function() { return useContext(ThemeContext); };
  // @end:ThemeContext

  // @section:SearchScreen-state @depends:[ThemeContext]
  const useSearchScreenState = function() {
    const themeContext = useTheme();
    const theme = themeContext.theme;
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [movies, setMovies] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [favorites, setFavorites] = useState([]);
    
    const mockMovies = useMemo(function() {
      return [
        { id: '1', title: 'The Dark Knight', year: 2008, rating: 9.0, genre: 'Action', poster: 'IMAGE:dark-knight-movie-poster' },
        { id: '2', title: 'Inception', year: 2010, rating: 8.8, genre: 'Sci-Fi', poster: 'IMAGE:inception-movie-poster' },
        { id: '3', title: 'Pulp Fiction', year: 1994, rating: 8.9, genre: 'Crime', poster: 'IMAGE:pulp-fiction-movie-poster' },
        { id: '4', title: 'The Shawshank Redemption', year: 1994, rating: 9.3, genre: 'Drama', poster: 'IMAGE:shawshank-redemption-poster' },
        { id: '5', title: 'Interstellar', year: 2014, rating: 8.6, genre: 'Sci-Fi', poster: 'IMAGE:interstellar-movie-poster' },
        { id: '6', title: 'The Godfather', year: 1972, rating: 9.2, genre: 'Crime', poster: 'IMAGE:godfather-movie-poster' },
        { id: '7', title: 'Forrest Gump', year: 1994, rating: 8.8, genre: 'Drama', poster: 'IMAGE:forrest-gump-movie-poster' },
        { id: '8', title: 'The Matrix', year: 1999, rating: 8.7, genre: 'Sci-Fi', poster: 'IMAGE:matrix-movie-poster' }
      ];
    }, []);

    return {
      theme: theme,
      searchQuery: searchQuery,
      setSearchQuery: setSearchQuery,
      searchResults: searchResults,
      setSearchResults: setSearchResults,
      loading: loading,
      setLoading: setLoading,
      movies: movies,
      setMovies: setMovies,
      watchlist: watchlist,
      setWatchlist: setWatchlist,
      favorites: favorites,
      setFavorites: setFavorites,
      mockMovies: mockMovies
    };
  };
  // @end:SearchScreen-state

  // @section:SearchScreen-handlers @depends:[SearchScreen-state]
  const extractMovieInfoFromFilename = function(filename) {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    
    const qualityKeywords = ['1080p', '720p', '480p', '2160p', '4k', 'bluray', 'blu-ray', 'webrip', 'webdl', 'web-dl', 'hdtv', 'x264', 'x265', 'h264', 'h265', 'hevc', 'hdrip', 'dvrip', 'dvdrip', 'aac', 'ac3', 'dts', 'amaized'];
    let cleanedName = nameWithoutExt;
    
    qualityKeywords.forEach(function(keyword) {
      const regex = new RegExp('\\s*' + keyword + '.*$', 'i');
      cleanedName = cleanedName.replace(regex, '');
    });
    
    cleanedName = cleanedName.replace(/[\[\(].*?[\]\)]/g, '').trim();
    
    const seriesPattern = /([Ss](\d{1,2})[Ee](\d{1,2}))/;
    const seriesMatch = cleanedName.match(seriesPattern);
    const mediaType = seriesMatch ? 'series' : 'movie';
    
    let season = null;
    let episode = null;
    if (seriesMatch) {
      season = parseInt(seriesMatch[2], 10);
      episode = parseInt(seriesMatch[3], 10);
      cleanedName = cleanedName.replace(seriesPattern, '').trim();
    }
    
    const titleYearMatch = cleanedName.match(/^(.+?)\s+(\d{4})/);
    
    const result = {
      title: '',
      year: new Date().getFullYear(),
      mediaType: mediaType,
      season: season,
      episode: episode
    };
    
    if (titleYearMatch) {
      result.title = titleYearMatch[1].replace(/[._-]/g, ' ').trim();
      result.year = parseInt(titleYearMatch[2], 10);
    } else {
      result.title = cleanedName.replace(/[._-]/g, ' ').trim();
    }
    
    return result;
  };

  const searchScreenHandlers = {
    searchMovies: function(state, query) {
      if (!query.trim()) {
        state.setSearchResults([]);
        return;
      }
      
      state.setLoading(true);
      setTimeout(function() {
        const results = state.mockMovies.filter(function(movie) {
          return movie.title.toLowerCase().indexOf(query.toLowerCase()) !== -1;
        });
        state.setSearchResults(results);
        state.setLoading(false);
      }, 500);
    },
    
    addToCollection: function(state, movie) {
      const isAlreadyAdded = state.movies.some(function(m) { return m.id === movie.id; });
      if (isAlreadyAdded) {
        Platform.OS === 'web' ? window.alert('Movie already in collection') : Alert.alert('Info', 'Movie already in collection');
        return;
      }
      
      state.setMovies(function(prev) { return prev.concat([movie]); });
      Platform.OS === 'web' ? window.alert('Movie added to collection!') : Alert.alert('Success', 'Movie added to collection!');
    },
    
    handleFileUpload: function(state, fileUri, fileName) {
      const movieInfo = extractMovieInfoFromFilename(fileName);
      const newMovie = {
        id: 'uploaded-' + Date.now(),
        title: movieInfo.title,
        year: movieInfo.year,
        rating: 0,
        genre: 'Uploaded',
        poster: 'IMAGE:movie-file-icon',
        fileUri: fileUri,
        fileName: fileName,
        isLocalFile: true,
        mediaType: movieInfo.mediaType,
        season: movieInfo.season,
        episode: movieInfo.episode
      };
      
      state.setMovies(function(prev) { return prev.concat([newMovie]); });
      var alertMessage = movieInfo.mediaType === 'series' ? (movieInfo.title + ' - S' + String(movieInfo.season).padStart(2, '0') + 'E' + String(movieInfo.episode).padStart(2, '0')) : (movieInfo.title + ' (' + movieInfo.year + ')');
      Platform.OS === 'web' ? window.alert(movieInfo.mediaType === 'series' ? 'Series uploaded successfully!\n' + alertMessage : 'Movie uploaded successfully!\n' + alertMessage) : Alert.alert('Success', movieInfo.mediaType === 'series' ? 'Series uploaded successfully!\n' + alertMessage : 'Movie uploaded successfully!\n' + alertMessage);
    },
    
    pickAndUploadFile: function(state) {
      if (Platform.OS === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.mp4,.mkv,.avi,.mov,.flv,.wmv,.webm';
        input.onchange = function(e) {
          const file = e.target.files[0];
          if (file) {
            const fileUri = URL.createObjectURL(file);
            searchScreenHandlers.handleFileUpload(state, fileUri, file.name);
          }
        };
        input.click();
      } else {
        DocumentPicker.getDocumentAsync({
          type: 'video/*'
        }).then(function(result) {
          if (!result.cancelled && result.uri) {
            const fileName = result.uri.split('/').pop();
            searchScreenHandlers.handleFileUpload(state, result.uri, fileName);
          }
        }).catch(function(err) {
          Alert.alert('Error', 'Failed to pick file');
        });
      }
    }
  };
  // @end:SearchScreen-handlers

  // @section:SearchScreen @depends:[SearchScreen-state,SearchScreen-handlers,styles]
  const SearchScreen = function() {
    const state = useSearchScreenState();
    const handlers = searchScreenHandlers;

    useEffect(function() {
      if (state.searchQuery) {
        handlers.searchMovies(state, state.searchQuery);
      } else {
        state.setSearchResults([]);
      }
    }, [state.searchQuery]);

    const renderSearchResult = function(item) {
      const movie = item.item;
      return React.createElement(View, { 
        style: [styles.searchResultCard, { backgroundColor: state.theme.colors.card }],
        componentId: 'search-result-' + movie.id
      },
        React.createElement(Image, {
          source: { uri: movie.poster },
          style: styles.searchPoster,
          componentId: 'search-poster-' + movie.id
        }),
        React.createElement(View, { style: styles.searchResultInfo, componentId: 'search-info-' + movie.id },
          React.createElement(Text, { 
            style: [styles.searchTitle, { color: state.theme.colors.textPrimary }],
            componentId: 'search-title-' + movie.id
          }, movie.title),
          React.createElement(Text, { 
            style: [styles.searchMeta, { color: state.theme.colors.textSecondary }],
            componentId: 'search-meta-' + movie.id
          }, movie.year + ' • ' + movie.genre + ' • ⭐ ' + movie.rating),
          React.createElement(TouchableOpacity, {
            style: [styles.addButton, { backgroundColor: state.theme.colors.primary }],
            onPress: function() { handlers.addToCollection(state, movie); },
            componentId: 'add-button-' + movie.id
          },
            React.createElement(Text, { 
              style: styles.addButtonText,
              componentId: 'add-button-text-' + movie.id
            }, 'Add to Collection')
          )
        )
      );
    };

    return React.createElement(View, {
      style: [styles.container, { backgroundColor: state.theme.colors.background }],
      componentId: 'search-screen'
    },
      React.createElement(StatusBar, { 
        barStyle: state.theme.colors.background === '#141414' ? 'light-content' : 'dark-content'
      }),
      React.createElement(View, { style: styles.searchHeader, componentId: 'search-header' },
        React.createElement(Text, { 
          style: [styles.screenTitle, { color: state.theme.colors.textPrimary }],
          componentId: 'search-screen-title'
        }, 'Search Movies'),
        React.createElement(View, { 
          style: [styles.searchContainer, { backgroundColor: state.theme.colors.card }],
          componentId: 'search-container'
        },
          React.createElement(MaterialIcons, { 
            name: 'search', 
            size: 24, 
            color: state.theme.colors.textSecondary,
            style: styles.searchIcon
          }),
          React.createElement(TextInput, {
            style: [styles.searchInput, { color: state.theme.colors.textPrimary }],
            placeholder: 'Search for movies...',
            placeholderTextColor: state.theme.colors.textSecondary,
            value: state.searchQuery,
            onChangeText: state.setSearchQuery,
            componentId: 'search-input'
          })
        )
      ),
      state.loading ? React.createElement(ActivityIndicator, {
        style: { flex: 1, marginTop: 50 },
        size: 'large',
        color: state.theme.colors.primary,
        componentId: 'search-loading'
      }) : React.createElement(FlatList, {
        data: state.searchResults,
        renderItem: renderSearchResult,
        keyExtractor: function(item) { return item.id; },
        contentContainerStyle: { paddingBottom: Platform.OS === 'web' ? 90 : 100 },
        showsVerticalScrollIndicator: false,
        componentId: 'search-results-list'
      })
    );
  };
  // @end:SearchScreen

  // @section:HomeScreen-state @depends:[ThemeContext]
const useHomeScreenState = function() {
    const themeContext = useTheme();
    const theme = themeContext.theme;
    const [movies, setMovies] = useState([
      { id: '1', title: 'The Dark Knight', year: 2008, rating: 9.0, genre: 'Action', poster: 'IMAGE:dark-knight-movie-poster', watched: false, filePath: null, type: 'movie' },
      { id: '2', title: 'Inception', year: 2010, rating: 8.8, genre: 'Sci-Fi', poster: 'IMAGE:inception-movie-poster', watched: false, filePath: null, type: 'movie' }
    ]);
    const [watchlist, setWatchlist] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [contentType, setContentType] = useState('movie');
    const [loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [showAddMovieForm, setShowAddMovieForm] = useState(false);
    const [formData, setFormData] = useState({
      title: '',
      year: new Date().getFullYear().toString(),
      genre: '',
      rating: '5.0',
      watched: false,
      favorite: false,
      watchlist: false
    });

    return {
      theme: theme,
      movies: movies,
      setMovies: setMovies,
      watchlist: watchlist,
      setWatchlist: setWatchlist,
      favorites: favorites,
      setFavorites: setFavorites,
      selectedMovie: selectedMovie,
      setSelectedMovie: setSelectedMovie,
      showModal: showModal,
      setShowModal: setShowModal,
      searchQuery: searchQuery,
      setSearchQuery: setSearchQuery,
      activeFilter: activeFilter,
      setActiveFilter: setActiveFilter,
      contentType: contentType,
      setContentType: setContentType,
      loading: loading,
      setLoading: setLoading,
      searchResults: searchResults,
      setSearchResults: setSearchResults,
      showSearchResults: showSearchResults,
      setShowSearchResults: setShowSearchResults,
      uploadingFile: uploadingFile,
      setUploadingFile: setUploadingFile,
      showAddMovieForm: showAddMovieForm,
      setShowAddMovieForm: setShowAddMovieForm,
      formData: formData,
      setFormData: setFormData
    };
  };
// @end:HomeScreen-state

  // @section:HomeScreen-handlers @depends:[HomeScreen-state]
const homeScreenHandlers = {
    openMovieDetails: function(state, movie) {
      state.setSelectedMovie(movie);
      state.setShowModal(true);
    },
    
    closeMovieDetails: function(state) {
      state.setShowModal(false);
      state.setSelectedMovie(null);
    },

    openAddMovieForm: function(state) {
      state.setShowAddMovieForm(true);
    },

    closeAddMovieForm: function(state) {
      state.setShowAddMovieForm(false);
      state.setFormData({
        title: '',
        year: new Date().getFullYear().toString(),
        genre: '',
        rating: '5.0',
        watched: false,
        favorite: false,
        watchlist: false
      });
    },

    updateFormField: function(state, field, value) {
      state.setFormData(function(prev) {
        var updated = Object.assign({}, prev);
        updated[field] = value;
        return updated;
      });
    },

    saveMovieFromForm: function(state, handlers) {
      if (!state.formData.title.trim()) {
        Alert.alert('Error', 'Please enter a movie title');
        return;
      }

      var newMovie = {
        id: 'manual-' + Date.now(),
        title: state.formData.title.trim(),
        year: parseInt(state.formData.year) || new Date().getFullYear(),
        genre: state.formData.genre.trim() || 'Unknown',
        rating: parseFloat(state.formData.rating) || 5.0,
        poster: 'IMAGE:placeholder-poster',
        watched: state.formData.watched,
        filePath: null,
        type: 'movie'
      };

      state.setMovies(function(prev) { return prev.concat([newMovie]); });

      if (state.formData.favorite) {
        state.setFavorites(function(prev) { return prev.concat([newMovie]); });
      }

      if (state.formData.watchlist) {
        state.setWatchlist(function(prev) { return prev.concat([newMovie]); });
      }

      handlers.closeAddMovieForm(state);
      Alert.alert('Success', 'Movie added to your collection!');
    },
    
    toggleWatchlist: function(state, movie) {
      const isInWatchlist = state.watchlist.some(function(m) { return m.id === movie.id; });
      if (isInWatchlist) {
        state.setWatchlist(function(prev) {
          return prev.filter(function(m) { return m.id !== movie.id; });
        });
      } else {
        state.setWatchlist(function(prev) { return prev.concat([movie]); });
      }
    },
    
    toggleFavorites: function(state, movie) {
      const isInFavorites = state.favorites.some(function(m) { return m.id === movie.id; });
      if (isInFavorites) {
        state.setFavorites(function(prev) {
          return prev.filter(function(m) { return m.id !== movie.id; });
        });
      } else {
        state.setFavorites(function(prev) { return prev.concat([movie]); });
      }
    },

    toggleWatched: function(state, movie) {
      state.setMovies(function(prev) {
        return prev.map(function(m) {
          if (m.id === movie.id) {
            return Object.assign({}, m, { watched: !m.watched });
          }
          return m;
        });
      });
    },

    extractMetadataFromFilename: function(filename) {
      var result = { title: filename, year: null };
      var cleanedName = filename.replace(/\.[^/.]+$/, '');
      var yearMatch = cleanedName.match(/(\d{4})/);
      if (yearMatch) {
        result.year = parseInt(yearMatch[1]);
        result.title = cleanedName.substring(0, yearMatch.index).trim();
      } else {
        result.title = cleanedName.replace(/[\.\-_]/g, ' ').trim();
      }
      result.title = result.title.replace(/1080p|720p|480p|BluRay|HDTV|DVDRip|WEB\-DL|H\.264|x264|H\.265|x265|AAC|DTS|AC3|FLAC/gi, '').trim();
      return result;
    },

    searchTMDB: function(state, query, year, callback) {
      state.setLoading(true);
      var tmdbApiKey = 'YOUR_TMDB_API_KEY';
      var searchUrl = 'https://api.themoviedb.org/3/search/multi?api_key=' + tmdbApiKey + '&query=' + encodeURIComponent(query) + '&include_adult=false';
      
      fetch(searchUrl)
        .then(function(response) { return response.json(); })
        .then(function(data) {
          var results = data.results.map(function(item) {
            var posterPath = item.poster_path ? 'https://image.tmdb.org/t/p/w500' + item.poster_path : 'IMAGE:placeholder-poster';
            var title = item.title || item.name || '';
            var releaseDate = item.release_date || item.first_air_date || '';
            var itemYear = releaseDate ? parseInt(releaseDate.substring(0, 4)) : null;
            var rating = item.vote_average || 0;
            var type = item.media_type === 'tv' ? 'series' : 'movie';
            
            return {
              id: item.id + '-' + type,
              title: title,
              year: itemYear,
              rating: rating,
              poster: posterPath,
              genre: item.genre_ids ? item.genre_ids.join(', ') : 'Unknown',
              type: type,
              tmdbId: item.id,
              watched: false,
              filePath: null
            };
          });

          if (year) {
            results = results.filter(function(r) { return r.year === year; });
          }

          state.setSearchResults(results);
          state.setShowSearchResults(true);
          state.setLoading(false);
          if (callback) callback(results);
        })
        .catch(function(error) {
          console.error('TMDB Search Error:', error);
          state.setLoading(false);
        });
    },

    addMovieToCollection: function(state, movie) {
      var exists = state.movies.some(function(m) { return m.id === movie.id; });
      if (!exists) {
        state.setMovies(function(prev) { return prev.concat([movie]); });
      }
      state.setShowSearchResults(false);
      state.setSearchQuery('');
    },

    handleFileUpload: function(state, handlers, callback) {
      if (Platform.OS === 'web') {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.mp4,.mkv,.avi,.mov,.flv,.wmv,.webm';
        input.onchange = function(e) {
          var file = e.target.files[0];
          if (file) {
            var metadata = handlers.extractMetadataFromFilename(file.name);
            state.setUploadingFile(true);
            
            handlers.searchTMDB(state, metadata.title, metadata.year, function(results) {
              state.setUploadingFile(false);
              if (results && results.length > 0) {
                var tmdbMovie = results[0];
                var newMovie = Object.assign({}, tmdbMovie, {
                  filePath: file,
                  fileName: file.name
                });
                handlers.addMovieToCollection(state, newMovie);
                if (callback) callback(newMovie);
              } else {
                var manualMovie = Object.assign({
                  id: 'manual-' + Date.now(),
                  watched: false,
                  filePath: file,
                  fileName: file.name,
                  poster: 'IMAGE:placeholder-poster'
                }, metadata);
                handlers.addMovieToCollection(state, manualMovie);
                if (callback) callback(manualMovie);
              }
            });
          }
        };
        input.click();
      } else {
        DocumentPicker.pick({
          type: [DocumentPickerTypes.video]
        }).then(function(res) {
          var file = res[0];
          var metadata = handlers.extractMetadataFromFilename(file.name);
          state.setUploadingFile(true);
          
          handlers.searchTMDB(state, metadata.title, metadata.year, function(results) {
            state.setUploadingFile(false);
            if (results && results.length > 0) {
              var tmdbMovie = results[0];
              var newMovie = Object.assign({}, tmdbMovie, {
                filePath: file.uri,
                fileName: file.name
              });
              handlers.addMovieToCollection(state, newMovie);
              if (callback) callback(newMovie);
            } else {
              var manualMovie = Object.assign({
                id: 'manual-' + Date.now(),
                watched: false,
                filePath: file.uri,
                fileName: file.name,
                poster: 'IMAGE:placeholder-poster'
              }, metadata);
              handlers.addMovieToCollection(state, manualMovie);
              if (callback) callback(manualMovie);
            }
          });
        }).catch(function(err) {
          console.error('File picker error:', err);
          state.setUploadingFile(false);
        });
      }
    },

    playMovie: function(state, movie) {
      if (movie.filePath) {
        if (Platform.OS === 'web') {
          var videoElement = document.createElement('video');
          videoElement.src = URL.createObjectURL(movie.filePath);
          videoElement.style.width = '100%';
          videoElement.style.height = '100%';
          videoElement.controls = true;
          videoElement.fullscreen = true;
          document.body.appendChild(videoElement);
          videoElement.play();
        } else {
          Navigation.push('video-player-screen', {
            videoPath: movie.filePath,
            movieTitle: movie.title
          });
        }
        handlers.toggleWatched(state, movie);
      }
    },

    filterMovies: function(state) {
      var filtered = state.movies.filter(function(movie) {
        var matchesType = state.contentType === 'all' || movie.type === state.contentType;
        var matchesFilter = true;

        if (state.activeFilter === 'watched') {
          matchesFilter = movie.watched;
        } else if (state.activeFilter === 'unwatched') {
          matchesFilter = !movie.watched;
        } else if (state.activeFilter === 'favorites') {
          matchesFilter = state.favorites.some(function(m) { return m.id === movie.id; });
        } else if (state.activeFilter === 'watchlist') {
          matchesFilter = state.watchlist.some(function(m) { return m.id === movie.id; });
        }

        var matchesSearch = state.searchQuery === '' || 
          movie.title.toLowerCase().indexOf(state.searchQuery.toLowerCase()) !== -1;

        return matchesType && matchesFilter && matchesSearch;
      });

      return filtered;
    }
  };
// @end:HomeScreen-handlers

  // @section:HomeScreen @depends:[HomeScreen-state,HomeScreen-handlers,MovieDetailModal,styles]
const HomeScreen = function() {
    const state = useHomeScreenState();
    const handlers = homeScreenHandlers;
    const filteredMovies = handlers.filterMovies(state);

    const renderSearchResults = function() {
      if (!state.showSearchResults || state.searchResults.length === 0) {
        return null;
      }

      return React.createElement(View, {
        style: [styles.searchResultsContainer, { backgroundColor: state.theme.colors.background }],
        componentId: 'search-results-container'
      },
        React.createElement(FlatList, {
          data: state.searchResults,
          renderItem: function(item) {
            var movie = item.item;
            return React.createElement(TouchableOpacity, {
              style: [styles.searchResultCard, { backgroundColor: state.theme.colors.card }],
              onPress: function() { handlers.addMovieToCollection(state, movie); },
              componentId: 'search-result-' + movie.id
            },
              React.createElement(Image, {
                source: { uri: movie.poster },
                style: styles.searchPoster,
                componentId: 'search-poster-' + movie.id
              }),
              React.createElement(View, { style: styles.searchResultInfo, componentId: 'search-info-' + movie.id },
                React.createElement(Text, { 
                  style: [styles.searchTitle, { color: state.theme.colors.textPrimary }],
                  numberOfLines: 2,
                  componentId: 'search-title-' + movie.id
                }, movie.title),
                React.createElement(Text, { 
                  style: [styles.searchMeta, { color: state.theme.colors.textSecondary }],
                  componentId: 'search-meta-' + movie.id
                }, movie.year + ' • ⭐ ' + movie.rating.toFixed(1) + ' • ' + movie.type)
              ),
              React.createElement(TouchableOpacity, {
                style: [styles.addButton, { backgroundColor: state.theme.colors.primary }],
                onPress: function() { handlers.addMovieToCollection(state, movie); },
                componentId: 'add-button-' + movie.id
              },
                React.createElement(MaterialIcons, { name: 'add', size: 14, color: '#FFFFFF' }),
                React.createElement(Text, { style: styles.addButtonText, componentId: 'add-text-' + movie.id }, 'Add')
              )
            );
          },
          keyExtractor: function(item) { return item.id; },
          scrollEnabled: true,
          nestedScrollEnabled: true,
          componentId: 'search-results-list'
        }),
        React.createElement(TouchableOpacity, {
          style: [styles.closeSearchButton, { backgroundColor: state.theme.colors.card }],
          onPress: function() { state.setShowSearchResults(false); },
          componentId: 'close-search-button'
        },
          React.createElement(MaterialIcons, { name: 'close', size: 24, color: state.theme.colors.textPrimary })
        )
      );
    };

    const renderMovieCard = function(item) {
      var movie = item.item;
      var isFavorite = state.favorites.some(function(m) { return m.id === movie.id; });
      
      return React.createElement(TouchableOpacity, {
        style: [styles.movieCard, { opacity: movie.watched ? 0.6 : 1 }],
        onPress: function() { handlers.openMovieDetails(state, movie); },
        onLongPress: function() { handlers.playMovie(state, movie); },
        componentId: 'movie-card-' + movie.id
      },
        React.createElement(View, { style: styles.movieCardWrapper, componentId: 'card-wrapper-' + movie.id },
          React.createElement(Image, {
            source: { uri: movie.poster },
            style: styles.moviePoster,
            componentId: 'movie-poster-' + movie.id
          }),
          movie.watched ? React.createElement(View, {
            style: styles.watchedOverlay,
            componentId: 'watched-overlay-' + movie.id
          },
            React.createElement(MaterialIcons, { name: 'check-circle', size: 32, color: state.theme.colors.primary })
          ) : null,
          isFavorite ? React.createElement(View, {
            style: styles.favoriteIcon,
            componentId: 'favorite-icon-' + movie.id
          },
            React.createElement(MaterialIcons, { name: 'favorite', size: 20, color: state.theme.colors.primary })
          ) : null,
          React.createElement(View, {
            style: [styles.movieInfo, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }],
            componentId: 'card-info-' + movie.id
          },
            React.createElement(Text, { 
              style: [styles.movieTitle, { color: '#FFFFFF' }],
              numberOfLines: 1,
              componentId: 'movie-title-' + movie.id
            }, movie.title),
            React.createElement(Text, { 
              style: [styles.movieYear, { color: '#B3B3B3' }],
              componentId: 'movie-year-' + movie.id
            }, (movie.year || 'N/A') + ' • ⭐ ' + (movie.rating ? movie.rating.toFixed(1) : '0'))
          )
        )
      );
    };

    const renderAddMovieForm = function() {
      return React.createElement(Modal, {
        visible: state.showAddMovieForm,
        animationType: 'slide',
        transparent: true,
        onRequestClose: function() { handlers.closeAddMovieForm(state); },
        componentId: 'add-movie-modal'
      },
        React.createElement(View, {
          style: styles.addMovieFormOverlay,
          componentId: 'add-movie-overlay'
        },
          React.createElement(KeyboardAvoidingView, {
            behavior: Platform.OS === 'ios' ? 'padding' : 'height',
            style: { flex: 1 },
            componentId: 'add-movie-keyboard-avoid'
          },
            React.createElement(View, {
              style: [styles.addMovieFormContainer, { backgroundColor: state.theme.colors.card }],
              componentId: 'add-movie-form-container'
            },
              React.createElement(View, {
                style: styles.formHeader,
                componentId: 'add-movie-header'
              },
                React.createElement(Text, {
                  style: [styles.formTitle, { color: state.theme.colors.textPrimary }],
                  componentId: 'add-movie-title'
                }, 'Add Movie'),
                React.createElement(TouchableOpacity, {
                  style: [styles.formCloseButton, { backgroundColor: state.theme.colors.border }],
                  onPress: function() { handlers.closeAddMovieForm(state); },
                  componentId: 'add-movie-close-btn'
                },
                  React.createElement(MaterialIcons, {
                    name: 'close',
                    size: 20,
                    color: state.theme.colors.textPrimary
                  })
                )
              ),
              React.createElement(ScrollView, {
                showsVerticalScrollIndicator: false,
                contentContainerStyle: { paddingBottom: 20 },
                componentId: 'add-movie-scroll'
              },
                React.createElement(View, { style: styles.formGroup, componentId: 'form-group-title' },
                  React.createElement(Text, {
                    style: [styles.formLabel, { color: state.theme.colors.textPrimary }],
                    componentId: 'label-title'
                  }, 'Title *'),
                  React.createElement(TextInput, {
                    style: [
                      styles.formInput,
                      {
                        color: state.theme.colors.textPrimary,
                        borderColor: state.theme.colors.border,
                        backgroundColor: state.theme.colors.background
                      }
                    ],
                    placeholder: 'Movie title',
                    placeholderTextColor: state.theme.colors.textSecondary,
                    value: state.formData.title,
                    onChangeText: function(text) { handlers.updateFormField(state, 'title', text); },
                    componentId: 'input-title'
                  })
                ),
                React.createElement(View, { style: styles.formRow, componentId: 'form-row-year-rating' },
                  React.createElement(View, { style: styles.formRowItem, componentId: 'form-item-year' },
                    React.createElement(Text, {
                      style: [styles.formLabel, { color: state.theme.colors.textPrimary }],
                      componentId: 'label-year'
                    }, 'Year'),
                    React.createElement(TextInput, {
                      style: [
                        styles.formInput,
                        {
                          color: state.theme.colors.textPrimary,
                          borderColor: state.theme.colors.border,
                          backgroundColor: state.theme.colors.background
                        }
                      ],
                      placeholder: '2024',
                      placeholderTextColor: state.theme.colors.textSecondary,
                      value: state.formData.year,
                      onChangeText: function(text) { handlers.updateFormField(state, 'year', text); },
                      keyboardType: 'numeric',
                      maxLength: 4,
                      componentId: 'input-year'
                    })
                  ),
                  React.createElement(View, { style: styles.formRowItem, componentId: 'form-item-rating' },
                    React.createElement(Text, {
                      style: [styles.formLabel, { color: state.theme.colors.textPrimary }],
                      componentId: 'label-rating'
                    }, 'Rating'),
                    React.createElement(TextInput, {
                      style: [
                        styles.formInput,
                        {
                          color: state.theme.colors.textPrimary,
                          borderColor: state.theme.colors.border,
                          backgroundColor: state.theme.colors.background
                        }
                      ],
                      placeholder: '0.0 - 10.0',
                      placeholderTextColor: state.theme.colors.textSecondary,
                      value: state.formData.rating,
                      onChangeText: function(text) { handlers.updateFormField(state, 'rating', text); },
                      keyboardType: 'decimal-pad',
                      maxLength: 4,
                      componentId: 'input-rating'
                    })
                  )
                ),
                React.createElement(View, { style: styles.formGroup, componentId: 'form-group-genre' },
                  React.createElement(Text, {
                    style: [styles.formLabel, { color: state.theme.colors.textPrimary }],
                    componentId: 'label-genre'
                  }, 'Genre'),
                  React.createElement(TextInput, {
                    style: [
                      styles.formInput,
                      {
                        color: state.theme.colors.textPrimary,
                        borderColor: state.theme.colors.border,
                        backgroundColor: state.theme.colors.background
                      }
                    ],
                    placeholder: 'e.g., Action, Drama, Sci-Fi',
                    placeholderTextColor: state.theme.colors.textSecondary,
                    value: state.formData.genre,
                    onChangeText: function(text) { handlers.updateFormField(state, 'genre', text); },
                    componentId: 'input-genre'
                  })
                ),
                React.createElement(View, {
                  style: [styles.toggleRow, { borderBottomColor: state.theme.colors.border }],
                  componentId: 'toggle-watched'
                },
                  React.createElement(Text, {
                    style: [styles.toggleLabel, { color: state.theme.colors.textPrimary }],
                    componentId: 'label-watched'
                  }, 'Mark as Watched'),
                  React.createElement(Switch, {
                    value: state.formData.watched,
                    onValueChange: function(value) { handlers.updateFormField(state, 'watched', value); },
                    trackColor: { false: state.theme.colors.border, true: state.theme.colors.primary },
                    componentId: 'switch-watched'
                  })
                ),
                React.createElement(View, {
                  style: [styles.toggleRow, { borderBottomColor: state.theme.colors.border }],
                  componentId: 'toggle-favorite'
                },
                  React.createElement(Text, {
                    style: [styles.toggleLabel, { color: state.theme.colors.textPrimary }],
                    componentId: 'label-favorite'
                  }, 'Add to Favorites'),
                  React.createElement(Switch, {
                    value: state.formData.favorite,
                    onValueChange: function(value) { handlers.updateFormField(state, 'favorite', value); },
                    trackColor: { false: state.theme.colors.border, true: state.theme.colors.primary },
                    componentId: 'switch-favorite'
                  })
                ),
                React.createElement(View, {
                  style: [styles.toggleRow, { borderBottomColor: state.theme.colors.border }],
                  componentId: 'toggle-watchlist'
                },
                  React.createElement(Text, {
                    style: [styles.toggleLabel, { color: state.theme.colors.textPrimary }],
                    componentId: 'label-watchlist'
                  }, 'Add to Watchlist'),
                  React.createElement(Switch, {
                    value: state.formData.watchlist,
                    onValueChange: function(value) { handlers.updateFormField(state, 'watchlist', value); },
                    trackColor: { false: state.theme.colors.border, true: state.theme.colors.primary },
                    componentId: 'switch-watchlist'
                  })
                )
              ),
              React.createElement(View, {
                style: styles.formActions,
                componentId: 'form-actions'
              },
                React.createElement(TouchableOpacity, {
                  style: [styles.formCancelButton, { borderColor: state.theme.colors.border }],
                  onPress: function() { handlers.closeAddMovieForm(state); },
                  componentId: 'btn-cancel'
                },
                  React.createElement(Text, {
                    style: [styles.formCancelText, { color: state.theme.colors.textPrimary }],
                    componentId: 'text-cancel'
                  }, 'Cancel')
                ),
                React.createElement(TouchableOpacity, {
                  style: [styles.formButton, { backgroundColor: state.theme.colors.primary }],
                  onPress: function() { handlers.saveMovieFromForm(state, handlers); },
                  componentId: 'btn-save'
                },
                  React.createElement(MaterialIcons, { name: 'save', size: 18, color: '#FFFFFF' }),
                  React.createElement(Text, {
                    style: styles.formButtonText,
                    componentId: 'text-save'
                  }, 'Save Movie')
                )
              )
            )
          )
        )
      );
    };

    return React.createElement(View, {
      style: [styles.container, { backgroundColor: state.theme.colors.background }],
      componentId: 'home-screen'
    },
      React.createElement(StatusBar, { 
        barStyle: state.theme.colors.background === '#141414' ? 'light-content' : 'dark-content'
      }),
      React.createElement(View, {
        style: styles.headerContainer,
        componentId: 'header-container'
      },
        React.createElement(Text, { 
          style: [styles.screenTitle, { color: state.theme.colors.textPrimary }],
          componentId: 'home-screen-title'
        }, 'My Collection'),
        React.createElement(View, { style: { flexDirection: 'row', gap: 8 }, componentId: 'header-buttons' },
          React.createElement(TouchableOpacity, {
            style: [styles.uploadButton, { backgroundColor: state.theme.colors.primary }],
            onPress: function() { handlers.openAddMovieForm(state); },
            componentId: 'add-movie-button'
          },
            React.createElement(MaterialIcons, { name: 'add', size: 20, color: '#FFFFFF' })
          ),
          React.createElement(TouchableOpacity, {
            style: [styles.uploadButton, { backgroundColor: state.theme.colors.primary }],
            onPress: function() { handlers.handleFileUpload(state, handlers); },
            disabled: state.uploadingFile,
            componentId: 'upload-file-button'
          },
            state.uploadingFile ? React.createElement(ActivityIndicator, { color: '#FFFFFF', size: 'small' }) : React.createElement(MaterialIcons, { name: 'cloud-upload', size: 20, color: '#FFFFFF' })
          )
        )
      ),
      React.createElement(View, {
        style: [styles.searchContainer, { backgroundColor: state.theme.colors.card }],
        componentId: 'search-container'
      },
        React.createElement(MaterialIcons, { 
          name: 'search', 
          size: 20, 
          color: state.theme.colors.textSecondary,
          style: styles.searchIcon
        }),
        React.createElement(TextInput, {
          style: [styles.searchInput, { color: state.theme.colors.textPrimary }],
          placeholder: 'Search movies...',
          placeholderTextColor: state.theme.colors.textSecondary,
          value: state.searchQuery,
          onChangeText: function(text) { 
            state.setSearchQuery(text);
            if (text.length > 2) {
              handlers.searchTMDB(state, text);
            } else {
              state.setShowSearchResults(false);
            }
          },
          componentId: 'search-input'
        })
      ),
      React.createElement(View, {
        style: styles.filterContainer,
        componentId: 'filter-container'
      },
        React.createElement(ScrollView, {
          horizontal: true,
          showsHorizontalScrollIndicator: false,
          contentContainerStyle: styles.filterScroll,
          componentId: 'filter-scroll'
        },
          React.createElement(TouchableOpacity, {
            style: [
              styles.filterTab,
              state.activeFilter === 'all' ? { borderBottomColor: state.theme.colors.primary, borderBottomWidth: 2 } : {}
            ],
            onPress: function() { state.setActiveFilter('all'); },
            componentId: 'filter-all'
          },
            React.createElement(Text, {
              style: [
                styles.filterTabText,
                { color: state.activeFilter === 'all' ? state.theme.colors.primary : state.theme.colors.textSecondary }
              ],
              componentId: 'filter-all-text'
            }, 'All')
          ),
          React.createElement(TouchableOpacity, {
            style: [
              styles.filterTab,
              state.activeFilter === 'unwatched' ? { borderBottomColor: state.theme.colors.primary, borderBottomWidth: 2 } : {}
            ],
            onPress: function() { state.setActiveFilter('unwatched'); },
            componentId: 'filter-unwatched'
          },
            React.createElement(Text, {
              style: [
                styles.filterTabText,
                { color: state.activeFilter === 'unwatched' ? state.theme.colors.primary : state.theme.colors.textSecondary }
              ],
              componentId: 'filter-unwatched-text'
            }, 'Unwatched')
          ),
          React.createElement(TouchableOpacity, {
            style: [
              styles.filterTab,
              state.activeFilter === 'watched' ? { borderBottomColor: state.theme.colors.primary, borderBottomWidth: 2 } : {}
            ],
            onPress: function() { state.setActiveFilter('watched'); },
            componentId: 'filter-watched'
          },
            React.createElement(Text, {
              style: [
                styles.filterTabText,
                { color: state.activeFilter === 'watched' ? state.theme.colors.primary : state.theme.colors.textSecondary }
              ],
              componentId: 'filter-watched-text'
            }, 'Watched')
          ),
          React.createElement(TouchableOpacity, {
            style: [
              styles.filterTab,
              state.activeFilter === 'favorites' ? { borderBottomColor: state.theme.colors.primary, borderBottomWidth: 2 } : {}
            ],
            onPress: function() { state.setActiveFilter('favorites'); },
            componentId: 'filter-favorites'
          },
            React.createElement(Text, {
              style: [
                styles.filterTabText,
                { color: state.activeFilter === 'favorites' ? state.theme.colors.primary : state.theme.colors.textSecondary }
              ],
              componentId: 'filter-favorites-text'
            }, '❤️ Favorites')
          ),
          React.createElement(TouchableOpacity, {
            style: [
              styles.filterTab,
              state.activeFilter === 'watchlist' ? { borderBottomColor: state.theme.colors.primary, borderBottomWidth: 2 } : {}
            ],
            onPress: function() { state.setActiveFilter('watchlist'); },
            componentId: 'filter-watchlist'
          },
            React.createElement(Text, {
              style: [
                styles.filterTabText,
                { color: state.activeFilter === 'watchlist' ? state.theme.colors.primary : state.theme.colors.textSecondary }
              ],
              componentId: 'filter-watchlist-text'
            }, '📋 Watchlist')
          )
        )
      ),
      state.loading ? React.createElement(View, {
        style: styles.loadingContainer,
        componentId: 'loading-spinner'
      },
        React.createElement(ActivityIndicator, { size: 'large', color: state.theme.colors.primary })
      ) : null,
      state.showSearchResults ? renderSearchResults() : null,
      filteredMovies.length === 0 ? React.createElement(View, {
        style: styles.emptyState,
        componentId: 'home-empty-state'
      },
        React.createElement(MaterialIcons, { 
          name: state.activeFilter === 'favorites' ? 'favorite-border' : state.activeFilter === 'watchlist' ? 'bookmark-border' : 'movie', 
          size: 64, 
          color: state.theme.colors.textSecondary 
        }),
        React.createElement(Text, { 
          style: [styles.emptyStateText, { color: state.theme.colors.textSecondary }],
          componentId: 'home-empty-text'
        }, 'No ' + state.activeFilter + ' movies'),
        React.createElement(Text, { 
          style: [styles.emptyStateSubtext, { color: state.theme.colors.textSecondary }],
          componentId: 'home-empty-subtext'
        }, state.searchQuery ? 'Try a different search' : 'Upload or search movies to get started')
      ) : React.createElement(FlatList, {
        data: filteredMovies,
        renderItem: renderMovieCard,
        keyExtractor: function(item) { return item.id; },
        numColumns: 2,
        columnWrapperStyle: styles.movieRow,
        contentContainerStyle: { paddingBottom: Platform.OS === 'web' ? 90 : 100 },
        showsVerticalScrollIndicator: false,
        scrollIndicatorInsets: { right: 1 },
        componentId: 'home-movies-list'
      }),
      renderAddMovieForm(),
      React.createElement(MovieDetailModal, {
        visible: state.showModal,
        movie: state.selectedMovie,
        onClose: function() { handlers.closeMovieDetails(state); },
        onToggleWatchlist: function(movie) { handlers.toggleWatchlist(state, movie); },
        onToggleFavorites: function(movie) { handlers.toggleFavorites(state, movie); },
        onPlay: function(movie) { handlers.playMovie(state, movie); },
        onToggleWatched: function(movie) { handlers.toggleWatched(state, movie); },
        isInWatchlist: state.selectedMovie ? state.watchlist.some(function(m) { return m.id === state.selectedMovie.id; }) : false,
        isInFavorites: state.selectedMovie ? state.favorites.some(function(m) { return m.id === state.selectedMovie.id; }) : false,
        theme: state.theme
      })
    );
  };
// @end:HomeScreen

  // @section:MovieDetailModal @depends:[styles]
  const MovieDetailModal = function(props) {
    if (!props.movie) return null;

    return React.createElement(Modal, {
      visible: props.visible,
      animationType: 'slide',
      transparent: true,
      onRequestClose: props.onClose,
      componentId: 'movie-detail-modal'
    },
      React.createElement(View, { style: styles.modalOverlay, componentId: 'modal-overlay' },
        React.createElement(View, { 
          style: [styles.modalContent, { backgroundColor: props.theme.colors.card }],
          componentId: 'modal-content'
        },
          React.createElement(TouchableOpacity, {
            style: styles.modalCloseButton,
            onPress: props.onClose,
            componentId: 'modal-close-button'
          },
            React.createElement(MaterialIcons, { 
              name: 'close', 
              size: 24, 
              color: props.theme.colors.textPrimary 
            })
          ),
          React.createElement(ScrollView, {
            contentContainerStyle: styles.modalScrollContent,
            showsVerticalScrollIndicator: false,
            componentId: 'modal-scroll-content'
          },
            React.createElement(Image, {
              source: { uri: props.movie.poster },
              style: styles.modalPoster,
              componentId: 'modal-movie-poster'
            }),
            React.createElement(Text, { 
              style: [styles.modalTitle, { color: props.theme.colors.textPrimary }],
              componentId: 'modal-movie-title'
            }, props.movie.title),
            React.createElement(Text, { 
              style: [styles.modalMeta, { color: props.theme.colors.textSecondary }],
              componentId: 'modal-movie-meta'
            }, props.movie.year + ' • ' + props.movie.genre + ' • ⭐ ' + props.movie.rating),
            React.createElement(View, { style: styles.modalActions, componentId: 'modal-actions' },
              React.createElement(TouchableOpacity, {
                style: [
                  styles.modalActionButton, 
                  { backgroundColor: props.isInWatchlist ? props.theme.colors.primary : props.theme.colors.border }
                ],
                onPress: function() { props.onToggleWatchlist(props.movie); },
                componentId: 'modal-watchlist-button'
              },
                React.createElement(MaterialIcons, { 
                  name: props.isInWatchlist ? 'bookmark' : 'bookmark-border', 
                  size: 20, 
                  color: props.isInWatchlist ? '#FFFFFF' : props.theme.colors.textPrimary
                }),
                React.createElement(Text, { 
                  style: [
                    styles.modalActionText,
                    { color: props.isInWatchlist ? '#FFFFFF' : props.theme.colors.textPrimary }
                  ],
                  componentId: 'modal-watchlist-text'
                }, props.isInWatchlist ? 'In Watchlist' : 'Add to Watchlist')
              ),
              React.createElement(TouchableOpacity, {
                style: [
                  styles.modalActionButton, 
                  { backgroundColor: props.isInFavorites ? props.theme.colors.primary : props.theme.colors.border }
                ],
                onPress: function() { props.onToggleFavorites(props.movie); },
                componentId: 'modal-favorites-button'
              },
                React.createElement(MaterialIcons, { 
                  name: props.isInFavorites ? 'favorite' : 'favorite-border', 
                  size: 20, 
                  color: props.isInFavorites ? '#FFFFFF' : props.theme.colors.textPrimary
                }),
                React.createElement(Text, { 
                  style: [
                    styles.modalActionText,
                    { color: props.isInFavorites ? '#FFFFFF' : props.theme.colors.textPrimary }
                  ],
                  componentId: 'modal-favorites-text'
                }, props.isInFavorites ? 'Favorited' : 'Add to Favorites')
              )
            )
          )
        )
      )
    );
  };
  // @end:MovieDetailModal

  // @section:WatchlistScreen @depends:[ThemeContext,styles]
  const WatchlistScreen = function() {
    const themeContext = useTheme();
    const theme = themeContext.theme;
    const [watchlist, setWatchlist] = useState([]);

    const renderMovieCard = function(item) {
      const movie = item.item;
      return React.createElement(TouchableOpacity, {
        style: styles.movieCard,
        componentId: 'watchlist-card-' + movie.id
      },
        React.createElement(Image, {
          source: { uri: movie.poster },
          style: styles.moviePoster,
          componentId: 'watchlist-poster-' + movie.id
        }),
        React.createElement(Text, { 
          style: [styles.movieTitle, { color: theme.colors.textPrimary }],
          numberOfLines: 2,
          componentId: 'watchlist-title-' + movie.id
        }, movie.title),
        React.createElement(Text, { 
          style: [styles.movieYear, { color: theme.colors.textSecondary }],
          componentId: 'watchlist-year-' + movie.id
        }, movie.year + ' • ⭐ ' + movie.rating)
      );
    };

    return React.createElement(View, {
      style: [styles.container, { backgroundColor: theme.colors.background }],
      componentId: 'watchlist-screen'
    },
      React.createElement(StatusBar, { 
        barStyle: theme.colors.background === '#141414' ? 'light-content' : 'dark-content'
      }),
      React.createElement(Text, { 
        style: [styles.screenTitle, { color: theme.colors.textPrimary }],
        componentId: 'watchlist-screen-title'
      }, 'Watchlist'),
      watchlist.length === 0 ? React.createElement(View, {
        style: styles.emptyState,
        componentId: 'watchlist-empty-state'
      },
        React.createElement(MaterialIcons, { 
          name: 'bookmark-border', 
          size: 64, 
          color: theme.colors.textSecondary 
        }),
        React.createElement(Text, { 
          style: [styles.emptyStateText, { color: theme.colors.textSecondary }],
          componentId: 'watchlist-empty-text'
        }, 'No movies in your watchlist'),
        React.createElement(Text, { 
          style: [styles.emptyStateSubtext, { color: theme.colors.textSecondary }],
          componentId: 'watchlist-empty-subtext'
        }, 'Add movies from your collection to watch later')
      ) : React.createElement(FlatList, {
        data: watchlist,
        renderItem: renderMovieCard,
        keyExtractor: function(item) { return item.id; },
        numColumns: 2,
        columnWrapperStyle: styles.movieRow,
        contentContainerStyle: { paddingBottom: Platform.OS === 'web' ? 90 : 100 },
        showsVerticalScrollIndicator: false,
        componentId: 'watchlist-movies-list'
      })
    );
  };
  // @end:WatchlistScreen

  // @section:FavoritesScreen @depends:[ThemeContext,styles]
  const FavoritesScreen = function() {
    const themeContext = useTheme();
    const theme = themeContext.theme;
    const [favorites, setFavorites] = useState([]);

    const renderMovieCard = function(item) {
      const movie = item.item;
      return React.createElement(TouchableOpacity, {
        style: styles.movieCard,
        componentId: 'favorites-card-' + movie.id
      },
        React.createElement(Image, {
          source: { uri: movie.poster },
          style: styles.moviePoster,
          componentId: 'favorites-poster-' + movie.id
        }),
        React.createElement(Text, { 
          style: [styles.movieTitle, { color: theme.colors.textPrimary }],
          numberOfLines: 2,
          componentId: 'favorites-title-' + movie.id
        }, movie.title),
        React.createElement(Text, { 
          style: [styles.movieYear, { color: theme.colors.textSecondary }],
          componentId: 'favorites-year-' + movie.id
        }, movie.year + ' • ⭐ ' + movie.rating)
      );
    };

    return React.createElement(View, {
      style: [styles.container, { backgroundColor: theme.colors.background }],
      componentId: 'favorites-screen'
    },
      React.createElement(StatusBar, { 
        barStyle: theme.colors.background === '#141414' ? 'light-content' : 'dark-content'
      }),
      React.createElement(Text, { 
        style: [styles.screenTitle, { color: theme.colors.textPrimary }],
        componentId: 'favorites-screen-title'
      }, 'Favorites'),
      favorites.length === 0 ? React.createElement(View, {
        style: styles.emptyState,
        componentId: 'favorites-empty-state'
      },
        React.createElement(MaterialIcons, { 
          name: 'favorite-border', 
          size: 64, 
          color: theme.colors.textSecondary 
        }),
        React.createElement(Text, { 
          style: [styles.emptyStateText, { color: theme.colors.textSecondary }],
          componentId: 'favorites-empty-text'
        }, 'No favorite movies yet'),
        React.createElement(Text, { 
          style: [styles.emptyStateSubtext, { color: theme.colors.textSecondary }],
          componentId: 'favorites-empty-subtext'
        }, 'Mark movies as favorites to see them here')
      ) : React.createElement(FlatList, {
        data: favorites,
        renderItem: renderMovieCard,
        keyExtractor: function(item) { return item.id; },
        numColumns: 2,
        columnWrapperStyle: styles.movieRow,
        contentContainerStyle: { paddingBottom: Platform.OS === 'web' ? 90 : 100 },
        showsVerticalScrollIndicator: false,
        componentId: 'favorites-movies-list'
      })
    );
  };
  // @end:FavoritesScreen

  // @section:SettingsScreen @depends:[ThemeContext,styles]
  const SettingsScreen = function() {
    const themeContext = useTheme();
    const theme = themeContext.theme;
    const darkMode = themeContext.darkMode;
    const toggleDarkMode = themeContext.toggleDarkMode;

    return React.createElement(View, {
      style: [styles.container, { backgroundColor: theme.colors.background }],
      componentId: 'settings-screen'
    },
      React.createElement(StatusBar, { 
        barStyle: theme.colors.background === '#141414' ? 'light-content' : 'dark-content'
      }),
      React.createElement(Text, { 
        style: [styles.screenTitle, { color: theme.colors.textPrimary }],
        componentId: 'settings-screen-title'
      }, 'Settings'),
      React.createElement(View, { 
        style: [styles.settingsCard, { backgroundColor: theme.colors.card }],
        componentId: 'settings-theme-card'
      },
        React.createElement(View, { style: styles.settingRow, componentId: 'theme-setting-row' },
          React.createElement(View, { style: styles.settingInfo, componentId: 'theme-setting-info' },
            React.createElement(MaterialIcons, { 
              name: darkMode ? 'dark-mode' : 'light-mode', 
              size: 24, 
              color: theme.colors.textPrimary,
              style: styles.settingIcon
            }),
            React.createElement(View, { componentId: 'theme-setting-text' },
              React.createElement(Text, { 
                style: [styles.settingTitle, { color: theme.colors.textPrimary }],
                componentId: 'theme-setting-title'
              }, 'Dark Theme'),
              React.createElement(Text, { 
                style: [styles.settingDescription, { color: theme.colors.textSecondary }],
                componentId: 'theme-setting-description'
              }, 'Switch between dark and light themes')
            )
          ),
          React.createElement(Switch, {
            value: darkMode,
            onValueChange: toggleDarkMode,
            trackColor: { false: theme.colors.border, true: theme.colors.primary },
            thumbColor: '#FFFFFF',
            componentId: 'theme-toggle-switch'
          })
        )
      ),
      React.createElement(View, { 
        style: [styles.settingsCard, { backgroundColor: theme.colors.card }],
        componentId: 'settings-app-card'
      },
        React.createElement(View, { style: styles.settingRow, componentId: 'app-info-row' },
          React.createElement(View, { style: styles.settingInfo, componentId: 'app-info' },
            React.createElement(MaterialIcons, { 
              name: 'movie', 
              size: 24, 
              color: theme.colors.primary,
              style: styles.settingIcon
            }),
            React.createElement(View, { componentId: 'app-info-text' },
              React.createElement(Text, { 
                style: [styles.settingTitle, { color: theme.colors.textPrimary }],
                componentId: 'app-name'
              }, 'CineVault'),
              React.createElement(Text, { 
                style: [styles.settingDescription, { color: theme.colors.textSecondary }],
                componentId: 'app-description'
              }, 'Personal movie collection manager')
            )
          )
        )
      )
    );
  };
  // @end:SettingsScreen

  // @section:styles @depends:[theme]
const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 4
    },
    screenTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      flex: 1
    },
    uploadButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2
    },
    searchIcon: {
      marginRight: 12
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      paddingVertical: 8
    },
    filterContainer: {
      marginBottom: 12,
      height: 48
    },
    filterScroll: {
      paddingHorizontal: 4,
      alignItems: 'center'
    },
    filterTab: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginRight: 8,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent'
    },
    filterTabText: {
      fontSize: 14,
      fontWeight: '600'
    },
    searchResultsContainer: {
      position: 'absolute',
      top: 200,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      borderRadius: 12,
      marginHorizontal: 16,
      maxHeight: '60%',
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8
    },
    closeSearchButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1001,
      elevation: 5
    },
    searchResultCard: {
      flexDirection: 'row',
      padding: 12,
      marginVertical: 6,
      marginHorizontal: 4,
      borderRadius: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      alignItems: 'center'
    },
    searchPoster: {
      width: 60,
      height: 90,
      borderRadius: 8,
      marginRight: 12
    },
    searchResultInfo: {
      flex: 1,
      justifyContent: 'space-between'
    },
    searchTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4
    },
    searchMeta: {
      fontSize: 12,
      marginBottom: 8
    },
    addButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600'
    },
    movieRow: {
      justifyContent: 'space-between',
      paddingHorizontal: 4
    },
    movieCard: {
      width: (screenWidth - 48) / 2,
      marginVertical: 8,
      borderRadius: 12,
      overflow: 'hidden'
    },
    movieCardWrapper: {
      position: 'relative',
      borderRadius: 12,
      overflow: 'hidden'
    },
    moviePoster: {
      width: '100%',
      height: ((screenWidth - 48) / 2) * 1.5,
      borderRadius: 12
    },
    movieInfo: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 12,
      justifyContent: 'flex-end'
    },
    movieTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4
    },
    movieYear: {
      fontSize: 12
    },
    watchedOverlay: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginLeft: -16,
      marginTop: -16,
      zIndex: 10
    },
    favoriteIcon: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 12,
      padding: 4,
      zIndex: 10
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100
    },
    emptyStateText: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 8,
      textTransform: 'capitalize'
    },
    emptyStateSubtext: {
      fontSize: 14,
      textAlign: 'center'
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    modalContent: {
      width: screenWidth * 0.9,
      maxHeight: '85%',
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8
    },
    modalCloseButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      zIndex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center'
    },
    modalScrollContent: {
      padding: 20
    },
    modalPoster: {
      width: '100%',
      height: 300,
      borderRadius: 12,
      marginBottom: 16
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8
    },
    modalMeta: {
      fontSize: 16,
      marginBottom: 20
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      flexWrap: 'wrap'
    },
    modalActionButton: {
      flex: 1,
      minWidth: 120,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      gap: 8
    },
    modalActionText: {
      fontSize: 14,
      fontWeight: '600'
    },
    settingsCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    settingInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1
    },
    settingIcon: {
      marginRight: 16
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2
    },
    settingDescription: {
      fontSize: 14
    },
    addMovieFormOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'flex-end'
    },
    addMovieFormContainer: {
      width: '100%',
      maxHeight: '90%',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingTop: 24
    },
    formHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20
    },
    formTitle: {
      fontSize: 22,
      fontWeight: 'bold'
    },
    formCloseButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center'
    },
    formGroup: {
      marginBottom: 16
    },
    formLabel: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8
    },
    formInput: {
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      borderWidth: 1
    },
    formRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16
    },
    formRowItem: {
      flex: 1
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1
    },
    toggleLabel: {
      fontSize: 14,
      fontWeight: '600'
    },
    formActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24
    },
    formButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8
    },
    formButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF'
    },
    formCancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2
    },
    formCancelText: {
      fontSize: 16,
      fontWeight: '600'
    }
  });
// @end:styles

  // @section:TabNavigator @depends:[SearchScreen,HomeScreen,WatchlistScreen,FavoritesScreen,SettingsScreen,navigation-setup]
  const TabNavigator = function() {
    const themeContext = useTheme();
    const theme = themeContext.theme;

    return React.createElement(Tab.Navigator, {
      screenOptions: function() {
        return {
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
            height: Platform.OS === 'web' ? 80 : 90,
            paddingBottom: Platform.OS === 'web' ? 15 : 25,
            paddingTop: 10
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600'
          }
        };
      }
    },
      React.createElement(Tab.Screen, {
        name: 'Search',
        component: SearchScreen,
        options: {
          tabBarIcon: function(props) {
            return React.createElement(MaterialIcons, {
              name: 'search',
              size: 24,
              color: props.color
            });
          }
        }
      }),
      React.createElement(Tab.Screen, {
        name: 'Home',
        component: HomeScreen,
        options: {
          tabBarIcon: function(props) {
            return React.createElement(MaterialIcons, {
              name: 'home',
              size: 24,
              color: props.color
            });
          }
        }
      }),
      React.createElement(Tab.Screen, {
        name: 'Watchlist',
        component: WatchlistScreen,
        options: {
          tabBarIcon: function(props) {
            return React.createElement(MaterialIcons, {
              name: 'bookmark',
              size: 24,
              color: props.color
            });
          }
        }
      }),
      React.createElement(Tab.Screen, {
        name: 'Favorites',
        component: FavoritesScreen,
        options: {
          tabBarIcon: function(props) {
            return React.createElement(MaterialIcons, {
              name: 'favorite',
              size: 24,
              color: props.color
            });
          }
        }
      }),
      React.createElement(Tab.Screen, {
        name: 'Settings',
        component: SettingsScreen,
        options: {
          tabBarIcon: function(props) {
            return React.createElement(MaterialIcons, {
              name: 'settings',
              size: 24,
              color: props.color
            });
          }
        }
      })
    );
  };
  // @end:TabNavigator

  // @section:return @depends:[ThemeProvider,TabNavigator]
  return React.createElement(ThemeProvider, null,
    React.createElement(View, { 
      style: { flex: 1, width: '100%', height: '100%', overflow: 'hidden' },
      componentId: 'app-root'
    },
      React.createElement(TabNavigator)
    )
  );
  // @end:return
};
return ComponentFunction;