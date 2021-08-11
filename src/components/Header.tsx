import { Component, createEffect, createResource, createSignal, For, Switch, Match, Show, PropsWithChildren } from 'solid-js';
import { HEADER_OPTS, IMG_WIDTH, IMG_HEIGHT } from "../config";
import { Category, createTwitchImage, rootGameStore } from "../common";
import { Link } from 'solid-app-router';
import CategoryCard from "../components/CategoryCard";


const SidebarGames = () => {
  const [gamesFollowed] = rootGameStore

  return(
    <ul class="flex flex-col">{() => {
      let game_ids = gamesFollowed.games.map((item) => item.id);
      return (
        <For each={gamesFollowed.games}>{(game) =>
          <li class="mt-2 text-gray-700">
            <CategoryCard id={game.id} name={game.name} is_followed={game_ids.includes(game.id)} img_class="w-12" />
          </li>
        }</For>
      );
    }}</ul>
  );
};

const searchGames = async (search_term: string): Promise<Category[]> => {
  const trimmed_term = search_term.trim();
  if (trimmed_term.length === 0) {
    return [];
  }
  const url = `https://api.twitch.tv/helix/search/categories?first=10&query=${trimmed_term}`;
  return (await (await fetch(url, HEADER_OPTS)).json()).data;
};

const SidebarSearch = (props: PropsWithChildren<{searchValue: string}>) => {
  const [games] = createResource(() => props.searchValue, searchGames);

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
          <For each={games()}>{(game) =>
            <li class="mt-2">
              <CategoryCard id={game.id} name={game.name} is_followed={game_ids.includes(game.id)} img_class="w-12" />
            </li>
          }</For>
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
  let search_input: HTMLInputElement;
  const [searchValue, setSearchValue] = createSignal(location.hash.slice(1));
  const [sidebar, setSidebar] = createSignal(searchValue().length == 0 ? Sidebar.Closed : Sidebar.Search);
  let searchTimeout: number = 0;

  const resetSearch = () => {
    clearTimeout(searchTimeout);
    setSearchValue("")
    location.hash = "";
    search_input.focus();
  };

  const submitSearch = (e: Event) => {
    e.preventDefault();
    clearTimeout(searchTimeout);
    setSearchValue(search_input.value);
  };

  const inputSearch = () => {
    clearTimeout(searchTimeout);
    location.hash = search_input.value;
    searchTimeout = setTimeout((value: string) => {
      setSearchValue(value)
    }, 400, search_input.value);
  };

  const inputBlur = () => {
    if (searchValue().length == 0) {
      setSidebar(Sidebar.Closed)
    }
  };

  const toggleSidebar = (button_state: Sidebar) => {
    setSidebar(sidebar() === button_state ? Sidebar.Closed : button_state)
  };

  return (
    <div class="relative">
      <header class="bg-gray-700 p-1 shadow flex flex-nowrap justify-between relative z-20">
        <div class="flex">
          <h1 class="text-white">
            <Link href="/" title="Home">Home</Link>
          </h1>
          <form onSubmit={submitSearch} onReset={resetSearch}>
            <input
              ref={search_input}
              type="search"
              class="border bg-blue-100"
              placeholder="Search for game"
              value={searchValue()}
              onInput={inputSearch}
              onFocus={[setSidebar, Sidebar.Search]}
              onBlur={inputBlur}
            />
            <button type="submit">Search</button>
            <button type="reset">Clear</button>
          </form>
        </div>
        <div>
          <button onClick={[toggleSidebar, Sidebar.Games]}>Games</button>
          <button onClick={[toggleSidebar, Sidebar.Streams]} class="ml-4">Streams</button>
        </div>
      </header>
      <div class="absolute right-0 top-0 h-screen text-gray-100 bg-gray-600 pt-10 w-1/4 overflow-y-auto z-10" classList={{hidden: sidebar() === Sidebar.Closed}}>
        <div class="flex justify-between">
          <h2>Results</h2>
          <button onClick={[setSidebar, Sidebar.Closed]} title="Close sidebar">Close</button>
        </div>
        <div classList={{hidden: sidebar() !== Sidebar.Search}}>
          <SidebarSearch searchValue={searchValue()}/>
        </div>
        <div classList={{hidden: sidebar() !== Sidebar.Games}}>
          <SidebarGames />
        </div>
        <div classList={{hidden: sidebar() !== Sidebar.Streams}}>
          <p>Streams</p>
        </div>
      </div>
    </div>
  );
};

export default Header;
