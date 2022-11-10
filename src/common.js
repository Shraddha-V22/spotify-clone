export const ACCESS_TOKEN = "ACCESS_TOKEN";
export const TOKEN_TYPE = "TOKEN_TYPE";
export const EXPIRES_IN = "EXPIRES_IN";

const APP_URL = import.meta.env.VITE_APP_URL;

export const ENDPOINT = {
  profileUrl: "me",
  featuredPlaylist: "browse/featured-playlists?limit=5",
  topPlaylists: "browse/categories/toplists/playlists?limit=10",
  playlist: "playlists",
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
};
