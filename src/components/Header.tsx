import { Component, createResource, createSignal, For, Switch, Match, Show, Resource } from 'solid-js';
import { HEADER_OPTS } from "../config";
import { localGames, localStreams, localImages, fetchAndSetProfileImages, localLiveStreams} from "../common";
import { IconExternalLink, IconLookingClass, IconGameController, IconPeople } from "../icons";
import { Link } from 'solid-app-router';
import CategoryCard from "../components/CategoryCard";
import ButtonStreamFollow from "../components/ButtonStreamFollow";
import { Category } from "../category";

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

const SidebarSearch: Component<{games: Resource<Category[]>}> = (props) => {
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

const Header = () => {
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

  // TODO: click on Games or Stream button when input is focused and empty.
  // The sidebar will flash
  // Use a timeout?
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

  const buttonClass = "text-gray-200 block bg-gray-900 px-3 pt-1.5 pb-0.5 hover:text-gray-50 focus:text-gray-50 border-b-4 border-gray-900"

  return (
    <div class="fixed top-0 left-0 w-full z-10">
      <header class="bg-gray-700 shadow flex flex-nowrap justify-between">
        <h1>
          <Link class={`ml-5 ${buttonClass}`} href="/" title="Home">Home</Link>
        </h1>
        <div class="flex flex-nowrap">
          <form class="bg-gray-900 mr-5" classList={{"bg-violet-700": sidebar() === Sidebar.Search}} style="padding-bottom: 5px" onSubmit={submitSearch} onReset={resetSearch}>
            <input
              type="search"
              class="bg-gray-200 h-full border-t border-gray-900 hover:bg-gray-50 px-1 align-top"
              placeholder="Search for game"
              value={searchValue()}
              onInput={inputSearch}
              onFocus={[setSidebar, Sidebar.Search]}
              onBlur={inputBlur}
            />
            <button class="px-2.5 pt-1 text-gray-200 bg-gray-900 h-full hover:text-gray-50 focus:text-gray-50" type="submit" title="Search">
              <span class="block w-5"><IconLookingClass /></span>
            </button>
            <button class="hidden" type="reset">Clear</button>
          </form>
          <button
            class={`mr-5 ${buttonClass}`}
            classList={{
              "border-violet-700": sidebar() === Sidebar.Games,
              "text-gray-50": sidebar() === Sidebar.Games,
              "text-gray-200": sidebar() !== Sidebar.Games,
            }}
            onClick={[toggleSidebar, Sidebar.Games]}
            title="Games"
          >
            <span class="block w-5"><IconGameController /></span>
          </button>
          <button
            class={`mr-5 ${buttonClass} ${sidebar() === Sidebar.Streams ? "text-gray-50" : "text-gray-200"}`}
            classList={{
              "border-violet-700": sidebar() === Sidebar.Streams,
              "text-gray-50": sidebar() === Sidebar.Streams,
              "text-gray-200": sidebar() !== Sidebar.Streams,
            }}
            onClick={[toggleSidebar, Sidebar.Streams]} onMouseDown={streamsLiveUpdate}
            title="Streams"
          >
            <span class="block w-5"><IconPeople /></span>
          </button>
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
