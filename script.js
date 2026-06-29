// ===============================
// My Sassy Voice - script.js
// ===============================

// Song list
const playlist = [
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
];

// Default player state
let currentSongIndex = null;
let shuffleEnabled = false;
let repeatMode = "off"; // off, one, all

// HTML elements
const menuPage = document.getElementById("menuPage");
const playlistPage = document.getElementById("playlistPage");
const playerPage = document.getElementById("playerPage");

const playlistContainer = document.getElementById("playlist");
const audio = document.getElementById("audio");

const albumArt = document.getElementById("albumArt");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const progress = document.getElementById("progress");
const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const playBtn = document.getElementById("playBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");

const miniPlayer = document.getElementById("miniPlayer");
const miniTitle = document.getElementById("miniTitle");
const miniArtist = document.getElementById("miniArtist");
const miniPlayBtn = document.getElementById("miniPlayBtn");

// ===============================
// Page Navigation
// ===============================

function showPage(pageName) {
  if (!menuPage || !playlistPage || !playerPage) return;

  menuPage.classList.remove("active");
  playlistPage.classList.remove("active");
  playerPage.classList.remove("active");

  if (pageName === "menu") {
    menuPage.classList.add("active");
  } else if (pageName === "playlist") {
    playlistPage.classList.add("active");
  } else {
    playerPage.classList.add("active");
  }

  updateMiniPlayer();
}

// Optional compatibility for old buttons
function goMenu() {
  if (menuPage) {
    showPage("menu");
  } else {
    window.location.href = "menu.html";
  }
}

function goPlaylist() {
  if (playlistPage) {
    showPage("playlist");
  } else {
    window.location.href = "playlist.html";
  }
}

function goPlayer() {
  if (playerPage) {
    showPage("player");
  } else {
    window.location.href = "player.html";
  }
}

// ===============================
// Playlist
// ===============================

function loadPlaylist() {
  if (!playlistContainer) return;

  playlistContainer.innerHTML = "";

  playlist.forEach((song, index) => {
    playlistContainer.innerHTML += `
      <div class="song" onclick="selectSong(${index})">
        <img src="${song.albumArt}" alt="${song.title}">
        <div>
          <h2>${song.title}</h2>
          <p>${song.artist}</p>
        </div>
      </div>
    `;
  });
}

function selectSong(index) {
  playSong(index);

  if (playerPage) {
    showPage("player");
  } else {
    window.location.href = "player.html";
  }
}

// ===============================
// Player
// ===============================

function playSong(index) {
  if (!audio) return;

  currentSongIndex = index;

  const song = playlist[currentSongIndex];

  audio.src = song.url;
  audio.currentTime = 0;
  audio.play();

  if (albumArt) {
    albumArt.src = song.albumArt;
    albumArt.alt = song.title;
    albumArt.style.display = "block";
  }

  if (title) title.textContent = song.title;
  if (artist) artist.textContent = song.artist;

  if (playBtn) playBtn.textContent = "⏸";
  if (miniPlayBtn) miniPlayBtn.textContent = "⏸";

  saveState();
  updateMiniPlayer();
}

function togglePlay() {
  if (!audio) return;

  // If no song is selected, play the first song
  if (currentSongIndex === null) {
    playSong(0);
    return;
  }

  if (audio.paused) {
    audio.play();
    if (playBtn) playBtn.textContent = "⏸";
    if (miniPlayBtn) miniPlayBtn.textContent = "⏸";
  } else {
    audio.pause();
    if (playBtn) playBtn.textContent = "▶";
    if (miniPlayBtn) miniPlayBtn.textContent = "▶";
  }

  saveState();
  updateMiniPlayer();
}

function previousSong() {
  if (currentSongIndex === null) {
    playSong(0);
    return;
  }

  currentSongIndex--;

  if (currentSongIndex < 0) {
    currentSongIndex = playlist.length - 1;
  }

  playSong(currentSongIndex);
}

function nextSong() {
  if (currentSongIndex === null) {
    playSong(0);
    return;
  }

  if (shuffleEnabled) {
    currentSongIndex = getRandomSongIndex();
  } else {
    currentSongIndex++;

    if (currentSongIndex >= playlist.length) {
      currentSongIndex = 0;
    }
  }

  playSong(currentSongIndex);
}

function stopSong() {
  if (!audio) return;

  audio.pause();
  audio.currentTime = 0;
  audio.removeAttribute("src");
  audio.load();

  currentSongIndex = null;

  localStorage.removeItem("selectedSong");
  localStorage.removeItem("currentTime");
  localStorage.removeItem("isPlaying");

  showNoSongSelected();
  updateMiniPlayer();
}

function showNoSongSelected() {
  if (albumArt) {
    albumArt.src = "";
    albumArt.alt = "";
    albumArt.style.display = "none";
  }

  if (title) title.textContent = "No song selected";
  if (artist) artist.textContent = "";

  if (progress) {
    progress.value = 0;
    progress.max = 0;
  }

  if (currentTime) currentTime.textContent = "00:00";
  if (duration) duration.textContent = "00:00";

  if (playBtn) playBtn.textContent = "▶";
  if (miniPlayBtn) miniPlayBtn.textContent = "▶";
}

// ===============================
// Shuffle and Repeat
// ===============================

