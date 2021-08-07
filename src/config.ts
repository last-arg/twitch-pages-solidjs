export const IMG_WIDTH = 143;
export const IMG_HEIGHT = 190;

const clientId = "7v5r973dmjp0nd1g43b8hcocj2airz";

export const HEADER_OPTS = {
  method: "GET",
  headers: {
    "Host": "api.twitch.tv",
    // TODO: remove hardcoded bearer token
    "Authorization": `Bearer ${import.meta.env.VITE_TWITCH_ACCESS_TOKEN}`,
    "Client-id": clientId,
    "Accept": "application/vnd.twitchtv.v5+json",
  }
};
