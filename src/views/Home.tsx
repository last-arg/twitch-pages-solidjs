import { Component, createResource, createSignal, For } from 'solid-js';
import { HEADER_OPTS, IMG_WIDTH, IMG_HEIGHT } from "../config";
import { Game } from "../common";
import { Link } from "solid-app-router";

const fetchTopGames = async (id): Promise<Game[]> => {
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

  return (
    <>
      <main class="px-2">
        <h2>Top games</h2>
        <ul class="flex flex-wrap -mr-2">
          <Show when={!topGames.loading} fallback={<li>Loading...</li>}>
            <For each={topGames()}>
              {(game) => {
                let img_url = game.box_art_url.replace("{width}", IMG_WIDTH).replace("{height}", IMG_HEIGHT);
                const game_link = `/directory/game/${encodeURI(game.name)}`;
                return (
                  <li class="w-1/3 pb-2 pr-2">
                    <Link class="flex items-center bg-purple-50 border-2 border-purple-200 rounded-sm hover:text-purple-800 hover:border-purple-500" href={game_link} title={game.name}>
                      <img class="block w-16" src={img_url} alt="" width={IMG_WIDTH} height={IMG_HEIGHT} />
                      <p class="ml-3 text-lg">{game.name}</p>
                    </Link>
                  </li>
                );
              }}
            </For>
          </Show>
        </ul>
      </main>
    </>
  );
};

export default Home;