function setControlButtonsDefault() {
  if (shuffleBtn) shuffleBtn.style.opacity = "0.4";
  if (repeatBtn) {
    repeatBtn.textContent = "🔁";
    repeatBtn.style.opacity = "0.4";
  }
}

function toggleShuffle() {
  shuffleEnabled = !shuffleEnabled;

  if (shuffleBtn) {
    shuffleBtn.style.opacity = shuffleEnabled ? "1" : "0.4";
  }
}

function cycleRepeat() {
  if (!repeatBtn) return;

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
// Mini Now Playing Bar
// ===============================

function updateMiniPlayer() {
  if (!miniPlayer) return;

  if (currentSongIndex === null) {
    miniPlayer.style.display = "none";
    return;
  }

  const song = playlist[currentSongIndex];

  if (miniTitle) miniTitle.textContent = `🎵 ${song.title}`;
  if (miniArtist) miniArtist.textContent = song.artist;
  if (miniPlayBtn) miniPlayBtn.textContent = audio && audio.paused ? "▶" : "⏸";

  // Show mini player on menu and playlist, hide it on full player
  if (
    (menuPage && menuPage.classList.contains("active")) ||
    (playlistPage && playlistPage.classList.contains("active")) ||
    (!playerPage && !audio)
  ) {
    miniPlayer.style.display = "flex";
  } else if (!playerPage) {
    miniPlayer.style.display = "flex";
  } else {
    miniPlayer.style.display = "none";
  }
}

// ===============================
// Progress and Time
// ===============================

if (audio) {
  audio.addEventListener("timeupdate", () => {
    updateTimeDisplay();
    saveState();
  });

  audio.addEventListener("loadedmetadata", () => {
    updateTimeDisplay();
  });

  audio.addEventListener("ended", () => {
    if (currentSongIndex === null) return;

    if (repeatMode === "one") {
      playSong(currentSongIndex);
    } else if (shuffleEnabled) {
      playSong(getRandomSongIndex());
    } else if (repeatMode === "all") {
      nextSong();
    } else {
      // Repeat is off and shuffle is off:
      // stop automatically and show "No song selected"
      stopSong();
    }
  });
}

if (progress) {
  progress.addEventListener("input", () => {
    if (!audio || currentSongIndex === null) return;

    audio.currentTime = progress.value;
    saveState();
  });
}

function updateTimeDisplay() {
  if (!audio || !progress || !currentTime || !duration) return;

  progress.max = audio.duration || 0;
  progress.value = audio.currentTime || 0;

  currentTime.textContent = formatTime(audio.currentTime);
  duration.textContent = formatTime(audio.duration);
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

// ===============================
// Save and Restore State
// ===============================

function saveState() {
  if (!audio || currentSongIndex === null) return;

  localStorage.setItem("selectedSong", currentSongIndex);
  localStorage.setItem("currentTime", audio.currentTime || 0);
  localStorage.setItem("isPlaying", audio.paused ? "false" : "true");
}

function restoreState() {
  if (!audio) {
    loadMiniPlayerOnly();
    return;
  }

  const savedSong = localStorage.getItem("selectedSong");

  if (savedSong === null) {
    showNoSongSelected();
    return;
  }

  currentSongIndex = Number(savedSong);
  const song = playlist[currentSongIndex];

  audio.src = song.url;

  if (albumArt) {
    albumArt.src = song.albumArt;
    albumArt.alt = song.title;
    albumArt.style.display = "block";
  }

  if (title) title.textContent = song.title;
  if (artist) artist.textContent = song.artist;

  audio.addEventListener("loadedmetadata", () => {
    const savedTime = Number(localStorage.getItem("currentTime")) || 0;

    if (savedTime < audio.duration) {
      audio.currentTime = savedTime;
    }

    updateTimeDisplay();

    if (localStorage.getItem("isPlaying") === "true") {
      audio.play();
      if (playBtn) playBtn.textContent = "⏸";
      if (miniPlayBtn) miniPlayBtn.textContent = "⏸";
    } else {
      if (playBtn) playBtn.textContent = "▶";
      if (miniPlayBtn) miniPlayBtn.textContent = "▶";
    }

    updateMiniPlayer();
  }, { once: true });
}

function loadMiniPlayerOnly() {
  if (!miniPlayer || !miniTitle || !miniArtist) return;

  const savedSong = localStorage.getItem("selectedSong");
  const isPlaying = localStorage.getItem("isPlaying");

  if (savedSong === null || isPlaying !== "true") {
    miniPlayer.style.display = "none";
    return;
  }

  const song = playlist[Number(savedSong)];

  miniTitle.textContent = `🎵 ${song.title}`;
  miniArtist.textContent = song.artist;
  miniPlayer.style.display = "flex";
}

// ===============================
// Helper
// ===============================

function getRandomSongIndex() {
  if (playlist.length <= 1) {
    return currentSongIndex;
  }

  let randomIndex;

  do {
    randomIndex = Math.floor(Math.random() * playlist.length);
  } while (randomIndex === currentSongIndex);

  return randomIndex;
}

// ===============================
// Start App
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  loadPlaylist();
  setControlButtonsDefault();
  restoreState();

  if (menuPage && playlistPage && playerPage) {
    const firstPage = sessionStorage.getItem("firstPage") || "menu";
    sessionStorage.removeItem("firstPage");
    showPage(firstPage);
  }

  updateMiniPlayer();
});
