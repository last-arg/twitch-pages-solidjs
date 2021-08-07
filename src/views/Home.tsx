import { Component, createResource, createSignal, For } from 'solid-js';
import { HEADER_OPTS, IMG_WIDTH, IMG_HEIGHT } from "../config";
import { Game, createTwitchImage } from "../common";
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

const handleGameItemEvents = (e) => {
  if (e.target.classList.contains("js-addBookmark")) {
    e.preventDefault()
    // TODO: add bookmark
    console.log("TODO: add bookmark")
  } else if (e.target.classList.contains("js-removeBookmark")) {
    e.preventDefault()
    // TODO: remove bookmark
    console.log("TODO: remove bookmark")
  } else if (e.target.classList.contains("js-openTwitchLink")) {
    e.preventDefault()
  }
};

const Home: Component = () => {
  // TODO?: make resource into route data?
  const [topGames] = createResource(fetchTopGames);
  // TODO: placefolder data
  const bookmarkedGames = ["511224", "27471"];

  return (
    <>
      <main class="px-2">
        <h2>Top games</h2>
        <ul class="flex flex-wrap -mr-2">
          <Show when={!topGames.loading} fallback={<li>Loading...</li>}>
            <For each={topGames()}>
              {(game) => {
                const encoded_name = encodeURI(game.name);
                let img_url = createTwitchImage(encoded_name, IMG_WIDTH, IMG_HEIGHT);
                const game_link = `/directory/game/${encoded_name}`;
                return (
                  <li class="w-1/3 pb-2 pr-2">
                    <div class="bg-purple-50">
                      <Link class="flex border-2 border-purple-200 rounded-sm hover:text-purple-800 hover:border-purple-500" href={game_link} title={game.name} onClick={handleGameItemEvents}>
                        <div class="flex-grow flex items-center">
                          <img class="block w-16" src={img_url} alt="" width={IMG_WIDTH} height={IMG_HEIGHT} />
                          <p class="ml-3 text-lg">{game.name}</p>
                        </div>
                        <div>
                          <Show when={!bookmarkedGames.includes(game.id)} fallback={<button class="js-removeBookmark h-1/2" title="Remove bookmark">bk remove</button>}>
                            <button class="js-addBookmark h-1/2" title="Add bookmark">bk add</button>
                          </Show>
                          
                          <Link class="js-openTwitchLink block h-1/2" href={`https://www.twitch.tv${game_link}`} external title={`Open ${game.name} in Twitch`}>Twitch [E]</Link>
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
