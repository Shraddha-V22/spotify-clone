export const ACCESS_TOKEN = "ACCESS_TOKEN";
export const TOKEN_TYPE = "TOKEN_TYPE";
export const EXPIRES_IN = "EXPIRES_IN";
export const LOADED_TRACK = "LOADED_TRACK";

const APP_URL = import.meta.env.VITE_APP_URL;

export const ENDPOINT = {
  profileUrl: "me",
  featuredPlaylist: "browse/featured-playlists?limit=5",
  topPlaylists: "browse/categories/toplists/playlists",
  playlist: "playlists",
  userPlaylists: "me/playlists",
  searchTrack: "search",
};

export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(TOKEN_TYPE);
  localStorage.removeItem(EXPIRES_IN);
  window.location.href = APP_URL;
};

export const SECTION_TYPE = {
  DASHBOARD: "DASHBOARD",
  PLAYLIST: "PLAYLIST",
  SEARCH: "SEARCH",
};
