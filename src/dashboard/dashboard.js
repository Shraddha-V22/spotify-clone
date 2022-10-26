import { fetchRequest } from "../api";
import { ENDPOINT, logout } from "../common";

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
};

const onPlaylistItemClick = (event) => {
  console.log(event.target);
};

const loadFeaturedPlaylist = async () => {
  const {
    playlists: { items },
  } = await fetchRequest(ENDPOINT.featuredPlaylist);
  const featuredPlaylistAlbums = document.getElementById(
    "featured-playlist-items"
  );

  for (let { name, description, images, id } of items) {
    const playlistItem = document.createElement("section");
    playlistItem.classList =
      "w-[200px] rounded border-2 border-solid p-4 hover:cursor-pointer";
    playlistItem.id = id;
    playlistItem.setAttribute("data-type", "playlist");
    playlistItem.addEventListener("click", onPlaylistItemClick);
    const [{ url: imageUrl }] = images;
    playlistItem.innerHTML = `<img
      class="w-[100%] rounded mb-2 object-contain shadow"
      src=${imageUrl}
      alt="${name}"
    />
    <h2 class="text-sm">${name}</h2>
    <h3 class="text-xs">${description}</h3>`;
    featuredPlaylistAlbums.appendChild(playlistItem);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
  loadFeaturedPlaylist();
  document.addEventListener("click", () => {
    const menuList = document.getElementById("menu-list");
    if (!menuList.classList.contains("hidden")) {
      menuList.classList.add("hidden");
    }
  });
});
