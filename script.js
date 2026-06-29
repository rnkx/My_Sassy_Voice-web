console.log("script.js loaded");

// ===============================
// PLAYLIST DATA
// ===============================

const playlists = {
  prayer: [
    {
      title: "Amazing Grace",
      artist: "Prayer",
      url: "assets/audio/Amazing_Grace.mp3",
      albumArt: "assets/images/Amazing_Grace.png"
    },
    {
      title: "Furusato",
      artist: "Prayer",
      url: "assets/audio/Furusato.mp3",
      albumArt: "assets/images/Furusato.png"
    }
  ],

  scott: [
    {
      title: "The Entertainer",
      artist: "Scott Joplin",
      url: "assets/audio/entertainer.mp3",
      albumArt: "assets/images/entertainer.png"
    },
    {
      title: "Maple Leaf Rag",
      artist: "Scott Joplin",
      url: "assets/audio/maple_leaf_rag.mp3",
      albumArt: "assets/images/maple_leaf_rag.png"
    },
    {
      title: "The Easy Winners",
      artist: "Scott Joplin",
      url: "assets/audio/easy_winners.mp3",
      albumArt: "assets/images/easy_winners.png"
    },
    {
      title: "Pineapple Rag",
      artist: "Scott Joplin",
      url: "assets/audio/pineapple_rag.mp3",
      albumArt: "assets/images/pineapple_rag.png"
    },
    {
      title: "Elite Syncopations",
      artist: "Scott Joplin",
      url: "assets/audio/elite_syncopations.mp3",
      albumArt: "assets/images/elite_syncopations.png"
    },
    {
      title: "Searchlight Rag",
      artist: "Scott Joplin",
      url: "assets/audio/Searchlight_Rag.mp3",
      albumArt: "assets/images/searchlight_rag.png"
    },
    {
      title: "Original Rags",
      artist: "Scott Joplin",
      url: "assets/audio/Original_Rags.mp3",
      albumArt: "assets/images/Original_Rags.png"
    }
  ]
};

const allSongs = [
  ...playlists.prayer,
  ...playlists.scott
];

// ===============================
// PLAYER STATE
// ===============================

// viewingPlaylist = playlist currently shown on playlist page
// playingPlaylist = playlist currently playing in audio player
let viewingPlaylist = "prayer";
let playingPlaylist = "prayer";

let currentSongIndex = null;
let shuffleEnabled = false;
let repeatMode = "off";

// ===============================
// SHORTCUT
// ===============================

function $(id) {
  return document.getElementById(id);
}

function getActiveList() {
  if (playingPlaylist === "all") {
    return allSongs;
  }

  return playlists[playingPlaylist];
}

function getCurrentSong() {
  if (currentSongIndex === null) {
    return null;
  }

  return getActiveList()[currentSongIndex];
}

// ===============================
// PAGE NAVIGATION
// ===============================

function showPage(pageName) {
  $("menuPage").classList.remove("active");
  $("playlistPage").classList.remove("active");
  $("playerPage").classList.remove("active");

  if (pageName === "menu") {
    $("menuPage").classList.add("active");
  }

  if (pageName === "playlist") {
    $("playlistPage").classList.add("active");
  }

  if (pageName === "player") {
    $("playerPage").classList.add("active");
  }

  updateMiniPlayer();
}

// ===============================
// PLAYLIST PAGE
// ===============================

function openPlaylist(playlistName) {
  viewingPlaylist = playlistName;

  $("playlistMenu").style.display = "none";
  $("playlistSongs").style.display = "block";

  $("playlistTitle").textContent =
    playlistName === "prayer"
      ? "🙏 Prayer Playlist"
      : "🎹 Scott Joplin Playlist";

  loadPlaylistSongs();
}

function backToPlaylists() {
  $("playlistSongs").style.display = "none";
  $("playlistMenu").style.display = "flex";
}

function loadPlaylistSongs() {
  const playlistBox = $("playlist");
  playlistBox.innerHTML = "";

  playlists[viewingPlaylist].forEach(function (song, index) {
    const songButton = document.createElement("button");
    songButton.type = "button";
    songButton.className = "song";

    songButton.innerHTML = `
      <img src="${song.albumArt}" alt="${song.title}">
      <div class="song-info">
        <h2>${song.title}</h2>
        <p>${song.artist}</p>
      </div>
    `;

    songButton.addEventListener("click", function () {
      playingPlaylist = viewingPlaylist;
      playSong(index);
      showPage("player");
    });

    playlistBox.appendChild(songButton);
  });
}

