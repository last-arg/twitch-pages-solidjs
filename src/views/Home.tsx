import { Component, createResource, createSignal, createEffect, For, Switch, Match } from 'solid-js';
import { HEADER_OPTS } from "../common";
import { Category } from "../category";
import TopCategoryCard from "../components/TopCategoryCard";

type CategoryResponse = {
  data: Category[],
  pagination: {
    cursor?: string
  },
}

const topGamesLimit = 5

const fetchTopGames = async (cursor: string): Promise<CategoryResponse> => {
  const url = `https://api.twitch.tv/helix/games/top?first=${topGamesLimit}&after=${cursor}`;
  if (!import.meta.env.DEV) {
    return (await (await fetch("/tmp/top_games.json")).json());
  } else {
    if (import.meta.env.VITE_TWITCH_ACCESS_TOKEN === undefined) {
      throw "No Twitch access token found";
    }
    return (await (await fetch(url, HEADER_OPTS)).json());
  }
};

const Home: Component = () => {
  const [cursor, setCursor] = createSignal("")
  const [category, setCategory] = createSignal<Category[]>([]);
  const [topGames] = createResource(() => cursor(), fetchTopGames,
    {initialValue: {data: [], pagination: {}}});


  createEffect(() => {
    if (!topGames.loading) {
      setCategory((prev) => [...prev, ...topGames().data])
    }
  })

  return (
    <>
      <h2 class="mt-5">Top games</h2>
      <ul class="flex flex-wrap -mr-2 text-gray-700 mt-5">
        <For each={category()}>
          {(c: Category) => 
            <li class="w-1/3 pb-2 pr-2">
              <TopCategoryCard id={c.id} name={c.name} img_class="w-16"/>
            </li>
          }
        </For>
      </ul>
      <Switch>
        <Match when={topGames.loading}>
          <p>Loading games...</p>
        </Match>
        <Match when={!topGames.loading && topGames().pagination.cursor}>
          <button onClick={() => setCursor(topGames().pagination.cursor ?? "")}>Load more games</button>
        </Match>
        <Match when={!topGames.loading && category().length === 0}>
          <p>Found no games</p>
        </Match>
      </Switch>
    </>
  );
};

export default Home;
