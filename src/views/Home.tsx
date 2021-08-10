import { Component, createResource, createSignal, createEffect, For, Show } from 'solid-js';
import { HEADER_OPTS, IMG_WIDTH, IMG_HEIGHT } from "../config";
import { Category, createTwitchImage, IconExternalLink, IconFollow, IconUnfollow, rootGameStore } from "../common";
import { Link } from "solid-app-router";

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
  const [gamesFollowed, setGamesFollowed] = rootGameStore

  const followGame = (category: Category, e: MouseEvent) => {
    e.preventDefault();
    setGamesFollowed("games", (games) => [...games, {id: category.id, name: category.name}]);
  };

  const unfollowGame = (id: string, e: MouseEvent) => {
    e.preventDefault();
    setGamesFollowed("games", (games) => {
      const index = games.findIndex((cat) => cat.id === id)
      return [...games.slice(0, index), ...games.slice(index+1)];
    });
  };

  return (
    <>
      <main class="px-2">
        <h2>Top games</h2>
        <ul class="flex flex-wrap -mr-2">
          <Show when={!topGames.loading} fallback={<li>Loading...</li>}>
            <For each={topGames()}>
              {(game: Category) => {
                const encoded_name = encodeURI(game.name);
                let img_url = createTwitchImage(encoded_name, IMG_WIDTH, IMG_HEIGHT);
                const game_link = `/directory/game/${encoded_name}`;
                return (
                  <li class="w-1/3 pb-2 pr-2">
                    <div class="bg-purple-50">
                      <Link class="flex border-2 border-purple-200 rounded-sm hover:text-purple-800 hover:border-purple-500" href={game_link} title={game.name}>
                        <div class="flex-grow flex items-center">
                          <img class="block w-16" src={img_url} alt="" width={IMG_WIDTH} height={IMG_HEIGHT} />
                          <p class="ml-3 text-lg">{game.name}</p>
                        </div>
                        <div class="flex flex-col justify-between">
                          <Show when={!gamesFollowed.games.map((item) => item.id).includes(game.id)}
                            fallback={<button class="text-trueGray-400 p-1.5 w-8 hover:text-black" onClick={[unfollowGame, game.id]} title="Remove bookmark"><IconUnfollow /></button>}>
                            <button class="text-trueGray-400 p-1.5 w-8 hover:text-black" onClick={[followGame, game]} title="Add bookmark"><IconFollow /></button>
                          </Show>
                          <Link class="text-trueGray-400 p-2 w-8 hover:text-black" href={`https://www.twitch.tv${game_link}`} title="Open game in Twitch" onClick={(e: Event) => e.stopPropagation()}><IconExternalLink /></Link>
                        </div>
                      </Link>

                    </div>
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