// ===============================
// PLAYER FUNCTIONS
// ===============================

function playSong(index) {
  currentSongIndex = index;

  const song = getCurrentSong();
  const audio = $("audio");

  if (!song) {
    showNoSongSelected();
    return;
  }

  audio.src = song.url;
  audio.currentTime = 0;

  audio.play().catch(function () {
    console.log("Audio play blocked until user interaction.");
  });

  updatePlayerDisplay(song, true);
  saveState();
  updateMiniPlayer();
}

function playAllSong(index) {
  playingPlaylist = "all";
  currentSongIndex = index;
  playSong(currentSongIndex);
}

function togglePlay() {
  const audio = $("audio");

  if (currentSongIndex === null) {
    playAllSong(0);
    return;
  }

  if (audio.paused) {
    audio.play().catch(function () {
      console.log("Audio play blocked.");
    });

    $("playBtn").textContent = "⏸";
    $("miniPlayBtn").textContent = "⏸";
  } else {
    audio.pause();

    $("playBtn").textContent = "▶";
    $("miniPlayBtn").textContent = "▶";
  }

  saveState();
  updateMiniPlayer();
}

function previousSong() {
  const list = getActiveList();

  if (currentSongIndex === null) {
    playAllSong(0);
    return;
  }

  currentSongIndex--;

  if (currentSongIndex < 0) {
    currentSongIndex = list.length - 1;
  }

  playSong(currentSongIndex);
}

function nextSong() {
  const list = getActiveList();

  if (currentSongIndex === null) {
    playAllSong(0);
    return;
  }

  if (shuffleEnabled) {
    currentSongIndex = getRandomSongIndex();
  } else {
    currentSongIndex++;

    if (currentSongIndex >= list.length) {
      currentSongIndex = 0;
    }
  }

  playSong(currentSongIndex);
}

function stopSong() {
  const audio = $("audio");

  audio.pause();
  audio.currentTime = 0;
  audio.removeAttribute("src");
  audio.load();

  currentSongIndex = null;

  localStorage.removeItem("playingPlaylist");
  localStorage.removeItem("viewingPlaylist");
  localStorage.removeItem("selectedSong");
  localStorage.removeItem("currentTime");
  localStorage.removeItem("isPlaying");

  showNoSongSelected();
  updateMiniPlayer();
}

function updatePlayerDisplay(song, playing) {
  $("albumArt").src = song.albumArt;
  $("albumArt").alt = song.title;
  $("albumArt").style.display = "block";

  $("title").textContent = song.title;
  $("artist").textContent = song.artist;

  $("playBtn").textContent = playing ? "⏸" : "▶";
  $("miniPlayBtn").textContent = playing ? "⏸" : "▶";
}

function showNoSongSelected() {
  $("albumArt").src = "";
  $("albumArt").alt = "";
  $("albumArt").style.display = "none";

  $("title").textContent = "No song selected";
  $("artist").textContent = "";

  $("progress").value = 0;
  $("progress").max = 0;

  $("currentTime").textContent = "00:00";
  $("duration").textContent = "00:00";

  $("playBtn").textContent = "▶";
  $("miniPlayBtn").textContent = "▶";
}

// ===============================
// SHUFFLE AND REPEAT
// ===============================

function toggleShuffle() {
  shuffleEnabled = !shuffleEnabled;
  $("shuffleBtn").style.opacity = shuffleEnabled ? "1" : "0.4";
}

function cycleRepeat() {
  const repeatBtn = $("repeatBtn");

  if (repeatMode === "off") {
    repeatMode = "one";
    repeatBtn.textContent = "🔂";
    repeatBtn.style.opacity = "1";
  } else if (repeatMode === "one") {
    repeatMode = "all";
    repeatBtn.textContent = "🔁";
    repeatBtn.style.opacity = "1";
  } else {
    repeatMode = "off";
    repeatBtn.textContent = "🔁";
    repeatBtn.style.opacity = "0.4";
  }
}

// ===============================
// MINI PLAYER
// ===============================

function updateMiniPlayer() {
  const song = getCurrentSong();

  if (!song) {
    $("miniPlayer").style.display = "none";
    return;
  }

  const audio = $("audio");

  $("miniTitle").textContent = `🎵 ${song.title}`;
  $("miniArtist").textContent = song.artist;
  $("miniPlayBtn").textContent = audio.paused ? "▶" : "⏸";

  if (
    $("menuPage").classList.contains("active") ||
    $("playlistPage").classList.contains("active")
  ) {
    $("miniPlayer").style.display = "flex";
  } else {
    $("miniPlayer").style.display = "none";
  }
}

