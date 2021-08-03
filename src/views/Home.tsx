import { Component, createResource, For } from 'solid-js';
import Header from '../components/Header'

const IMG_WIDTH = 143;
const IMG_HEIGHT = 190;

interface Game {
  id: string,
  name: string,
  box_art_url: string,
}

const client_id = "7v5r973dmjp0nd1g43b8hcocj2airz";

const fetchTopGames = async (id): Promise<Game[]> => {
  const url = "https://api.twitch.tv/helix/games/top?first=10";
  let opts = {
    method: "GET",
    headers: {
      "Host": "api.twitch.tv",
      // TODO: remove hardcoded bearer token
      "Authorization": `Bearer ${import.meta.env.VITE_TWITCH_ACCESS_TOKEN}`,
      "Client-id": client_id,
      "Accept": "application/vnd.twitchtv.v5+json",
    }
  };

  if (import.meta.env.DEV) {
    return (await (await fetch("/tmp/top_games.json")).json()).data;
  } else {
    return (await (await fetch(url, opts)).json()).data;
  }
}

const Home: Component = () => {
  const [topGames] = createResource("topGames", fetchTopGames)

  return (
    <>
      <Header/>
      <main>
        <div>
          <h2>Search results</h2>
        </div>
        <div>
          <h2>Top games</h2>
          <ul class="flex flex-wrap">
            <Show when={!topGames.loading} fallback={<li>Loading...</li>}>
              <For each={topGames()}>
                {(game) => {
                  let img_url = game.box_art_url.replace("{width}", IMG_WIDTH).replace("{height}", IMG_HEIGHT);
                  const game_link = `/directory/game/${game.name}`;
                  return (
                    <li>
                      <a href={game_link} title={game.name}>
                        <img src={img_url} alt="" />
                      </a>
                      <p>{game.name}</p>
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
