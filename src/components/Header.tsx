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

const SidebarSearch = (props) => {
  const [games] = createResource(props.searchValue, searchGames);

  return (
    <Switch>
      <Match when={games.loading} >
        <p>Searching...</p>
      </Match>
      <Match when={games().length === 0}>
        <p>No results found</p>
      </Match>
      <Match when={games().length > 0}>
        <ul>
          <For each={games()}>
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
        </ul>
      </Match>
    </Switch>
  );
};

enum Sidebar {
  Closed,
  Search,
  Games,
  Streams,
}

// TODO: If sidebar content exceeds height display a button or gradient at bottom
const Header: Component = () => {
  const [searchValue, setSearchValue] = createSignal(location.hash.slice(1));
  const [sidebar, setSidebar] = createSignal(searchValue().length == 0 ? Sidebar.Closed : Sidebar.Search);
  let searchTimeout: number | null = null;

  const submitSearch = (e) => {
    e.preventDefault();
    clearTimeout(searchTimeout);
    const value  = e.currentTarget.querySelector("input[type=search]").value;
    setSearchValue(value);
  };

  const inputSearch = (e) => {
    clearTimeout(searchTimeout);
    const value = e.currentTarget.value;
    location.hash = value;
    searchTimeout = setTimeout(() => {
      setSearchValue(value)
    }, 400);
  };

  const inputBlur = () => {
    console.log("loose focus")
    if (searchValue().length == 0) {
      setSidebar(Sidebar.Closed)
    }
  };

  createEffect(() => console.log(sidebar(), Sidebar.Closed));

  return (
    <div class="relative">
      <header class="bg-gray-700 p-1 shadow flex relative z-10">
        <h1 class="text-white">
          <Link href="/" title="Home">Home</Link>
        </h1>
        <form onSubmit={submitSearch}>
          <input
            type="search"
            class="border bg-blue-100"
            placeholder="Search for game"
            value={searchValue()}
            onInput={inputSearch}
            onFocus={() => {setSidebar(Sidebar.Search)}}
            onBlur={inputBlur}
          />
          <button type="submit">Search</button>
        </form>
        <button>Games</button>
        <button>Streams</button>
      </header>
      <Show when={sidebar() != Sidebar.Closed}>
        <div class="absolute right-0 top-0 h-screen text-gray-100 bg-gray-600 pt-10 w-1/4 overflow-y-auto">
          <div class="flex justify-between">
            <h2>Search results</h2>
            <button onClick={() => {setSidebar(Sidebar.Closed)}} title="close">Close</button>
          </div>
          <SidebarSearch searchValue={searchValue()}/>
        </div>
      </Show>
    </div>
  );
};

export default Header;
