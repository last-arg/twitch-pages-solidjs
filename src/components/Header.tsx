import { Component, createResource, createSignal, For, Switch, Match, Show, PropsWithChildren, Resource } from 'solid-js';
import { HEADER_OPTS } from "../config";
import { Category, localGames, localStreams, localImages, fetchAndSetProfileImages, localLiveStreams } from "../common";
import { IconExternalLink } from "../icons";
import { Link } from 'solid-app-router';
import CategoryCard from "../components/CategoryCard";
import ButtonStreamFollow from "../components/ButtonStreamFollow";

const SidebarGames = () => {
  return(
    <ul>
      <For each={localGames.games}>{(game) => {
        return (
          <Show when={game}>
            <li class="mt-2 text-gray-700">
              <CategoryCard id={game.id} name={game.name} img_class="w-12" />
            </li>
          </Show>
        );
      }}</For>
    </ul>
  );
};

const SidebarStreams = () => {
  const user_ids = localStreams.streams.map(({user_id}) => user_id)
  const image_keys = Object.keys(localImages.images)
  fetchAndSetProfileImages(user_ids.filter((user_id) => !image_keys.includes(user_id)))

  return(
    <ul>
      <For each={localStreams.streams} fallback={<li>No streams</li>}>{(stream) =>
        <Show when={stream}>
          <li class="mt-2 text-gray-700">
            <Link class="flex items-center justify-between pr-2" href={`/${stream.user_login}/videos`} title={stream.user_name}>
              <div class="flex items-center">
                <img class="w-8 bg-gray-700" src={localImages.get(stream.user_id)} width="300" height="300" />
                <span class="ml-2 truncate">{stream.user_name}</span>
                <span class="ml-2 truncate">{stream.user_id}</span>
              </div>
              <div class="flex items-center">
                <ButtonStreamFollow {...stream} />
                <Link class="group" href={`https://www.twitch.tv/${stream.user_login}/videos`} title="Videos on Twitch">
                  <span class="block w-4 ml-1 text-trueGray-400 group-hover:text-purple-700"><IconExternalLink /></span>
                </Link>
              </div>
            </Link>
          </li>
        </Show>
      }</For>
    </ul>
  );
};

const searchGames = async (search_term: string): Promise<Category[]> => {
  const trimmed_term = search_term.trim();
  if (trimmed_term.length === 0) {
    return [];
  }
  const url = `https://api.twitch.tv/helix/search/categories?first=10&query=${trimmed_term}`;
  return (await (await fetch(url, HEADER_OPTS)).json()).data as Category[];
};

const SidebarSearch = (props: PropsWithChildren<{games: Resource<Category[]>}>) => {
  return (
    <Switch>
      <Match when={props.games.loading} >
        <p>Searching...</p>
      </Match>
      <Match when={props.games().length === 0}>
        <p>No results found</p>
      </Match>
      <Match when={props.games().length > 0}>{() => {
        return (<ul>
          <For each={props.games()}>{(game) =>
            <li class="mt-2">
              <CategoryCard id={game.id} name={game.name} img_class="w-12" />
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

const Header: Component = () => {
  const [searchValue, setSearchValue] = createSignal(location.hash.slice(1));
  const [sidebar, setSidebar] = createSignal(searchValue().length == 0 ? Sidebar.Closed : Sidebar.Search);
  const [games] = createResource<Category[], string>(() => searchValue(), searchGames, {initialValue: []});
  let searchTimeout: number = 0;

  const resetSearch = (e: Event) => {
    clearTimeout(searchTimeout);
    setSearchValue("")
    location.hash = "";
    const elem = (e.currentTarget as HTMLElement).querySelector("input[type=search]") as HTMLInputElement;
    elem.focus();
  };

  const submitSearch = (e: Event) => {
    e.preventDefault();
    clearTimeout(searchTimeout);
    const elem = (e.currentTarget as HTMLElement).querySelector("input[type=search]") as HTMLInputElement;
    setSearchValue(elem.value);
  };

  const inputSearch = (e: InputEvent) => {
    clearTimeout(searchTimeout);
    const elem = e.currentTarget as HTMLInputElement;
    location.hash = elem.value;
    searchTimeout = setTimeout((value: string) => {
      setSearchValue(value)
    }, 400, elem.value);
  };

  const inputBlur = () => {
    if (searchValue().length == 0) {
      setSidebar(Sidebar.Closed)
    }
  };

  const toggleSidebar = (button_state: Sidebar) => {
    setSidebar(sidebar() === button_state ? Sidebar.Closed : button_state)
  };

  const streamsLiveUpdate = () => {
    if (sidebar() == Sidebar.Closed) {
      localLiveStreams.updateAll()
    }
  }

  const sidebarTitles = {
    [Sidebar.Games]: "Games",
    [Sidebar.Search]: "Search",
    [Sidebar.Streams]: "Streams",
    [Sidebar.Closed]: null,
  };

  return (
    <div class="fixed top-0 left-0 w-full z-10">
      <header class="bg-gray-700 p-1 shadow flex flex-nowrap justify-between">
        <div class="flex">
          <h1 class="text-white">
            <Link href="/" title="Home">Home</Link>
          </h1>
          <form onSubmit={submitSearch} onReset={resetSearch}>
            <input
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
          <button class="ml-4" onClick={[toggleSidebar, Sidebar.Streams]} onMouseDown={streamsLiveUpdate}>Streams</button>
        </div>
      </header>
      <div class="absolute right-0 top-0 h-screen text-gray-100 bg-gray-600 pt-10 w-1/4 overflow-y-auto -z-10" classList={{hidden: sidebar() === Sidebar.Closed}}>
        <div class="flex justify-between">
          <h2>{sidebarTitles[sidebar()]}</h2>
          <button onClick={[setSidebar, Sidebar.Closed]} title="Close sidebar">Close</button>
        </div>
        <Switch fallback={<p>Something went wrong</p>}>
          <Match when={sidebar() === Sidebar.Search}>
            <SidebarSearch games={games}/>
          </Match>
          <Match when={sidebar() === Sidebar.Games}>
            <SidebarGames />
          </Match>
          <Match when={sidebar() === Sidebar.Streams}>
            <SidebarStreams />
          </Match>
        </Switch>
      </div>
    </div>
  );
};

export default Header;
