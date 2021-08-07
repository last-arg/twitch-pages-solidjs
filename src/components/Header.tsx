import { Component, createResource, createSignal, createEffect } from 'solid-js';
import { HEADER_OPTS, IMG_WIDTH, IMG_HEIGHT } from "../config";
import { Game } from "../common";
import { Link } from 'solid-app-router';

const searchGames = async (search_term): Promise<Game[]> => {
  const trimmed_term = search_term.trim();
  if (trimmed_term.length === 0) {
    return [];
  }
  const url = `https://api.twitch.tv/helix/search/categories?first=10&query=${trimmed_term}`;
  return (await (await fetch(url, HEADER_OPTS)).json()).data;
};

const Header: Component = () => {
  const [searchValue, setSearchValue] = createSignal(location.hash.slice(1));
  const [foundGames] = createResource(searchValue, searchGames);
  let searchTimeout: number | null = null;

  createEffect(() => console.log(foundGames))

  return (
    <div class="relative">
      <header class="bg-gray-700 p-1 shadow flex relative z-10">
        <h1 class="text-white">
          <Link href="/" title="Home">Home</Link>
        </h1>
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
      <div class="absolute right-0 top-0 h-screen text-gray-100 bg-gray-600 pt-10 w-1/4 overflow-y-auto">
        <h2>Search results</h2>
        <ul class="">
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
                    let img_url = game.box_art_url;
                    const game_link = `/directory/game/${game.name}`;
                    return (
                      <li class="my-4">
                        <Link class="w-full flex items-center" href={game_link} title={game.name}>
                          <img src={img_url} alt="" width="52" height="72" />
                          <p class="pl-3">{game.name}</p>
                        </Link>
                      </li>
                    );
                }}
              </For>
            </Match>
          </Switch>
        </ul>
      </div>
    </div>
  );
};

export default Header;
