import { createStore, Store } from "solid-js/store";
import { createEffect } from 'solid-js';

export const createGamesStore = () => {
  let initValue = {};
  const local_games = localStorage.getItem("games")
  if (local_games) {
    initValue = JSON.parse(local_games);
  }
  const [games, setGames] = createStore(initValue);
  createEffect(() => {localStorage.setItem("games", JSON.stringify(games))})
  return [games, setGames];
};

export const createTwitchImage = (name: string, width: number, height: number): string => {
  return `https://static-cdn.jtvnw.net/ttv-boxart/${name}-${width}x${height}.jpg`;
}

export interface Game {
  id: string,
  name: string,
  box_art_url: string,
}
