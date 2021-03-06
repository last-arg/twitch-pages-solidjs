import { Component, createResource, createSignal, For, Switch, Match, Show, Resource } from 'solid-js';
import { HEADER_OPTS, localGames, localStreams, localImages, fetchAndSetProfileImages, localLiveStreams} from "../common";
import { IconSprite } from "../icons";
import { Link } from 'solid-app-router';
import CategoryCard from "../components/CategoryCard";
import ButtonStreamFollow from "../components/ButtonStreamFollow";
import { Category } from "../category";

const SidebarGames = () => {
  return(
    <ul class="-mb-2">
      <For each={localGames.games}>{(game) => {
        return (
          <Show when={game}>
            <li class="mb-2">
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
    <ul class="-mt-2">
      <For each={localStreams.streams} fallback={<li>No streams</li>}>{(stream) =>
        <Show when={stream}>
          <li class="mt-2 bg-gray-800 flex">
            <Link class="flex flex-grow items-center border-l-6 border-transparent pl-1.5 hover:text-white hover:border-violet-700 hover:underline" href={`/${stream.user_login}/videos`} title={stream.user_name}>
              <img class="w-10" src={localImages.get(stream.user_id)} width="300" height="300" />
              <span class="ml-2 truncate">{stream.user_name}</span>
            </Link>
            <div class="flex items-center border-l-2 border-gray-700">
              <ButtonStreamFollow {...stream} class="w-5 h-5 mx-1.5 text-trueGray-500 hover:text-violet-500" />
              <Link class="mx-1.5 group" href={`https://www.twitch.tv/${stream.user_login}/videos`} title="Videos on Twitch">
                <IconSprite id="external-link" class="w-5 h-5 text-trueGray-500 group-hover:text-purple-500" />
              </Link>
            </div>
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
        <p class="ml-3">Searching...</p>
      </Match>
      <Match when={props.games().length === 0}>
        <p class="ml-3">No results found</p>
      </Match>
      <Match when={props.games().length > 0}>{() => {
        return (<ul class="-mt-2">
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
  const [searchValue, setSearchValue] = createSignal(decodeURIComponent(location.hash.slice(1)));
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
    if (sidebar() !== Sidebar.Search) {
      setSidebar(Sidebar.Search)
    }
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
  // mousedown event happens before blur
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
    [Sidebar.Games]: () => <> <IconSprite id="game-controller" class="fill-current w-4 h-4 mr-2" />Games</>,
    [Sidebar.Search]: () => <> <IconSprite id="looking-class" class="fill-current w-4 h-4 mr-2" />Search</>,
    [Sidebar.Streams]: () => <> <IconSprite id="people" class="fill-current mr-2 w-4 h-4" />Streams</>,
    [Sidebar.Closed]: null,
  };

  const buttonClass = "text-gray-200 block bg-gray-900 px-3 pt-1.5 pb-0.5 hover:text-gray-50 focus:text-gray-50 border-b-5 border-gray-900"

  return (
    <div class="fixed top-0 left-0 w-full z-10">
      <header class="bg-gray-700 shadow flex flex-nowrap justify-between contain-content shadow-md">
        <h1>
          <Link class={`ml-5 ${buttonClass}`} href="/" title="Home">Home</Link>
        </h1>
        <div class="flex flex-nowrap">
          <form class="mr-5 border-b-5 border-gray-900" classList={{"border-violet-700": sidebar() === Sidebar.Search}} onSubmit={submitSearch} onReset={resetSearch}>
            <input
              type="search"
              class="bg-gray-200 h-full border-t border-gray-900 hover:bg-gray-50 px-1 align-top"
              placeholder="Search for game"
              value={searchValue()}
              onInput={inputSearch}
              onFocus={[setSidebar, Sidebar.Search]}
              onBlur={inputBlur}
              onKeyUp={(e: KeyboardEvent) => e.key === "Escape" && setSidebar(Sidebar.Closed)}
            />
            <button class="px-2.5 pt-1 text-gray-200 bg-gray-900 h-full hover:text-gray-50 focus:text-gray-50" type="submit" title="Search">
              <IconSprite id="looking-class" class="fill-current w-5 h-5" />
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
            <IconSprite id="game-controller" class="fill-current w-5 h-5" />
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
            <IconSprite id="people" class="fill-current w-5 h-5" />
          </button>
        </div>
      </header>
      <div class="contain-content pt-12 absolute right-0 top-0 h-screen -z-10 max-w-xs w-full pb-2" classList={{hidden: sidebar() === Sidebar.Closed}}>
        <div class="flex flex-col h-full bg-gray-700 shadow-md">
          <div class="flex justify-between pb-4">
            <h2 class="flex items-center bg-violet-700 px-3 py-1 font-bold text-gray-100">
              {sidebarTitles[sidebar()]}
            </h2>
            <button class="bg-violet-700 px-2.5 text-gray-200 hover:text-gray-50" onClick={[setSidebar, Sidebar.Closed]} title="Close sidebar">
              <IconSprite id="close" class="fill-current w-4 h-4" />
            </button>
          </div>
          <div class="mb-4 overflow-y-auto text-gray-300">
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
      </div>
    </div>
  );
};

export default Header;
