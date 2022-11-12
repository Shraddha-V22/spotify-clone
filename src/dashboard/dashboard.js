import {
  fetchRequest,
  getItemInLocalStorage,
  setItemInLocalStorage,
} from "../api";
import { ENDPOINT, LOADED_TRACK, logout, SECTION_TYPE } from "../common";
let displayName;
const audio = new Audio();

const onProfileClick = (event) => {
  event.stopPropagation();
  const menuList = document.getElementById("menu-list");
  menuList.classList.toggle("hidden");

  if (!menuList.classList.contains("hidden")) {
    menuList.querySelector("li#logout").addEventListener("click", () => {
      logout();
    });
  }
};

const loadUserProfile = async () => {
  return new Promise(async (resolve, reject) => {
    const defaultImage = document.getElementById("default-image");
    const displayNameEl = document.getElementById("display-username");
    const profileBtn = document.getElementById("user-profile-btn");

    const { display_name: displayName, images } = await fetchRequest(
      ENDPOINT.profileUrl
    );

    displayNameEl.textContent = displayName;

    if (images?.length) {
      defaultImage.classList.add("hidden");
    } else {
      defaultImage.classList.remove("hidden");
    }

    profileBtn.addEventListener("click", onProfileClick);
    resolve({ displayName });
  });
};

const onPlaylistItemClick = (event, id) => {
  console.log(event.target);
  const section = { type: SECTION_TYPE.PLAYLIST, playlist: id };
  history.pushState(section, "", `playlist/${id}`);
  loadSection(section);
};

const loadPlaylist = async (endpoint, elementId) => {
  const {
    playlists: { items },
  } = await fetchRequest(endpoint);
  const featuredPlaylistAlbums = document.getElementById(elementId);

  for (let { name, description, images, id } of items) {
    const playlistItem = document.createElement("section");
    playlistItem.classList =
      "bg-black-secondary rounded p-4 hover:cursor-pointer hover:bg-light-black";
    playlistItem.id = id;
    playlistItem.setAttribute("data-type", "playlist");
    playlistItem.addEventListener("click", (event) =>
      onPlaylistItemClick(event, id)
    );
    const [{ url: imageUrl }] = images;
    playlistItem.innerHTML = `<img
      class="w-[100%] rounded mb-2 object-contain shadow"
      src=${imageUrl}
      alt="${name}"
    />
    <h2 class="text-base font-semibold mb-4 truncate">${name}</h2>
    <h3 class="text-sm text-secondary line-clamp-2">${description}</h3>`;
    featuredPlaylistAlbums.appendChild(playlistItem);
  }
};

const loadPlaylists = () => {
  loadPlaylist(ENDPOINT.featuredPlaylist, "featured-playlist-items");
  loadPlaylist(ENDPOINT.topPlaylists, "top-playlist-items");
};

const fillContentForDashboard = () => {
  const coverContent = document.querySelector("#cover-content");
  coverContent.innerHTML = `<h1 class="text-6xl">Hello ${displayName}</h1>`;
  const pageContent = document.querySelector("#page-content");
  const playlistMap = new Map([
    ["featured", "featured-playlist-items"],
    ["top playlists", "top-playlist-items"],
  ]);
  let innerHTML = "";
  for (let [type, id] of playlistMap) {
    innerHTML += `<article class="p-4">
    <h1 class="mb-4 text-2xl font-bold capitalize">${type}</h1>
    <section
      id="${id}"
      class="featured-songs my-4 grid grid-cols-auto-fill-cols gap-4"
    ></section>
  </article>`;
  }
  pageContent.innerHTML = innerHTML;
};

const formatTime = (duration) => {
  const min = Math.floor(duration / 60_000);
  const sec = ((duration % 6_000) / 1000).toFixed(0);
  const formattedTime =
    sec == 60 ? min + 1 + ":00" : min + ":" + (sec < 10 ? "0" : "") + sec;
  return formattedTime;
};

