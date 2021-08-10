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
const createGamesStore = (): [get: Store<GameFollow>, set: SetStoreFunction<GameFollow>] => {
  let initValue = {};
  const local_games = localStorage.getItem("games")
  if (local_games !== undefined) {
    initValue = JSON.parse(local_games);
  }
  const [games, setGames] = createStore<GameFollow>(initValue );
  createEffect(() => {localStorage.setItem("games", JSON.stringify(games))})
  return [games, setGames];
};

export const rootGameStore = createRoot(createGamesStore)

export const createTwitchImage = (name: string, width: number, height: number): string => {
  return `https://static-cdn.jtvnw.net/ttv-boxart/${name}-${width}x${height}.jpg`;
}

export const IconExternalLink = () => {
  return (
<svg class="fill-current" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g clip-path="url(#clip0)">
    <path d="M18.9656 0L20 0.966047L9.03438 11.2L8 10.2346L18.9656 0Z"/>
    <path d="M20 7.2H18.56V1.44H12.8V0H20V7.2Z"/>
    <path d="M16.9846 20H2.21538C0.96 20 0 19.04 0 17.7846V3.01537C0 1.75999 0.96 0.799988 2.21538 0.799988H10.3385V2.27691H2.21538C1.77231 2.27691 1.47692 2.5723 1.47692 3.01537V17.7846C1.47692 18.2277 1.77231 18.5231 2.21538 18.5231H16.9846C17.4277 18.5231 17.7231 18.2277 17.7231 17.7846V9.66153H19.2V17.7846C19.2 19.04 18.24 20 16.9846 20Z"/>
  </g>
  <defs>
    <clipPath id="clip0">
      <rect width="20" height="20" fill="white"/>
    </clipPath>
  </defs>
</svg>  );
};

export const IconFollow = () => {
  return (
    <svg class="fill-current" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.78803 0.753C9.28303 -0.251 10.714 -0.251 11.209 0.753L13.567 5.53L18.84 6.296C19.947 6.457 20.389 7.818 19.588 8.599L15.772 12.319L16.673 17.569C16.863 18.672 15.705 19.513 14.714 18.993L9.99803 16.513L5.28303 18.993C4.29303 19.513 3.13503 18.673 3.32303 17.569L4.22403 12.319L0.409031 8.599C-0.391969 7.819 0.0500314 6.457 1.15703 6.296L6.43003 5.53L8.78803 0.753ZM9.99803 1.689L7.74003 6.265C7.64314 6.46112 7.50005 6.63076 7.32306 6.75932C7.14608 6.88788 6.9405 6.97151 6.72403 7.003L1.67403 7.737L5.32803 11.299C5.64603 11.609 5.79103 12.056 5.71603 12.494L4.85403 17.524L9.37003 15.149C9.56384 15.047 9.77954 14.9938 9.99853 14.9938C10.2175 14.9938 10.4332 15.047 10.627 15.149L15.143 17.523L14.281 12.494C14.244 12.2783 14.2599 12.0568 14.3275 11.8486C14.3951 11.6404 14.5123 11.4518 14.669 11.299L18.323 7.737L13.273 7.003C13.0566 6.97151 12.851 6.88788 12.674 6.75932C12.497 6.63076 12.3539 6.46112 12.257 6.265L9.99803 1.689Z"/>
    </svg>
  );
};

export const IconUnfollow = () => {
  return (
    <svg class="fill-current" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.3536 7.04257L13.358 6.1301L10.6778 0.440169C10.6046 0.284382 10.4841 0.158269 10.3354 0.0816119C9.96227 -0.111267 9.50887 0.0494654 9.32232 0.440169L6.64213 6.1301L0.646516 7.04257C0.481218 7.0673 0.330088 7.1489 0.214379 7.27254C0.0744931 7.4231 -0.00259025 7.62566 6.6464e-05 7.8357C0.00272317 8.04575 0.0849026 8.2461 0.228547 8.39272L4.56645 12.8215L3.5416 19.0753C3.51757 19.2207 3.53294 19.3704 3.58598 19.5071C3.63901 19.6439 3.72759 19.7624 3.84166 19.8492C3.95573 19.9359 4.09074 19.9875 4.23137 19.998C4.37199 20.0085 4.51262 19.9775 4.63729 19.9086L10 16.9561L15.3628 19.9086C15.5092 19.9902 15.6792 20.0174 15.8422 19.9877C16.2531 19.9135 16.5293 19.5055 16.4585 19.0753L15.4336 12.8215L19.7715 8.39272C19.8896 8.27156 19.9675 8.1133 19.9912 7.9402C20.0549 7.50746 19.7668 7.10686 19.3536 7.04257V7.04257Z"/>
    </svg>
  );
};




