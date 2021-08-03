import { Component, createResource, createSignal, For } from 'solid-js';
import Header from '../components/Header'

// TODO: make game list element into component. Or make whole list (ul) into component

const IMG_WIDTH = 143;
const IMG_HEIGHT = 190;

interface Game {
  id: string,
  name: string,
  box_art_url: string,
}

const client_id = "7v5r973dmjp0nd1g43b8hcocj2airz";
const HEADER_OPTS = {
  method: "GET",
  headers: {
    "Host": "api.twitch.tv",
    // TODO: remove hardcoded bearer token
    "Authorization": `Bearer ${import.meta.env.VITE_TWITCH_ACCESS_TOKEN}`,
    "Client-id": client_id,
    "Accept": "application/vnd.twitchtv.v5+json",
  }
};

const fetchTopGames = async (id): Promise<Game[]> => {
  const url = "https://api.twitch.tv/helix/games/top?first=10";
  if (import.meta.env.DEV) {
    return (await (await fetch("/tmp/top_games.json")).json()).data;
  } else {
    if (import.meta.env.VITE_TWITCH_ACCESS_TOKEN === undefined) {
      throw "Three is no twitch access token solution setup for prodution site";
    }
    return (await (await fetch(url, HEADER_OPTS)).json()).data;
  }
}

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
                          <a href={game_link} title={game.name}>
                            <img src={img_url} alt="" width={IMG_WIDTH} height={IMG_HEIGHT} />
                          </a>
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
                  const game_link = `/directory/game/${game.name}`;
                  return (
                    <li class="w-1/3 pb-2 pr-2">
                      <a class="flex items-center bg-purple-50 border-2 rounded-sm border-purple-300 hover:shadow-purple shadow-purple hover:text-purple-800" href={game_link} title={game.name}>
                        <img class="block w-16" src={img_url} alt="" width={IMG_WIDTH} height={IMG_HEIGHT} />
                        <p class="ml-2 text-lg">{game.name}</p>
                      </a>
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