const onSelectTrack = (id, event) => {
  document.querySelectorAll("#tracks .track").forEach((trackItem) => {
    if (trackItem.id === id) {
      trackItem.classList.add("bg-gray", "selected");
    } else {
      trackItem.classList.remove("bg-gray", "selected");
    }
  });
};

const updateIconsForPlayMode = (id) => {
  const playButton = document.querySelector("#play");
  playButton.querySelector("span").textContent = "pause_circle";
  const playButtonInTracks = document.querySelector(`#play-track-${id}`);
  if (playButtonInTracks) {
    playButtonInTracks.textContent = "pause";
  }
};

const updateIconsForPauseMode = (id) => {
  const playButton = document.querySelector("#play");
  playButton.querySelector("span").textContent = "play_circle";
  const playButtonInTracks = document.querySelector(`#play-track-${id}`);
  if (playButtonInTracks) {
    playButtonInTracks.textContent = "play_arrow";
  }
};

const onAudioMetaDataLoaded = () => {
  const totalSongDuration = document.querySelector("#total-song-duration");
  totalSongDuration.textContent = `0:${audio.duration.toFixed(0)}`;
};

const findCurrentTrack = () => {
  const audioControl = document.querySelector("#audio-control");
  const trackId = audioControl.getAttribute("data-track-id");
  if (trackId) {
    const loadedTracks = getItemInLocalStorage(LOADED_TRACK);
    const currentTrackIndex = loadedTracks?.findIndex(
      (trk) => trk.id === trackId
    );
    return { currentTrackIndex, tracks: loadedTracks };
  }
  return null;
};
const playNextTrack = () => {
  const { currentTrackIndex = -1, tracks = null } = findCurrentTrack() ?? {};
  if (currentTrackIndex > -1 && currentTrackIndex < tracks?.length - 1) {
    playTrack(null, tracks[currentTrackIndex + 1]);
  }
};
const playPrevTrack = () => {
  const { currentTrackIndex = -1, tracks = null } = findCurrentTrack() ?? {};
  if (currentTrackIndex > 0) {
    playTrack(null, tracks[currentTrackIndex - 1]);
  }
};

const togglePlay = () => {
  if (audio.src) {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }
};

const playTrack = (
  event,
  { image, artistNames, name, duration, previewUrl, id }
) => {
  console.log({ image, artistNames, name, duration, previewUrl, id });

  if (event?.stopPropagation) {
    event.stopPropagation();
  }
  if (audio.src === previewUrl) {
    togglePlay();
  } else {
    const nowPlayingImage = document.querySelector("#now-playing-image");
    const songTitle = document.querySelector("#now-playing-song");
    const artists = document.querySelector("#now-playing-artists");
    const audioControl = document.querySelector("#audio-control");
    const songInfo = document.querySelector("#song-info");

    audioControl.setAttribute("data-track-id", id);
    nowPlayingImage.src = image.url;
    songTitle.textContent = name;
    artists.textContent = artistNames;
    audio.src = previewUrl;
    songInfo.classList.remove("invisible");

    audio.play();
  }
};

