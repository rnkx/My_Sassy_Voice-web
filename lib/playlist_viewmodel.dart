import 'package:flutter/material.dart';
import 'package:audioplayers/audioplayers.dart';
import 'song_model.dart';
import 'dart:math';

// Enum to represent playback repeat modes: Off, repeat one song, or repeat all songs
enum PlaybackRepeatMode { off, one, all }

class PlaylistViewModel extends ChangeNotifier {
  // Audio player instance to handle playback
  final AudioPlayer _player = AudioPlayer();

  // Playlist containing Scott Joplin songs with metadata (title, artist, file path, album art)
  List<SongModel> playlist = [
    SongModel(
      title: "The Entertainer",
      artist: "Scott Joplin",
      url: "assets/audio/entertainer.mp3",
      albumArt: "assets/images/entertainer.png",
    ),
    SongModel(
      title: "Maple Leaf Rag",
      artist: "Scott Joplin",
      url: "assets/audio/maple_leaf_rag.mp3",
      albumArt: "assets/images/maple_leaf_rag.png",
    ),
    SongModel(
      title: "The Easy Winners",
      artist: "Scott Joplin",
      url: "assets/audio/easy_winners.mp3",
      albumArt: "assets/images/easy_winners.png",
    ),
    SongModel(
      title: "Pineapple Rag",
      artist: "Scott Joplin",
      url: "assets/audio/pineapple_rag.mp3",
      albumArt: "assets/images/pineapple_rag.png",
    ),
    SongModel(
      title: "Elite Syncopations",
      artist: "Scott Joplin",
      url: "assets/audio/elite_syncopations.mp3",
      albumArt: "assets/images/elite_syncopations.png",
    ),
    SongModel(
      title: "Searchlight Rag",
      artist: "Scott Joplin",
      url: "assets/audio/Searchlight_Rag.mp3",
      albumArt: "assets/images/searchlight_rag.png",
    ),
    SongModel(
      title: "Original Rags",
      artist: "Scott Joplin",
      url: "assets/audio/Original_Rags.mp3",
      albumArt: "assets/images/Original_Rags.png",
    ),
  ];

  // Playback state variables
  int _currentIndex = -1;                // -1 means no song selected
  bool _isPlaying = false;               // true if audio is currently playing
  Duration _duration = Duration.zero;    // total length of current track
  Duration _position = Duration.zero;    // current playback position
  bool _shuffle = false;                 // shuffle mode flag
  PlaybackRepeatMode _repeatMode = PlaybackRepeatMode.off; // repeat mode state

  // Public getters for UI access
  int get currentIndex => _currentIndex;
  bool get isPlaying => _isPlaying;
  Duration get duration => _duration;
  Duration get position => _position;
  bool get shuffle => _shuffle;
  PlaybackRepeatMode get repeatMode => _repeatMode;

  PlaylistViewModel() {
    // Listen for audio duration updates
    _player.onDurationChanged.listen((d) {
      _duration = d;
      notifyListeners(); // update UI
    });

    // Listen for playback position updates
    _player.onPositionChanged.listen((p) {
      _position = p;
      notifyListeners();
    });

    // Handle when a song finishes playing
    _player.onPlayerComplete.listen((_) {
      _handleSongCompletion();
    });
  }

  // Play a song at a given index
  Future<void> playSong(int index) async {
    _currentIndex = index;
    // AssetSource expects relative path (strip "assets/")
    final relativePath = playlist[index].url.replaceFirst('assets/', '');
    await _player.play(AssetSource(relativePath));
    _isPlaying = true;
    notifyListeners();
  }

  // Pause current song
  Future<void> pauseSong() async {
    await _player.pause();
    _isPlaying = false;
    notifyListeners();
  }

  // Resume paused song
  Future<void> resumeSong() async {
    await _player.resume();
    _isPlaying = true;
    notifyListeners();
  }

  // Stop playback and reset state
  Future<void> stopSong() async {
    await _player.stop();
    _isPlaying = false;
    _currentIndex = -1;
    _duration = Duration.zero;
    _position = Duration.zero;
    notifyListeners();
  }

  // Seek to a new position in the current track
  Future<void> seekTo(Duration newPosition) async {
    await _player.seek(newPosition);
  }

  // Toggle shuffle mode on/off
  void toggleShuffle() {
    _shuffle = !_shuffle;
    notifyListeners();
  }

  // Cycle repeat mode: Off → One → All → Off
  void cycleRepeatMode() {
    switch (_repeatMode) {
      case PlaybackRepeatMode.off:
      // Switch to repeat ONE (loop current song)
        _repeatMode = PlaybackRepeatMode.one;
        break;
      case PlaybackRepeatMode.one:
      // Switch to repeat ALL (loop through playlist)
        _repeatMode = PlaybackRepeatMode.all;
        break;
      case PlaybackRepeatMode.all:
      // Switch back to OFF (no repeat)
        _repeatMode = PlaybackRepeatMode.off;
        break;
    }
    notifyListeners(); // update UI icons/labels
  }

  // Handle what happens when a song finishes playing
  void _handleSongCompletion() {
    if (_repeatMode == PlaybackRepeatMode.one && _currentIndex != -1) {
      // Repeat the same song
      playSong(_currentIndex);

    } else if (_shuffle) {
      // Pick a random song if shuffle is enabled
      final randomIndex = Random().nextInt(playlist.length);
      playSong(randomIndex);

    } else if (_repeatMode == PlaybackRepeatMode.all) {
      // Move to next song in playlist
      // go back to first song after finish the last song
      final nextIndex = (_currentIndex + 1) % playlist.length;
      playSong(nextIndex);

    } else {
      // No repeat/shuffle → stop playback
      stopSong();
    }
  }
}
