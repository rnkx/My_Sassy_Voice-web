import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'playlist_viewmodel.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => PlaylistViewModel(),
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My Sassy Voice',
      theme: ThemeData(primarySwatch: Colors.deepPurple),
      home: const MenuScreen(), // Start with Menu Page
    );
  }
}

// Menu Page: central navigation hub
class MenuScreen extends StatelessWidget {
  const MenuScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Sassy Voice')),
      body: ListView(
        children: [
          ListTile(
            leading: const Icon(Icons.library_music),
            title: const Text('Playlist'),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PlaylistScreen()),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.play_circle),
            title: const Text('Now Playing'),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const PlayerScreen()),
              );
            },
          ),
          // Add more menu items here (Settings, About, etc.)
        ],
      ),
    );
  }
}

// Playlist view
class PlaylistScreen extends StatelessWidget {
  const PlaylistScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final vm = Provider.of<PlaylistViewModel>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('My Sassy Voice Playlist')),
      body: ListView.builder(
        itemCount: vm.playlist.length,
        itemBuilder: (context, index) {
          final song = vm.playlist[index];
          return ListTile(
            leading: ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: Image.asset(song.albumArt,
                  width: 60, height: 60, fit: BoxFit.cover),
            ),
            title: Text(song.title,
                style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text(song.artist),
            trailing: IconButton(
              icon: Icon(
                vm.currentIndex == index && vm.isPlaying
                    ? Icons.pause_circle_filled
                    : Icons.play_circle_fill,
                color: Colors.deepPurple,
              ),
              onPressed: () {
                if (vm.currentIndex == index && vm.isPlaying) {
                  vm.pauseSong();
                } else {
                  vm.playSong(index);
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const PlayerScreen()),
                  );
                }
              },
            ),
          );
        },
      ),
    );
  }
}

// Player view
class PlayerScreen extends StatelessWidget {
  const PlayerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final vm = Provider.of<PlaylistViewModel>(context);

    if (vm.currentIndex == -1) {
      return Scaffold(
        appBar: AppBar(title: const Text('Now Playing')),
        body: const Center(child: Text('No song selected')),
      );
    }

    final song = vm.playlist[vm.currentIndex];

    return Scaffold(
      appBar: AppBar(title: const Text('Now Playing')),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.asset(song.albumArt,
                width: 250, height: 250, fit: BoxFit.cover),
          ),
          const SizedBox(height: 20),
          Text(song.title,
              style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
          Text(song.artist,
              style: const TextStyle(
                  fontSize: 18, color: Colors.grey, fontStyle: FontStyle.italic)),
          const SizedBox(height: 20),
          Slider(
            min: 0,
            max: vm.duration.inSeconds.toDouble(),
            value: vm.position.inSeconds
                .toDouble()
                .clamp(0, vm.duration.inSeconds.toDouble()),
            activeColor: Colors.deepPurple,
            inactiveColor: Colors.grey.shade400,
            onChanged: (value) {
              vm.seekTo(Duration(seconds: value.toInt()));
            },
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(_formatDuration(vm.position)),
              Text(_formatDuration(vm.duration)),
            ],
          ),
          const SizedBox(height: 20),
          // Playback controls row
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                iconSize: 40,
                icon: const Icon(Icons.skip_previous),
                onPressed: () {
                  if (vm.currentIndex > 0) {
                    vm.playSong(vm.currentIndex - 1);
                  }
                },
              ),
              IconButton(
                iconSize: 60,
                icon: Icon(vm.isPlaying ? Icons.pause_circle : Icons.play_circle),
                color: Colors.deepPurple,
                onPressed: () {
                  vm.isPlaying ? vm.pauseSong() : vm.resumeSong();
                },
              ),
              IconButton(
                iconSize: 40,
                icon: const Icon(Icons.skip_next),
                onPressed: () {
                  if (vm.currentIndex < vm.playlist.length - 1) {
                    vm.playSong(vm.currentIndex + 1);
                  }
                },
              ),
            ],
          ),

          const SizedBox(height: 20),

// Extra controls row: Shuffle, Repeat, Stop
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Shuffle toggle
              IconButton(
                icon: Icon(
                  vm.shuffle ? Icons.shuffle_on : Icons.shuffle,
                  color: vm.shuffle ? Colors.deepPurple : Colors.grey,
                ),
                onPressed: vm.toggleShuffle,
              ),

              // Repeat mode cycle
              IconButton(
                icon: Icon(
                  vm.repeatMode == PlaybackRepeatMode.off
                      ? Icons.repeat
                      : vm.repeatMode == PlaybackRepeatMode.one
                      ? Icons.repeat_one
                      : Icons.repeat,
                  color: vm.repeatMode == PlaybackRepeatMode.off
                      ? Colors.grey
                      : Colors.deepPurple,
                ),
                onPressed: vm.cycleRepeatMode,
              ),

              // Stop button
              IconButton(
                icon: const Icon(Icons.stop_circle),
                color: Colors.redAccent,
                onPressed: vm.stopSong,
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatDuration(Duration d) {
    final minutes = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }
}