const loadPlaylistTracks = ({ tracks }) => {
  const trackSection = document.querySelector("#tracks");
  let trackNum = 1;
  let loadedTracks = [];
  for (let trackItem of tracks.items.filter((item) => item.track.preview_url)) {
    let {
      id,
      artists,
      name,
      album,
      duration_ms: duration,
      preview_url: previewUrl,
    } = trackItem.track;

    let track = document.createElement("section");
    track.classList =
      "track p-1 grid grid-cols-[50px_2fr_1fr_50px] items-center justify-items-start gap-4 rounded-md text-secondary hover:bg-light-black";
    track.id = id;
    let image = album.images.find((img) => img.height === 64);
    let artistNames = Array.from(artists, (artist) => artist.name).join(", ");
    track.innerHTML = `
    <p class="relative w-full flex items-center justify-center justify-self-center"><span class="track-no">${trackNum++}</span></p>
    <section class="grid grid-cols-[auto_1fr] place-items-center gap-2">
      <img class="h-10 w-10" src="${image.url}" alt="${name}" />
      <article class="flex flex-col gap-2 justify-center">
        <p class="song-title text-base text-primary line-clamp-1">${name}</p>
        <p class="text-xs line-clamp-1">${artistNames}</p>
      </article>
    </section>
    <p class="text-sm line-clamp-1">${album.name}</p>
    <p class="text-sm">${formatTime(duration)}</p>`;

    track.addEventListener("click", (event) => onSelectTrack(id, event));
    const playButton = document.createElement("button");
    playButton.id = `play-track-${id}`;
    playButton.className =
      "play w-full absolute left-0 text-lg invisible material-symbols-outlined";
    playButton.innerHTML = "play_arrow";
    playButton.addEventListener("click", (event) =>
      playTrack(event, { image, artistNames, name, duration, previewUrl, id })
    );
    track.querySelector("p").appendChild(playButton);

    trackSection.appendChild(track);
    loadedTracks.push({
      id,
      artistNames,
      name,
      duration,
      previewUrl,
      image,
      album,
    });
  }
  setItemInLocalStorage(LOADED_TRACK, loadedTracks);
};

const fillContentForPlaylist = async (playlistId) => {
  const playlist = await fetchRequest(`${ENDPOINT.playlist}/${playlistId}`);
  const coverElement = document.querySelector("#cover-content");
  const { name, images, tracks } = playlist;
  coverElement.innerHTML = `
  <img class="h-36 w-36 object-contain" src="${images[0].url}" alt="" />
  <section>
    <h1 id="playlist-name" class="text-5xl">${name}</h1>
    <p id="playlist-details">${tracks.items.length} songs</p>
  </section>`;
  const pageContent = document.querySelector("#page-content");
  pageContent.innerHTML = `  <header id="playlist-header" class="border-secondary border-b-[0.5px] mx-8 z-10">
  <nav>
    <ul 
      class="py-2 grid grid-cols-[50px_2fr_1fr_50px] gap-4 text-secondary"
    >
      <li class="justify-self-center">#</li>
      <li>title</li>
      <li>album</li>
      <li>🕒</li>
    </ul>
  </nav>
</header>
<section class="px-8 text-secondary mt-4" id="tracks"></section>`;
  console.log(playlist);
  loadPlaylistTracks(playlist);
};

const onScrollSticky = (event) => {
  const { scrollTop } = event.target;
  const header = document.querySelector(".header");
  const coverContent = document.querySelector("#cover-content");

  const totalHeight = coverContent.offsetHeight;
  const coverOpacity =
    100 - (scrollTop >= totalHeight ? 100 : (scrollTop / totalHeight) * 100);
  const headerOpacity =
    scrollTop >= header.offsetHeight
      ? 100
      : (scrollTop / header.offsetHeight) * 100;
  coverContent.style.opacity = `${coverOpacity}%`;
  header.style.background = `rgba(0 0 0/${headerOpacity}%)`;

  if (history.state.type === SECTION_TYPE.PLAYLIST) {
    const playlistHeader = document.querySelector("#playlist-header");
    if (coverOpacity <= 35) {
      playlistHeader.classList.add("sticky", "bg-black-secondary", "px-8");
      playlistHeader.classList.remove("mx-8");
      playlistHeader.style.top = `${playlistHeader.offsetHeight}px`;
    } else {
      playlistHeader.classList.remove("sticky", "bg-black-secondary", "px-8");
      playlistHeader.classList.add("mx-8");
      playlistHeader.style.top = `revert`;
    }
  }
};

const loadSection = (section) => {
  if (section.type === SECTION_TYPE.DASHBOARD) {
    fillContentForDashboard();
    loadPlaylists();
  } else if (section.type === SECTION_TYPE.PLAYLIST) {
    //load the elements for playlist
    fillContentForPlaylist(section.playlist);
  }
  document
    .querySelector(".content")
    .removeEventListener("scroll", onScrollSticky);
  document.querySelector(".content").addEventListener("scroll", onScrollSticky);
};

