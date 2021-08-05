import { Component, createResource, createSignal, For } from 'solid-js';
import { HEADER_OPTS, IMG_WIDTH, IMG_HEIGHT } from "../config";
import { Link } from "solid-app-router";

// TODO: make game list element into component. Or make whole list (ul) into component

interface Game {
  id: string,
  name: string,
  box_art_url: string,
}

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

const searchGames = async (search_term): Promise<Game[]> => {
  const trimmed_term = search_term.trim();
  if (trimmed_term.length === 0) {
    return [];
  }
  const url = `https://api.twitch.tv/helix/search/categories?first=10&query=${trimmed_term}`;
  return (await (await fetch(url, HEADER_OPTS)).json()).data;
};

const Home: Component = () => {
  const [searchValue, setSearchValue] = createSignal(location.hash.slice(1));
  const [foundGames] = createResource(searchValue, searchGames);
  const [topGames] = createResource(fetchTopGames);
  let searchTimeout: number | null = null;

  return (
    <>
      <header class="bg-gray-700 p-1 shadow flex">
        <h1 class="text-white">Twitch filter</h1>
        <form onSubmit={(e) => {
            e.preventDefault();
            clearTimeout(searchTimeout);
            const value  = e.currentTarget.querySelector("input[type=search]").value;
            setSearchValue(value);
        }}>
          <input
            type="search"
            class="border bg-blue-100"
            placeholder="Search for game"
            value={searchValue()}
            onInput={(e) => {
              clearTimeout(searchTimeout);
              const value = e.currentTarget.value;
              location.hash = value;
              searchTimeout = setTimeout(() => {
                setSearchValue(value)
              }, 400);
            }}
          />
          <button type="submit">Search</button>
        </form>
      </header>
      <main class="px-2">
        <div>
          <h2>Search results</h2>
          <ul class="flex flex-wrap">
            <Switch>
              <Match when={foundGames.loading} >
                <p>Searching...</p>
              </Match>
              <Match when={searchValue().trim().length > 0 && foundGames().length === 0}>
                <p>No results found</p>
              </Match>
              <Match when={foundGames().length > 0}>
                <For each={foundGames()}>
                  {(game) => {
                      let img_url = game.box_art_url.replace("52x72", `${IMG_WIDTH}x${IMG_HEIGHT}`);
                      const game_link = `/directory/game/${game.name}`;
                      return (
                        <li>
                          <Link href={game_link} title={game.name}>
                            <img src={img_url} alt="" width={IMG_WIDTH} height={IMG_HEIGHT} />
                          </Link>
                          <p>{game.name}</p>
                        </li>
                      );
                  }}
                </For>
              </Match>
            </Switch>
          </ul>
        </div>
        <div>
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
        </div>
      </main>
    </>
  );
};

export default Home;
