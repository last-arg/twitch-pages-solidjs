import { Component, createResource, createSignal, createEffect, For, Show } from 'solid-js';
import { HEADER_OPTS, IMG_WIDTH, IMG_HEIGHT } from "../config";
import { Category, rootGameStore } from "../common";
import CategoryCard from "../components/CategoryCard";

const fetchTopGames = async (id: string): Promise<Category[]> => {
  const url = "https://api.twitch.tv/helix/games/top?first=10";
  if (import.meta.env.DEV) {
    return (await (await fetch("/tmp/top_games.json")).json()).data;
  } else {
    if (import.meta.env.VITE_TWITCH_ACCESS_TOKEN === undefined) {
      throw "No Twitch access token found";
    }
    return (await (await fetch(url, HEADER_OPTS)).json()).data;
  }
};

const Home: Component = () => {
  // TODO?: make resource into route data?
  const [topGames] = createResource(fetchTopGames);
  const [gamesFollowed] = rootGameStore

  return (
    <main class="px-2">
      <h2>Top games</h2>
        <ul class="flex flex-wrap -mr-2">
          <Show when={!topGames.loading} fallback={<li>Loading...</li>}>{() => {
            const game_ids = gamesFollowed.games.map((item) => item.id)
            return (<For each={topGames()}>
              {(game: Category) => {
                return (
                  <li class="w-1/3 pb-2 pr-2">
                    <CategoryCard id={game.id} name={game.name} is_followed={game_ids.includes(game.id)} img_class="w-16"/>
                  </li>
                );
              }}
            </For>);
          }}</Show>
        </ul>
    </main>
  );
};

export default Home;
