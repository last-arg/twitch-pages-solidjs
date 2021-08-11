import { Component, createResource, createSignal, createEffect, For, Show, Switch, Match, PropsWithChildren, Resource } from 'solid-js';
import { HEADER_OPTS, IMG_WIDTH, IMG_HEIGHT } from "../config";
import { Link, useRouter } from 'solid-app-router';
import { Category, createTwitchImage, IconExternalLink, rootGameStore } from "../common";
import ButtonToggleFollow from "../components/ButtonToggleFollow";

const IMG_STREAM_WIDTH = 440;
const IMG_STREAM_HEIGHT = 248;

const createLiveUserImageUrl = (url_template: string, w: number, h: number): string => {
  return url_template.replace("{width}", w.toString()).replace("{height}", h.toString());
};

interface TitleProps {
  name: string,
  id?: string,
  placeholder?: boolean
}

const CategoryTitle = (props: PropsWithChildren<TitleProps>) => {
  const name = props.name;
  const placeholder = props.placeholder ?? false;
  let img_url = "";
  let link_href = "#";

  if (!props.placeholder) {
      img_url = createTwitchImage(name, IMG_WIDTH, IMG_HEIGHT)
      link_href = "https://www.twitch.tv/directory/game/" + encodeURIComponent(name);
  }

  const [gamesFollowed, setGamesFollowed] = rootGameStore

  return (
    <h1 class="flex items-center text-xl">
      <Link  class="group hover:text-purple-800 hover:underline" href={link_href} external>
        <span class="flex items-center">
          <img class="w-10 mr-3 bg-gray-200" src={img_url} alt="" title={name} width={IMG_WIDTH} height={IMG_HEIGHT} />
          <span class="">{name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span class="text-trueGray-400 group-hover:text-purple-800 -ml-4 w-4"><IconExternalLink /></span>
        </span>
      </Link>
      <Show when={props.id}>{() => {
        const gameIds = gamesFollowed.games.map(({id}) => id)
        return (
          <span class="block ml-8 pl-1 border-l">
            <ButtonToggleFollow name={props.name} id={props.id} isFollowed={gameIds.includes(props.id)}/>
          </span>
        );
      }}</Show>
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
  if (import.meta.env.DEV) {
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

interface StreamProps {
  category_id: string
}

const CategoryStreams = (props: PropsWithChildren<StreamProps>) => {
  const [cursor, setCursor] = createSignal(null);
  const [allStreams, setAllStreams] = createSignal<Stream[]>([]);
  const [streams] = createResource(() => {return {id: props.category_id, cursor: cursor()}}, fetchStreams);

  createEffect(() => {
    if (!streams.loading) {
      setAllStreams((prev) => [...prev, ...streams().data])
    }
  })

  return (
    <>
      <ul class="flex flex-wrap -mx-2">
        <For each={allStreams()}>{(stream: Stream) => {
          const twitch_stream_url = `https://www.twitch.tv/${stream.user_login}`;

          return (
            <li class="w-1/3 px-2 py-3">
              <div class="">
                <Link class="group" href={twitch_stream_url} title={stream.title} external>
                  <div class="relative z-0">
                    <img
                      src={createLiveUserImageUrl(stream.thumbnail_url, IMG_STREAM_WIDTH, IMG_STREAM_HEIGHT)}
                      width={IMG_STREAM_WIDTH} height={IMG_STREAM_HEIGHT}
                    />
                    <p class="absolute bottom-0 left-0 bg-trueGray-800 text-trueGray-100 text-sm px-1 rounded-sm mb-1 ml-1">{stream.viewer_count}</p>
                  </div>
                  <div class="flex justify-between items-center">
                    <p class="truncate flex-shrink w-full-1rem">{stream.title}</p>
                    <span class="block w-4 ml-2 text-trueGray-400 group-hover:text-purple-700"><IconExternalLink /></span>
                  </div>
                </Link>
                <div class="flex mt-1">
                  <Link href={`/${stream.user_login}/videos`}>
                    <img class="w-14" src="https://static-cdn.jtvnw.net/jtv_user_pictures/8a6381c7-d0c0-4576-b179-38bd5ce1d6af-profile_image-300x300.png" width="300" height="300"/>
                  </Link>
                  <div class="flex flex-col justify-between ml-2">
                    <Link href={`/${stream.user_login}/videos`}>{stream.user_name}</Link>
                    <Link class="flex items-center group" href={`${twitch_stream_url}/videos`} external>
                      <p>Videos on Twitch</p>
                      <span class="w-4 ml-1 text-trueGray-400 group-hover:text-purple-700"><IconExternalLink /></span>
                    </Link>
                  </div>
                </div>
              </div>
            </li>
        )}}</For>
      </ul>
      <Show when={!streams.loading && streams().pagination.cursor} fallback={<p>Loading...</p>}>
        <button onClick={async () => setCursor(streams().pagination.cursor)}>Load more streams</button>
      </Show>
    </>
  );
};

const CategoryView = (props: PropsWithChildren<{category: Resource<Category>}>) => {
  const [router] = useRouter();
  const cat_name = decodeURIComponent(router.params.name as string);

  return (
    <main class="px-2">
      <div class="mt-3">
        <Show when={!props.category.loading} fallback={<CategoryTitle name={cat_name} placeholder={true} />}>
          <CategoryTitle name={props.category().name} id={props.category().id} />
        </Show>
      </div>
      <Switch fallback={<p>Not Found</p>}>
        <Match when={props.category.loading}>
          <p>Loading...</p>
        </Match>
        <Match when={!props.category.loading && props.category() !== undefined}>
          <CategoryStreams category_id={props.category().id} />
        </Match>
      </Switch>
    </main>
  );
};

export default CategoryView;
