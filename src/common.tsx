import { createStore, Store, SetStoreFunction } from "solid-js/store";
import { createEffect } from 'solid-js';

export interface Category {
  id: string,
  name: string,
  box_art_url: string,
}

export interface GameFollow {
  [id: string]: string
}

export const createGamesStore = (): [get: Store<GameFollow>, set: SetStoreFunction<GameFollow>] => {
  let initValue = {};
  const local_games = localStorage.getItem("games")
  if (local_games) {
    initValue = JSON.parse(local_games);
  }
  const [games, setGames] = createStore<GameFollow>(initValue);
  createEffect(() => {localStorage.setItem("games", JSON.stringify(games))})
  return [games, setGames];
};

export const createTwitchImage = (name: string, width: number, height: number): string => {
  return `https://static-cdn.jtvnw.net/ttv-boxart/${name}-${width}x${height}.jpg`;
}

export const IconExternalLink = () => {
  return (
    <svg class="fill-current" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 8.82C15.7348 8.82 15.4804 8.92536 15.2929 9.11289C15.1054 9.30043 15 9.55478 15 9.82V17C15 17.2652 14.8946 17.5196 14.7071 17.7071C14.5196 17.8946 14.2652 18 14 18H3C2.73478 18 2.48043 17.8946 2.29289 17.7071C2.10536 17.5196 2 17.2652 2 17V6C2 5.73478 2.10536 5.48043 2.29289 5.29289C2.48043 5.10536 2.73478 5 3 5H10.18C10.4452 5 10.6996 4.89464 10.8871 4.70711C11.0746 4.51957 11.18 4.26522 11.18 4C11.18 3.73478 11.0746 3.48043 10.8871 3.29289C10.6996 3.10536 10.4452 3 10.18 3H3C2.20435 3 1.44129 3.31607 0.87868 3.87868C0.316071 4.44129 0 5.20435 0 6V17C0 17.7956 0.316071 18.5587 0.87868 19.1213C1.44129 19.6839 2.20435 20 3 20H14C14.7956 20 15.5587 19.6839 16.1213 19.1213C16.6839 18.5587 17 17.7956 17 17V9.82C17 9.55478 16.8946 9.30043 16.7071 9.11289C16.5196 8.92536 16.2652 8.82 16 8.82ZM19.92 0.62C19.8185 0.375651 19.6243 0.181475 19.38 0.0799999C19.2598 0.028759 19.1307 0.00157999 19 0H13C12.7348 0 12.4804 0.105357 12.2929 0.292893C12.1054 0.48043 12 0.734784 12 1C12 1.26522 12.1054 1.51957 12.2929 1.70711C12.4804 1.89464 12.7348 2 13 2H16.59L6.29 12.29C6.19627 12.383 6.12188 12.4936 6.07111 12.6154C6.02034 12.7373 5.9942 12.868 5.9942 13C5.9942 13.132 6.02034 13.2627 6.07111 13.3846C6.12188 13.5064 6.19627 13.617 6.29 13.71C6.38296 13.8037 6.49356 13.8781 6.61542 13.9289C6.73728 13.9797 6.86799 14.0058 7 14.0058C7.13201 14.0058 7.26272 13.9797 7.38458 13.9289C7.50644 13.8781 7.61704 13.8037 7.71 13.71L18 3.41V7C18 7.26522 18.1054 7.51957 18.2929 7.70711C18.4804 7.89464 18.7348 8 19 8C19.2652 8 19.5196 7.89464 19.7071 7.70711C19.8946 7.51957 20 7.26522 20 7V1C19.9984 0.869323 19.9712 0.740222 19.92 0.62Z"/>
    </svg>
  );
};

