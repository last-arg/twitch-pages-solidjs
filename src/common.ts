import { createStore, Store, SetStoreFunction } from "solid-js/store";
import { createEffect, createRoot } from 'solid-js';

export interface Category {
  id: string,
  name: string,
  box_art_url: string,
}

export interface GameFollow {
  [id: string]: string
}

interface GamesLocal {
  games: ({id: string, name: string})[]
}

const createGamesStore = (): [get: Store<GamesLocal>, set: SetStoreFunction<GamesLocal>] => {
  let initValue: GamesLocal = {games:[]};
  const local_games = localStorage.getItem("games")
  if (local_games) {
    initValue = JSON.parse(local_games);
  }
  const [games, setGames] = createStore<GamesLocal>(initValue);
  createEffect(() => {localStorage.setItem("games", JSON.stringify(games))})
  return [games, setGames];
};

export const rootGameStore = createRoot(createGamesStore)

export const createTwitchImage = (name: string, width: number, height: number): string => {
  return `https://static-cdn.jtvnw.net/ttv-boxart/${name}-${width}x${height}.jpg`;
}
