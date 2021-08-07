import { Component, createResource, createSignal, createEffect, For, Show } from 'solid-js';
import { HEADER_OPTS, IMG_WIDTH, IMG_HEIGHT } from "../config";
import { Link, useRouter } from 'solid-app-router';
import { createTwitchImage } from "../common";

const IMG_STREAM_WIDTH = 440;
const IMG_STREAM_HEIGHT = 248;

const createLiveUserImageUrl = (url_template: string, w: number, h: number): string => {
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
  const img_url = createTwitchImage(name, IMG_WIDTH, IMG_HEIGHT)
  const link_href = "https://www.twitch.tv/directory/game/" + encodeURIComponent(name);

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
  title: string,
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
  if (!import.meta.env.DEV) {
    return (await (await fetch("/tmp/top_category.json")).json());
  } else {
    if (import.meta.env.VITE_TWITCH_ACCESS_TOKEN === undefined) {
      throw "No Twitch access token found";
    }
    return (await (await fetch(url, HEADER_OPTS)).json());
  }
};

interface CategoryState {
  next_cursor?: string,
  streams: Stream[],
}

const CategoryStreams = (props) => {
  const [category, setCategory] = createSignal({next_cursor: null, streams: []});
  const [streams] = createResource({id: props.category_id}, fetchStreams);

  createEffect(() =>
    !streams.loading && setCategory({streams: streams().data, cursor: streams().pagination.cursor}))

  return (
    <Show when={!streams.loading} fallback={<p>Loading...</p>}>
      <ul class="flex flex-wrap">
        <For each={category().streams}> {(stream) => {
          console.log(stream)
          const twitch_stream_url = `https://www.twitch.tv/${stream.user_login}`;

          return (<li class="w-1/3">
            <Link href={twitch_stream_url} title={`Go to ${stream.user_name}'s stream`} external>
              <img
                src={createLiveUserImageUrl(stream.thumbnail_url, IMG_STREAM_WIDTH, IMG_STREAM_HEIGHT)}
                width={IMG_STREAM_WIDTH} height={IMG_STREAM_HEIGHT}
              />
            </Link>

            <p class="truncate">
              <Link href={twitch_stream_url} title={stream.title}>
                {stream.title}
              </Link>
            </p>
            <p>
              {stream.viewer_count}
            </p>
            <p>
              {stream.user_name} <Link href={`${twitch_stream_url}/videos`} external>[Twitch videos]</Link>
            </p>
          </li>
        )}}</For>
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

  // TODO: if invalid url(category/game) display 'Not Found' message
  return (
    <>
      <Show when={props.category} fallback={<CategoryTitle name={cat_name} />}>
        <CategoryTitle name={cat_name} />
        <CategoryStreams category_id={props.category.id}/>
      </Show>
    </>
  );
};

export default Game;
