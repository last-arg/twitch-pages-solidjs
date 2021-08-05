import { Component, createResource, createSignal, createEffect, For, Show, Suspense, lazy } from 'solid-js';
import { HEADER_OPTS, IMG_WIDTH, IMG_HEIGHT } from "../config";
import { Link, useRouter } from 'solid-app-router';

const IMG_STREAM_WIDTH = 440;
const IMG_STREAM_HEIGHT = 248;

interface Game {
  id: string,
  name: string,
  box_art_url: string,
}

const createImgUrl = (url_template, width, height) => {
  const w = width || IMG_WIDTH;
  const h = height || IMG_HEIGHT;
  return url_template.replace("{width}", w).replace("{height}", h);
};

const redirectIfInvalidCategory = (category) => {
    if (category.length === 0) {
      console.info(`Could not find category/game '${category.name}'. Redirecting to 'Not Found' page`);
      window.location.replace("/not-found");
    }
};

const CategoryTitle: Component = (props) => {
  const name = props.name;
  let link_href = "#";
  let img_url = "";
  if (props.img_url) {
    img_url = props.img_url;
    link_href = "https://www.twitch.tv/directory/game/" + encodeURIComponent(name);
  }

  return (
    <h1 class="text-xl">
      <Link class="flex items-center" href={link_href} title={name}>
        <img class="w-8 mr-3 bg-gray-200" src={img_url} alt="" title={name} width={IMG_WIDTH} height={IMG_HEIGHT} />
        {name}
      </Link>
    </h1>
  );
};

interface Stream {
  user_login: string,
  user_name: string,
  type: string, // "" (empty string is an error)
  viewer_count: number,
  thumbnail_url: string,
}

interface StreamResponse {
  data: Stream[],
  pagination: {
    cursor?: string
  }
}

const fetchStreams = async (props): Promise<StreamResponse> => {
  const cursor = props.cursor || "";
  const count = 4;
  const url = `https://api.twitch.tv/helix/streams?game_id=${props.id}&first=${count}&after=${cursor}`;
  const result = (await (await fetch(url, HEADER_OPTS)).json());
  return result;
};

interface CategoryState {
  next_cursor?: string,
  streams: Stream[],
}

const CategoryStreams = (props) => {
  const [streams] = createResource({id: props.category_id}, fetchStreams);

  return (
    <Show when={!streams.loading} fallback={<p>Loading...</p>}>
      <ul class="flex flex-wrap">
        <For each={streams().data}> {(stream) => 
          <li class="w-1/3">
            <img
              src={createImgUrl(stream.thumbnail_url, IMG_STREAM_WIDTH, IMG_STREAM_HEIGHT)}
              width={IMG_STREAM_WIDTH} height={IMG_STREAM_HEIGHT}
            />
            <p>
              {stream.viewer_count}
            </p>
            <p>
              {stream.user_name} <Link href={`https://www.twitch.tv/${stream.user_login}`} external>[Twitch]</Link>
            </p>
          </li>
        }</For>
      </ul>
      <Show when={streams().pagination.cursor}>
        <button onClick={async () => {
          fetchStreams({id: props.category_id, cursor: streams.pagination.cursor})}
        }>Load more streams</button>
      </Show>
    </Show>
  );
};

const Game: Component = (props) => {
  const [router] = useRouter();
  const cat_name = decodeURIComponent(router.params.name);

  return (
    <>
      <Show when={props.category} fallback={<CategoryTitle name={cat_name} />}>
        <CategoryTitle name={cat_name} img_url={createImgUrl(props.category.box_art_url)} />
        <CategoryStreams category_id={props.category.id}/>
      </Show>
    </>
  );
};

export default Game;
