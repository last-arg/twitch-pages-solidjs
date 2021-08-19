import { Component, createResource, createSignal, createEffect, For, Show, Match, Switch } from 'solid-js';
import { HEADER_OPTS, IMG_WIDTH, IMG_HEIGHT, IMG_STREAM_WIDTH, IMG_STREAM_HEIGHT } from "../config";
import { Link, useParams } from 'solid-app-router';
import { createTwitchImage } from "../common";
import { fetchUser, User } from "../user";
import { IconSprite } from "../icons";
import ButtonStreamFollow from "../components/ButtonStreamFollow";

interface Video {
  title: string,
  duration: string,
  thumbnail_url: string,
  url: string,
  published_at: string,
  type: "upload" | "archive" | "highlight",
  viewable: "public" | "private",
}

type VideosResponse = {
  data: Video[],
  pagination: {
    cursor?: string
  },
}

const fetchVideos = async ({user_id, cursor = ""}: {user_id: string, cursor: string}): Promise<VideosResponse> => {
  const url = `https://api.twitch.tv/helix/videos?user_id=${user_id}&first=10&after=${cursor}`;
  return (await (await fetch(url, HEADER_OPTS)).json());
}

const VideoList: Component<{user_id: string}> = (props) => {
  const [cursor, setCursor] = createSignal("")
  const [selected, setSelected] = createSignal({archive: true, upload: false, highlight: false})
  const [videos, setVideos] = createSignal<{data: Video[], uploadLength: number, archiveLength: number, highlightLength: number, }>({data: [], uploadLength: 0, archiveLength: 0, highlightLength: 0})
  const [videosResp] = createResource(() => {return {user_id: props.user_id, cursor: cursor()}}, fetchVideos,
    {initialValue: {data: [], pagination: {}}});


  const twitchDateToString = (d: Date): string => {
    const round = (nr: number): number => {
      const nr_floor = Math.floor(nr)
      return (nr - nr_floor) > 0.5 ? Math.ceil(nr) : nr_floor;
    }
    const seconds_f = (Date.now() - d.getTime()) / 1000
    const minutes_f = seconds_f / 60
    const hours_f = minutes_f / 60
    const days_f = hours_f / 24
    const minutes = round(minutes_f)
    const hours = round(hours_f)
    const days = round(days_f)
    const weeks = round(days_f / 7)
    const months = round(days_f / 30)
    const years = round(days_f / 365)

    let result_str = "1 minute ago"
    if (years > 0 && months > 11) {
      result_str = (years === 1) ? "1 year ago" : `${years} years ago`
    } else if (months > 0 && weeks > 4) {
      result_str = (months === 1) ? "1 month ago" : `${months} months ago`
    } else if (weeks > 0 && days > 6) {
      result_str = (weeks === 1) ? "1 week ago" : `${weeks} weeks ago`
    } else if (days > 0 && hours > 23) {
      result_str = (days === 1) ? "Yesterday" : `${days} days ago`
    } else if (hours > 0 && minutes > 59) {
      result_str = (hours === 1) ? "1 hour ago" : `${hours} hours ago`
    } else if (minutes > 1) {
      result_str = `${minutes} minutes ago`
    }

    return result_str
  };

  createEffect(() => {
    if (!videosResp.loading) {
      let newVideos: Video[] = []
      let archiveLength = 0
      let uploadLength = 0
      let highlightLength = 0
      for (let video of videosResp().data) {
        if (video.viewable === "public") {
          const {title, duration, thumbnail_url, url, published_at, type, viewable} = video
          newVideos.push({title, duration, thumbnail_url, url, published_at, type, viewable})

          if (video.type === "highlight") {
            highlightLength += 1
          } else if (video.type === "upload") {
            uploadLength += 1
          } else if (video.type === "archive") {
            archiveLength += 1
          }
        }
      }
      setVideos((prev) => {
        return {
          data: prev.data.concat(newVideos),
          highlightLength: prev.highlightLength + highlightLength,
          archiveLength: prev.archiveLength + archiveLength,
          uploadLength: prev.uploadLength + uploadLength}
      })
    }
  })

  const activeVideoTypes = (): number => {
    let count = 0
    for (const value of Object.values(selected())) {
      count += value ? 1 : 0
    }
    return count
  }

  const colors = {
    archive: {
      default: "bg-lime-200",
      active: "bg-lime-300", // hover:bg-lime-300
      unchecked: "bg-lime-50",
    },
    upload: {
      default: "bg-sky-200",
      active: "bg-sky-300", // hover:bg-sky-300
      unchecked: "bg-sky-50",
    },
    highlight: {
      default: "bg-amber-200",
      active: "bg-amber-300", // hover:bg-amber-300
      unchecked: "bg-amber-50",
    },
  }

  const CheckButton: Component<Pick<Video, "type">> = (props) => {
    const color = colors[props.type]
    return <button class={`${ selected()[props.type] == true ? color.active : color.default} hover:${color.active} p-1 rounded-full border-2 border-white h-9 w-9 relative z-10`} type="button"
      aria-pressed={selected()[props.type] == true}
      onClick={() => {
        if (selected()[props.type]) {
          if (activeVideoTypes() > 1) {
            setSelected((prev) => { return {...prev, [props.type]: false} })
          }
        } else {
          setSelected((prev) => { return {...prev, [props.type]: true} })
        }
      }}>
      <span class={`${ selected()[props.type] == true ? color.active : color.unchecked} h-full w-full rounded-full block border-2 border-white`}>&nbsp;</span>
    </button>
  }

  const videoTypeString = {
    archive: "Archive",
    upload: "Upload",
    highlight: "Highlight",
  }

  const icons = {
    archive: (size: number = 5) => <IconSprite id="video-camera" class={`fill-current h-${size} w-${size} text-lime-900`} />,
    upload: (size: number = 5) => <IconSprite id="video-upload" class={`fill-current h-${size} w-${size} text-sky-900`} />,
    highlight: (size: number = 5) => <IconSprite id="video-reel" class={`fill-current h-${size} w-${size} text-amber-900`} />,
  };

  const ButtonTitle: Component<Pick<Video, "type">> = (props) => {
    const color = colors[props.type]
    return <button class={`pl-3.5 pr-2 py-0.5 rounded-r -ml-2 ${color.default} hover:${color.active} flex items-center`} type="button"
      onClick={() => {
        let newSelected = { archive: false, upload: false, highlight: false }
        newSelected[props.type] = true
        setSelected(newSelected)
      }}
    >{icons[props.type]} <span class="ml-1">{props.children}</span></button>
  }

  const totalDisplayedVideos = () => {
    let total = 0
    for (const key of Object.keys(selected())) {
      const sel_key = key // @ts-ignore
      if (selected()[sel_key]) {
        const k = `${key}Length` // @ts-ignore
        total += videos()[k]
      }
    }
    return total
  }

  const videosListItemClass = `mx-2 rounded flex items-center`;

  return (
    <>
      <div class="flex items-center text-base">
        <h2>Videos:</h2>
        <ul class="videos-selected flex">
          <li class={videosListItemClass}>
            <CheckButton type="archive" />
            <ButtonTitle type="archive">Archives ({videos().archiveLength})</ButtonTitle>
          </li>
          <li class={videosListItemClass}>
            <CheckButton type="upload" />
            <ButtonTitle type="upload">Uploads ({videos().uploadLength})</ButtonTitle>
          </li>
          <li class={videosListItemClass}>
            <CheckButton type="highlight" />
            <ButtonTitle type="highlight">Hightlights ({videos().highlightLength})</ButtonTitle>
          </li>
        </ul>
        <span class="border-l mx-2">&nbsp;</span>
        <div>
          <button type="button" class=""
            onClick={() => setSelected({archive: true, upload: true, highlight: true})}
          >Show all</button>
        </div>
      </div>
      <div class="mt-6">
        <Show when={totalDisplayedVideos() === 0}>
          No videos to display
        </Show>
        <ul class="flex flex-wrap -mb-6 -ml-3">
          <For each={videos().data}>{(video) => {
            const videoDate = new Date(video.published_at)
            return (
              <Show when={selected()[video.type]}>
                <li class={`w-1/3 pl-3 pb-6`}>
                  <Link class="hover:text-violet-700 hover:underline" href={video.url} title={video.title}>
                    <div class="relative">
                      <img src={video.thumbnail_url.replace("%{width}", IMG_STREAM_WIDTH.toString()).replace("%{height}", IMG_STREAM_HEIGHT.toString())} width={IMG_STREAM_WIDTH} height={IMG_STREAM_HEIGHT} />
                      <span class={`opacity-90 absolute top-0 left-0 mt-1.5 ml-1.5 px-1 rounded-sm ${colors[video.type].default}`} title={`${videoTypeString[video.type]} video`}>
                        {icons[video.type](4)}
                      </span>
                      <div class="absolute bottom-0 left-0 flex justify-between w-full mb-1.5 text-gray-50">
                        <span class="px-1 ml-1.5 text-sm bg-gray-800 rounded-sm bg-opacity-70">{video.duration.slice(0,-1).replace("h", ":").replace("m", ":")}</span>
                        <span class="px-1 mr-1.5 text-sm bg-gray-800 rounded-sm bg-opacity-70" title={videoDate.toString()}>{twitchDateToString(videoDate)}</span>
                      </div>
                    </div>
                    <div class="flex items-center">
                      <p class="truncate">{video.title}</p>
                      <span class="ml-1 w-4 h-4">
                        <IconSprite id="external-link" class="fill-current w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                </li>
              </Show>
            );
          }}</For>
        </ul>
        <div class="mt-10 text-center text-base">
          <Switch>
            <Match when={videosResp.loading}>
              <p class="py-1 border-2 border-gray-300">Loading videos...</p>
            </Match>
            <Match when={!videosResp.loading && videosResp().pagination.cursor}>
              <button type="button" class="border-2 py-1 border-violet-600 block w-full hover:bg-violet-600 hover:text-gray-50" onClick={() => setCursor(videosResp().pagination.cursor ?? "")}>Load more videos</button>
            </Match>
            <Match when={!videosResp.loading && videos().data.length === 0}>
              <p>Found no videos</p>
            </Match>
          </Switch>
        </div>
      </div>
    </>
  );
}

