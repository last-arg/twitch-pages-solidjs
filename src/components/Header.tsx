import { Component, createResource, createSignal, For, Switch, Match, Show, PropsWithChildren } from 'solid-js';
import { HEADER_OPTS, IMG_WIDTH, IMG_HEIGHT } from "../config";
import { Category, createTwitchImage, rootGameStore } from "../common";
import { Link } from 'solid-app-router';
import CategoryCard from "../components/CategoryCard";


// TODO: sort/insert games aplhabetically
const SidebarGames = () => {
  const [gamesFollowed] = rootGameStore
  const game_ids = gamesFollowed.games.map((item) => item.id);

  return(
    <ul class="flex flex-col">
      <For each={gamesFollowed.games}>{(game) => {
        return (
          <li class="mt-2 text-gray-700">
            <CategoryCard id={game.id} name={game.name} is_followed={game_ids.includes(game.id)} img_class="w-12" />
          </li>
        );
      }}</For> 
    </ul>
  );
}

const searchGames = async (search_term: string): Promise<Category[]> => {
  const trimmed_term = search_term.trim();
  if (trimmed_term.length === 0) {
    return [];
  }
  const url = `https://api.twitch.tv/helix/search/categories?first=10&query=${trimmed_term}`;
  return (await (await fetch(url, HEADER_OPTS)).json()).data;
};

const SidebarSearch = (props: PropsWithChildren<{searchValue: string}>) => {
  const [games, setGames] = createResource(() => props.searchValue, searchGames);

  return (
    <Switch>
      <Match when={games.loading} >
        <p>Searching...</p>
      </Match>
      <Match when={games().length === 0}>
        <p>No results found</p>
      </Match>
      <Match when={games().length > 0}>{() => {
        const game_ids = games().map((item) => item.id);
        return (<ul>
          <For each={games()}>
            {(game) => {
              const encoded_name = encodeURI(game.name);
              let img_url = createTwitchImage(game.name, IMG_WIDTH, IMG_HEIGHT);
              const game_link = `/directory/game/${encoded_name}`;
              return (
                <li class="mt-2">
                  <CategoryCard id={game.id} name={game.name} is_followed={game_ids.includes(game.id)} img_class="w-12" />
                </li>
              );
            }}
          </For>
        </ul>);
      }}</Match>
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
  // const [sidebar, setSidebar] = createSignal(searchValue().length == 0 ? Sidebar.Closed : Sidebar.Search);
  const [sidebar, setSidebar] = createSignal(Sidebar.Games);
  let searchTimeout: number = 0;

  const submitSearch = (e: Event) => {
    e.preventDefault();
    clearTimeout(searchTimeout);
    const value: string = (e.currentTarget as HTMLInputElement)
      .querySelector<HTMLInputElement>("input[type=search]").value;
    setSearchValue(value);
  };

  const inputSearch = (e: Event) => {
    clearTimeout(searchTimeout);
    const value: string = (e.currentTarget as HTMLInputElement).value;
    location.hash = value;
    searchTimeout = setTimeout(() => {
      setSearchValue(value)
    }, 400);
  };

  const inputBlur = () => {
    if (searchValue().length == 0) {
      setSidebar(Sidebar.Closed)
    }
  };

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
            <h2>Results</h2>
            <button onClick={() => {setSidebar(Sidebar.Closed)}} title="close">Close</button>
          </div>
          <Switch>
            <Match when={sidebar() == Sidebar.Search}>
              <SidebarSearch searchValue={searchValue()}/>
            </Match>
            <Match when={sidebar() == Sidebar.Games}>
              <SidebarGames />
            </Match>
          </Switch>
        </div>
      </Show>
    </div>
  );
};

export default Header;