// ===============================
// TIME AND PROGRESS
// ===============================

function updateTimeDisplay() {
  const audio = $("audio");
  const progress = $("progress");

  progress.max = audio.duration || 0;
  progress.value = audio.currentTime || 0;

  $("currentTime").textContent = formatTime(audio.currentTime);
  $("duration").textContent = formatTime(audio.duration);
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function getRandomSongIndex() {
  const list = getActiveList();

  if (list.length <= 1) {
    return currentSongIndex;
  }

  let randomIndex;

  do {
    randomIndex = Math.floor(Math.random() * list.length);
  } while (randomIndex === currentSongIndex);

  return randomIndex;
}

// ===============================
// SAVE AND RESTORE
// ===============================

function saveState() {
  if (currentSongIndex === null) return;

  const audio = $("audio");

  localStorage.setItem("playingPlaylist", playingPlaylist);
  localStorage.setItem("viewingPlaylist", viewingPlaylist);
  localStorage.setItem("selectedSong", currentSongIndex);
  localStorage.setItem("currentTime", audio.currentTime || 0);
  localStorage.setItem("isPlaying", audio.paused ? "false" : "true");
}

function restoreState() {
  const savedPlayingPlaylist = localStorage.getItem("playingPlaylist");
  const savedViewingPlaylist = localStorage.getItem("viewingPlaylist");
  const savedSong = localStorage.getItem("selectedSong");

  if (savedPlayingPlaylist === null || savedSong === null) {
    showNoSongSelected();
    return;
  }

  playingPlaylist = savedPlayingPlaylist;
  viewingPlaylist = savedViewingPlaylist || "prayer";
  currentSongIndex = Number(savedSong);

  const song = getCurrentSong();

  if (!song) {
    showNoSongSelected();
    return;
  }

  $("audio").src = song.url;
  updatePlayerDisplay(song, false);

  $("audio").addEventListener(
    "loadedmetadata",
    function () {
      const savedTime = Number(localStorage.getItem("currentTime")) || 0;

      if (savedTime < $("audio").duration) {
        $("audio").currentTime = savedTime;
      }

      updateTimeDisplay();
    },
    { once: true }
  );
}

// ===============================
// BUTTON EVENTS
// ===============================

function attachEvents() {
  $("playlistButton").addEventListener("click", function () {
    showPage("playlist");
  });

  $("nowPlayingButton").addEventListener("click", function () {
    showPage("player");
  });

  $("backMenuBtn").addEventListener("click", function () {
    showPage("menu");
  });

  $("backPlaylistBtn").addEventListener("click", backToPlaylists);

  $("backToPlaylistBtn").addEventListener("click", function () {
    showPage("playlist");
  });

  document.querySelectorAll(".playlist-card").forEach(function (card) {
    card.addEventListener("click", function () {
      openPlaylist(card.dataset.playlist);
    });
  });

  $("prevBtn").addEventListener("click", previousSong);
  $("playBtn").addEventListener("click", togglePlay);
  $("nextBtn").addEventListener("click", nextSong);
  $("shuffleBtn").addEventListener("click", toggleShuffle);
  $("repeatBtn").addEventListener("click", cycleRepeat);
  $("stopBtn").addEventListener("click", stopSong);

  $("miniPlayBtn").addEventListener("click", togglePlay);
  $("miniNowPlayingBtn").addEventListener("click", function () {
    showPage("player");
  });

  $("audio").addEventListener("timeupdate", function () {
    updateTimeDisplay();
    saveState();
  });

  $("audio").addEventListener("loadedmetadata", updateTimeDisplay);

  $("audio").addEventListener("ended", function () {
    if (currentSongIndex === null) return;

    if (repeatMode === "one") {
      playSong(currentSongIndex);
    } else if (shuffleEnabled) {
      playSong(getRandomSongIndex());
    } else if (repeatMode === "all") {
      nextSong();
    } else {
      stopSong();
    }
  });

  $("progress").addEventListener("input", function () {
    if (currentSongIndex !== null) {
      $("audio").currentTime = $("progress").value;
    }
  });
}

// ===============================
// START APP
// ===============================

document.addEventListener("DOMContentLoaded", function () {
  attachEvents();

  $("shuffleBtn").style.opacity = "0.4";
  $("repeatBtn").style.opacity = "0.4";

  restoreState();
  showPage("menu");
});