interface TitleProps {
  fallbackTitle: string,
  user?: User,
}

type TitleSignal = {imgUrl: string, linkHref: string, name: string, id?: string }
const UserTitle: Component<TitleProps> = (props) => {
  const params = useParams()
  const titleDefault = {imgUrl: "", linkHref: "#", name: decodeURIComponent(params.name), id: undefined}
  const [data, setData] = createSignal<TitleSignal>(titleDefault)

  createEffect(() => {
    if (props.user) {
      setData({
        id: props.user.id,
        name: props.user.display_name,
        linkHref: `https://www.twitch.tv/${props.user.login}/videos`,
        imgUrl: props.user.profile_image_url
      })
    }
  })

  createEffect(() => params.name && setData(titleDefault))

  return (
    <h1 class="flex items-center text-xl">
      <Link class="group hover:text-purple-800 hover:underline" href={data().linkHref}>
        <span class="flex items-center">
          <img class="w-10 mr-3" src={data().imgUrl} alt="" width="300" height="300" />
          <span>{data().name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <IconSprite id="external-link" class="fill-current text-trueGray-400 group-hover:text-purple-800 -ml-4 w-4 h-4" />
        </span>
      </Link>
      <span class="text-trueGray-400 ml-8 mr-2 border-l h-full w-0">&nbsp;</span>
      <Show when={props.user}>{(user) =>
        <ButtonStreamFollow class="w-5 h-5 text-trueGray-400 hover:text-violet-500" user_login={user.login} user_name={user.display_name} user_id={user.id} />
      }</Show>
    </h1>
  );
};

const UserVideos: Component = (props) => {
  const params = useParams()
  const username = decodeURIComponent(params.name);
  const [user] = createResource<User | undefined, string>(() => params.name, fetchUser, {initialValue: undefined})

  // TODO: make video buttons differet colors
  // TODO: add icons to video buttons
  // TODO: add video type (color, icon) to video cards
  // TODO: if live link to twitch.tv user's video page

  return (
    <main>
      <UserTitle user={user()} fallbackTitle={decodeURIComponent(params.name)} />
      <Switch fallback={<p>Not Found</p>}>
        <Match when={user.loading}>
          <p>Loading...</p>
        </Match>
        <Match when={!user.loading && user()}>
          <VideoList user_id={user()!.id} />
        </Match>
      </Switch>
    </main>
  );
};

export default UserVideos;