const loadUserPlaylistTracks = (id) => {
  const section = { type: SECTION_TYPE.PLAYLIST, playlist: id };
  history.pushState(section, "", `/dashboard/playlist/${id}`);
  loadSection(section);
};

const loadUserPlaylist = async () => {
  const playlists = await fetchRequest(ENDPOINT.userPlaylists);
  const userPlaylistSection = document.querySelector("#user-playlists > ul");
  userPlaylistSection.innerHTML = "";
  for (let { name, id } of playlists.items) {
    const li = document.createElement("li");
    li.textContent = name;
    li.classList = "cursor-pointer hover:text-primary";
    li.addEventListener("click", () => loadUserPlaylistTracks(id));
    userPlaylistSection.appendChild(li);
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  const volume = document.querySelector("#volume");
  const playButton = document.querySelector("#play");
  const songDurationCompleted = document.querySelector(
    "#song-duration-completed"
  );
  const songProgress = document.querySelector("#progress");
  const songTimeline = document.querySelector("#timeline");
  const audioControl = document.querySelector("#audio-control");
  let progressInterval;

  ({ displayName } = await loadUserProfile());
  loadUserPlaylist();
  const section = { type: SECTION_TYPE.DASHBOARD };
  // const section = {
  //   type: SECTION_TYPE.PLAYLIST,
  //   playlist: "37i9dQZF1DX4Cmr6Ex5w24",
  // };
  history.pushState(section, "", "");
  // history.pushState(section, "", `/dashboard/playlist/${section.playlist}`);
  loadSection(section);

  document.addEventListener("click", () => {
    const menuList = document.getElementById("menu-list");
    if (!menuList.classList.contains("hidden")) {
      menuList.classList.add("hidden");
    }
  });

  audio.addEventListener("play", () => {
    const selectedTrackId = audioControl.getAttribute("data-track-id");
    const tracks = document.querySelector("#tracks");
    const playingTrack = tracks?.querySelector("section.playing");
    const selectedTrack = tracks?.querySelector(`[id="${selectedTrackId}"]`);
    const next = document.querySelector("#next");
    const prev = document.querySelector("#prev");

    if (playingTrack?.id !== selectedTrack?.id) {
      playingTrack?.classList.remove("playing");
    }
    selectedTrack?.classList.add("playing");
    progressInterval = setInterval(() => {
      if (audio.paused) {
        return;
      } else {
        songDurationCompleted.textContent = `${
          audio.currentTime.toFixed(0) < 10
            ? "0:0" + audio.currentTime.toFixed(0)
            : "0:" + audio.currentTime.toFixed(0)
        }`;
        songProgress.style.width = `${
          (audio.currentTime / audio.duration) * 100
        }%`;
      }
    }, 100);
    updateIconsForPlayMode(selectedTrackId);
  });

  audio.addEventListener("pause", () => {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    const selectedTrackId = audioControl.getAttribute("data-track-id");
    updateIconsForPauseMode(selectedTrackId);
  });

  audio.addEventListener("loadedmetadata", onAudioMetaDataLoaded);
  playButton.addEventListener("click", togglePlay);

  volume.addEventListener("change", () => {
    audio.volume = volume.value / 100;
  });

  songTimeline.addEventListener(
    "click",
    (e) => {
      const timelineWidth = window.getComputedStyle(songTimeline).width;
      const timeToSeek = (e.offsetX / parseInt(timelineWidth)) * audio.duration;
      audio.currentTime = timeToSeek;
      songProgress.style.width = `${
        (audio.currentTime / audio.duration) * 100
      }%`;
    },
    false
  );
  next.addEventListener("click", playNextTrack);
  prev.addEventListener("click", playPrevTrack);

  window.addEventListener("popstate", (event) => {
    loadSection(event.state);
  });
});
