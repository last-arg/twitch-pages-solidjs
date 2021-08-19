import { createResource, createSignal, createEffect, For, Show, Switch, Match, untrack, Component } from 'solid-js';
import { HEADER_OPTS, IMG_WIDTH, IMG_HEIGHT, IMG_STREAM_WIDTH, IMG_STREAM_HEIGHT } from "../config";
import { Link, useParams } from 'solid-app-router';
import { createTwitchImage, localImages, fetchAndSetProfileImages } from "../common";
import { IconSprite } from "../icons";
import ButtonGameFollow from "../components/ButtonGameFollow";
import ButtonStreamFollow from "../components/ButtonStreamFollow";
import { Stream } from "../stream";
import { Category, fetchCategory } from "../category";

const createLiveUserImageUrl = (url_template: string, w: number, h: number): string => {
  return url_template.replace("{width}", w.toString()).replace("{height}", h.toString());
};

interface TitleProps {
  fallbackTitle: string,
  category?: Category,
}

type TitleSignal = {imgUrl: string, linkHref: string, name: string, id?: string }
const CategoryTitle: Component<TitleProps> = (props) => {
  const params = useParams()
  const titleDefault = {imgUrl: "", linkHref: "#", name: decodeURIComponent(params.name), id: undefined}
  const [data, setData] = createSignal<TitleSignal>(titleDefault)

  createEffect(() => {
    if (props.category) {
      const name = props.category.name;
      setData({
        id: props.category.id,
        name: name,
        linkHref: "https://www.twitch.tv/directory/game/" + encodeURI(name),
        imgUrl: createTwitchImage(name, IMG_WIDTH, IMG_HEIGHT)
      })
    }
  })

  createEffect(() => params.name && setData(titleDefault))

  return (
    <h1 class="flex items-center text-xl mt-5">
      <Link class="group hover:text-purple-800 hover:underline" href={data().linkHref}>
        <span class="flex items-center">
          <img class="w-10 mr-3 bg-gray-200" src={data().imgUrl} alt="" width={IMG_WIDTH} height={IMG_HEIGHT} />
          <span>{data().name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <IconSprite id="external-link" class="fill-current text-trueGray-400 group-hover:text-purple-800 -ml-4 w-4 h-4" />
        </span>
      </Link>
      <span class="text-trueGray-400 ml-8 mr-2 border-l h-full w-0">&nbsp;</span>
      <Show when={data().id}>{(cat_id: string) =>
        <ButtonGameFollow class="w-5 h-5 text-trueGray-400 hover:text-violet-500" name={data().name} id={cat_id}/>
      }</Show>
    </h1>
  );
};

interface StreamResponse {
  data: Stream[],
  pagination: {
    cursor?: string
  }
}

type StreamParams = {id: string, cursor?: string}
const fetchStreams = async (params: StreamParams): Promise<StreamResponse> => {
  const cursor = params.cursor ?? "";
  const count = 4;
  const url = `https://api.twitch.tv/helix/streams?game_id=${params.id}&first=${count}&after=${cursor}`;
  if (!import.meta.env.DEV) {
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

const CategoryStreams: Component<StreamProps> = (props) => {
  const [cursor, setCursor] = createSignal<string>("");
  const [allStreams, setAllStreams] = createSignal<Stream[]>([]);
  const [streams] = createResource<StreamResponse, StreamParams>(
    () => {return {id: props.category_id, cursor: cursor()} as StreamParams },
    fetchStreams,
    {initialValue: {data: [], pagination: {}}});

  createEffect(() => {
    if (!streams.loading) {
      setAllStreams((prev) => [...prev, ...streams().data])

      untrack(() => {
        const user_ids = streams().data.map(({user_id}: {user_id: string}) => user_id)
        const image_keys = Object.keys(localImages.images)
        fetchAndSetProfileImages(user_ids.filter((user_id: string) => !image_keys.includes(user_id)))
      })
    }
  })

  // TODO: add category filtering

  return (
    <>
      <ul class="flex flex-wrap -mx-2 -mb-3 mt-2">
        <For each={allStreams()}>{(stream: Stream) => {
          const twitch_stream_url = `https://www.twitch.tv/${stream.user_login}`;
          return (
            <li class="w-1/3 px-2 py-3">
              <div>
                <Link class="group" href={twitch_stream_url} title={stream.title}>
                  <div class="relative z-0">
                    <img
                      src={createLiveUserImageUrl(stream.thumbnail_url, IMG_STREAM_WIDTH, IMG_STREAM_HEIGHT)}
                      width={IMG_STREAM_WIDTH} height={IMG_STREAM_HEIGHT}
                    />
                    <p class="absolute bottom-0 left-0 bg-trueGray-800 text-trueGray-100 text-sm px-1 rounded-sm mb-1 ml-1">{stream.viewer_count} viewers</p>
                  </div>
                  <div class="flex justify-between items-center">
                    <p class="truncate flex-shrink w-full-1rem">{stream.title}</p>
                    <IconSprite id="external-link" class="w-4 h-4 ml-2 text-trueGray-400 group-hover:text-purple-700" />
                  </div>
                </Link>
                <div class="flex mt-1">
                  <Link href={`/${stream.user_login}/videos`}>
                    <img class="w-14" src={localImages.get(stream.user_id)} width="300" height="300"/>
                  </Link>
                  <div class="flex flex-col justify-between ml-2">
                    <div class="flex items-center">
                      <Link href={`/${stream.user_login}/videos`}>{stream.user_name}</Link>
                      <span class="text-trueGray-400 mr-2 ml-4 border-l h-full"></span>
                      <ButtonStreamFollow {...stream} class="w-5 h-5 text-trueGray-400 hover:text-violet-500" />
                    </div>
                    <div>
                      <Link class="flex items-center group" href={`${twitch_stream_url}/videos`}>
                        <p>Videos on Twitch</p>
                        <IconSprite id="external-link" class="w-4 h-4 ml-1 text-trueGray-400 group-hover:text-purple-700" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </li>
        )}}</For>
      </ul>
      <Switch>
        <Match when={streams.loading}>
          <p>Loading streams...</p>
        </Match>
        <Match when={!streams.loading && streams().pagination.cursor}>
          <button onClick={() => setCursor(streams().pagination.cursor ?? "")}>Load more streams</button>
        </Match>
        <Match when={!streams.loading && allStreams().length === 0}>
          <p>Found no streams</p>
        </Match>
      </Switch>
    </>
  );
};

const CategoryView = () => {
  const params = useParams();
  const [category] = createResource<Category | undefined, string>(
    () => params.name, fetchCategory);

  return (
    <>
      <CategoryTitle category={category()} fallbackTitle={decodeURIComponent(params.name)} />
      <Switch fallback={<p>Not Found</p>}>
        <Match when={category.loading}>
          <p>Loading...</p>
        </Match>
        <Match when={!category.loading && category()}>
          <CategoryStreams category_id={category()!.id} />
        </Match>
      </Switch>
    </>
  );
};

export default CategoryView;
