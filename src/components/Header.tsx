import { Component, createResource, createSignal, createEffect, For, Switch, Match, Show, PropsWithChildren } from 'solid-js';
import { HEADER_OPTS, IMG_WIDTH, IMG_HEIGHT } from "../config";
import { Category, createTwitchImage, IconExternalLink, IconFollow, IconUnfollow, rootGameStore } from "../common";
import { Link } from 'solid-app-router';

// TODO: sidebar games. with undo (if misclick)
const SidebarGames = () => {
  const [gamesFollowed, setGamesFollowed] = rootGameStore

  const followGame = (category: {id: string, name: string}, e: MouseEvent) => {
    e.preventDefault();
    setGamesFollowed(category.id, category.name);
  };

  const unfollowGame = (id: string, e: MouseEvent) => {
    e.preventDefault();
    setGamesFollowed(id, undefined);
  };

  return(
    <ul class="flex flex-col">
      <For each={Object.keys(gamesFollowed)}>{(id) => {
        const name = gamesFollowed[id];
        const encoded_name = encodeURI(name);
        let img_url = createTwitchImage(encoded_name, IMG_WIDTH, IMG_HEIGHT);
        const game_link = `/directory/game/${encoded_name}`;
        return (
          <li class="mt-2 text-gray-700">
            <div class="bg-purple-50">
              <Link class="flex border-2 border-purple-200 rounded-sm hover:text-purple-800 hover:border-purple-500" href={game_link} title={name}>
                <div class="flex-grow flex items-center">
                  <img class="block w-12" src={img_url} alt="" width={IMG_WIDTH} height={IMG_HEIGHT} />
                  <p class="ml-3 text-lg line-clamp-2">{name}</p>
                </div>
                <div class="flex flex-col justify-between">
                  <Show when={!Object.keys(gamesFollowed).includes(id)}
                    fallback={<button class="text-trueGray-400 p-1.5 w-8 hover:text-black" onClick={[unfollowGame, id]} title="Remove bookmark"><IconUnfollow /></button>}>
                    <button class="text-trueGray-400 p-1.5 w-8 hover:text-black" onClick={[followGame, {id, name}]} title="Add bookmark"><IconFollow /></button>
                  </Show>
                  <Link class="text-trueGray-400 p-2 w-8 hover:text-black" href={`https://www.twitch.tv${game_link}`} title="Open game in Twitch" onClick={(e: Event) => e.stopPropagation()}><IconExternalLink /></Link>
                </div>
              </Link>

            </div>
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
      <Match when={games().length > 0}>
        <ul>
          <For each={games()}>
            {(game) => {
                const encoded_name = encodeURI(game.name);
                let img_url = createTwitchImage(game.name, IMG_WIDTH, IMG_HEIGHT);
                const game_link = `/directory/game/${encoded_name}`;
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
