import { HEADER_OPTS } from "./config";

export interface Category {
  id: string,
  name: string,
  box_art_url: string,
}

export const fetchCategory = async (category: string): Promise<Category | undefined> => {
  const url = `https://api.twitch.tv/helix/games?name=${category}`;
  const result = (await (await fetch(url, HEADER_OPTS)).json()).data;
  return result[0];
};