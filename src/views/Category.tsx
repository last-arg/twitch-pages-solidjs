import { createResource, createSignal, createEffect, For, Show, Switch, Match, PropsWithChildren } from 'solid-js';
import { HEADER_OPTS, IMG_WIDTH, IMG_HEIGHT } from "../config";
import { Link, useParams } from 'solid-app-router';
import { Category, createTwitchImage } from "../common";
import { IconExternalLink, IconFollow, IconUnfollow } from "../icons";
import ButtonGameFollow from "../components/ButtonGameFollow";
import ButtonStreamFollow from "../components/ButtonStreamFollow";
import {Stream} from "../stream";

const IMG_STREAM_WIDTH = 440;
const IMG_STREAM_HEIGHT = 248;

const createLiveUserImageUrl = (url_template: string, w: number, h: number): string => {
  return url_template.replace("{width}", w.toString()).replace("{height}", h.toString());
};

interface TitleProps {
  fallbackName: string,
  category: any
}

const CategoryTitle = (props: PropsWithChildren<TitleProps>) => {
  const [data, setData] = createSignal({imgUrl: "", linkHref: "#", name: props.fallbackName, id: null})
  createEffect(() => {
    if (!props.category.loading) {
      const name = props.category().name;
      setData({
        id: props.category().id,
        name: name,
        linkHref: "https://www.twitch.tv/directory/game/" + encodeURIComponent(name),
        imgUrl: createTwitchImage(name, IMG_WIDTH, IMG_HEIGHT)
      })
    }
  })

  return (
    <h1 class="flex items-center text-xl">
      <Link class="group hover:text-purple-800 hover:underline" href={data().linkHref}>
        <span class="flex items-center">
          <img class="w-10 mr-3 bg-gray-200" src={data().imgUrl} alt="" width={IMG_WIDTH} height={IMG_HEIGHT} />
          <span>{data().name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span class="block text-trueGray-400 group-hover:text-purple-800 -ml-4 w-4"><IconExternalLink /></span>
        </span>
      </Link>
      <span class="text-trueGray-400 ml-8 mr-2 border-l h-full w-0">&nbsp;</span>
      <Show when={data().id}>{(cat_id) => {

        return (
          <ButtonGameFollow classExtra="w-5 h-5" name={data().name} id={cat_id}/>
        );
      }}</Show>
    </h1>
  );
};

interface StreamResponse {
  data: Stream[],
  pagination: {
    cursor?: string
  }
}

const fetchStreams = async (props: {id: string, cursor?: string}): Promise<StreamResponse> => {
  const cursor = props.cursor ?? "";
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

interface StreamProps {
  category_id: string
}

const CategoryStreams = (props: PropsWithChildren<StreamProps>) => {
  const [cursor, setCursor] = createSignal<string | null>(null);
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
                <Link class="group" href={twitch_stream_url} title={stream.title}>
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
                    <div class="flex items-center">
                      <Link href={`/${stream.user_login}/videos`}>{stream.user_name}</Link>
                      <span class="text-trueGray-400 mr-2 ml-4 border-l h-full"></span>
                      <ButtonStreamFollow {...stream} />
                    </div>
                    <div>
                      <Link class="flex items-center group" href={`${twitch_stream_url}/videos`}>
                        <p>Videos on Twitch</p>
                        <span class="block w-4 ml-1 text-trueGray-400 group-hover:text-purple-700"><IconExternalLink /></span>
                      </Link>
                    </div>
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

const fetchCategory = async (category: string): Promise<Category> => {
  const url = `https://api.twitch.tv/helix/games?name=${category}`;
  const result = (await (await fetch(url, HEADER_OPTS)).json()).data;
  return result[0];
};

const CategoryView = () => {
  const params = useParams();
  const fallbackName = decodeURIComponent(useParams().name)
  const [category] = createResource(() => decodeURIComponent(params.name), fetchCategory);

  return (
    <main class="px-2">
      <CategoryTitle category={category} fallbackName={fallbackName} />
      <Switch fallback={<p>Not Found</p>}>
        <Match when={category.loading}>
          <p>Loading...</p>
        </Match>
        <Match when={!category.loading && category() !== undefined}>
          <CategoryStreams category_id={category().id} />
        </Match>
      </Switch>
    </main>
  );
};

export default CategoryView;
