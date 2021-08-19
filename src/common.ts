import { createMutable } from "solid-js/store";
import { Stream } from "./stream";
import { Category } from "./category";
import { User, fetchUsers } from "./user";

const TWITCH_MAX_QUERY_PARAMS = 100

// NOTE: should always be available if solidjs app is able to load
export const twitchToken = localStorage.getItem("twitch_token")

export const clientId = "7v5r973dmjp0nd1g43b8hcocj2airz";
export const HEADER_OPTS = {
  method: "GET",
  headers: {
    "Host": "api.twitch.tv",
    "Authorization": `Bearer ${twitchToken}`,
    "Client-id": clientId,
    "Accept": "application/vnd.twitchtv.v5+json",
  }
};

function getInsertIndex(key: string, value: string, arr: StreamFollow[]): number
function getInsertIndex(key: string, value: string, arr: GameFollow[]): number
function getInsertIndex(key: string, value: string, arr: any): number {
  let insert_index = 0
  for (let obj of arr) {
    if (value < obj[key]) {
      break;
    }
    insert_index += 1
  }
  return insert_index
}

type GameFollow = Pick<Category, "id" | "name">
export const localGames = createMutable({
  games: JSON.parse(window.localStorage.getItem("games") ?? "[]") as GameFollow[],
  get gameIds(): string[] {
    return this.games.map((game: GameFollow) => game.id)
  },
  isFollowed(id: string): boolean {
    return this.gameIds.includes(id)
  },
  followGame(game: GameFollow) {
    this.games.splice(getInsertIndex("name", game.name, this.games), 0, game)
    window.localStorage.setItem("games", JSON.stringify(this.games));
  },
  unfollowGame(id: string) {
    const index = this.gameIds.indexOf(id)
    if (index !== -1) {
      this.games.splice(index, 1)
      window.localStorage.setItem("games", JSON.stringify(this.games));
    }
  }
});

export type StreamFollow = Pick<Stream, "user_id" | "user_login" | "user_name">

export const localStreams = createMutable({
  streams: JSON.parse(window.localStorage.getItem("streams") ?? "[]") as StreamFollow[],
  get streamIds(): string[] {
    return this.streams.map((stream: StreamFollow) => stream.user_id)
  },
  isFollowed(id: string): boolean {
    return this.streamIds.includes(id)
  },
  follow(stream: StreamFollow) {
    this.streams.splice(getInsertIndex("user_name", stream.user_name, this.streams), 0, stream)
    window.localStorage.setItem("streams", JSON.stringify(this.streams));
  },
  unfollow(id: string) {
    const index = this.streamIds.indexOf(id)
    if (index !== -1) {
      this.streams.splice(index, 1)
      window.localStorage.setItem("streams", JSON.stringify(this.streams));
    }
  }
});

export const createTwitchImage = (name: string, width: number, height: number): string => {
  return `https://static-cdn.jtvnw.net/ttv-boxart/${name}-${width}x${height}.jpg`;
}

// {user_id: profile_image_url}
export type LocalImages = Record<User["id"], {
  url: User["profile_image_url"],
  last_access: number,
}>

const getLocalLastUpdate = (key: string): number => {
  const storedLastUpdate = window.localStorage.getItem(key)
  if (storedLastUpdate) {
    return parseInt(storedLastUpdate, 10)
  }
  const now = Date.now()
  window.localStorage.setItem(key, now.toString());
  return now
};

const key_images = "images"
const key_images_last_update = `${key_images}_last_update`
export const localImages = createMutable({
  images: JSON.parse(window.localStorage.getItem(key_images) ?? "{}") as LocalImages,
  lastUpdate: getLocalLastUpdate(key_images_last_update),
  get getAll() {
    return this.images
  },
  get(key: string): string {
    if (this.images[key]) {
      this.images[key].last_access = Date.now()
      return this.images[key].url
    }
    return ""
  },
  set(key: string, value: string) {
    this.images[key] = {
      url: value,
      last_access: Date.now(),
    };
    window.localStorage.setItem(key_images, JSON.stringify(this.images));
  },
  setValues(images: LocalImages) {
    Object.assign(this.images, images)
    window.localStorage.setItem(key_images, JSON.stringify(this.images));
  },
  clean() {
    // Remove images that haven't been accessed more than a week
    const weekInMilliseconds = 518400000
    const nowDate = Date.now()
    const timePassedSinceLast = nowDate - this.lastUpdate
    if (timePassedSinceLast >= weekInMilliseconds) {
      let has_changed = false
      for (let user_id of Object.keys(this.images)) {
        if ((nowDate - this.images[user_id].last_access) > weekInMilliseconds) {
          has_changed = true
          delete this.images[user_id]
        }
      }

      if (has_changed) {
        window.localStorage.setItem(key_images, JSON.stringify(this.images));
      }
    }
    this.lastUpdate = nowDate
  }
})

export const fetchAndSetProfileImages = async (user_ids: string[]) => {
  if (user_ids.length === 0) return
  const last_access = Date.now()
  const batch_count = Math.ceil(user_ids.length / TWITCH_MAX_QUERY_PARAMS)

  for (let i = 0; i < batch_count; i+=1) {
    const start = i * TWITCH_MAX_QUERY_PARAMS
    const end = start + TWITCH_MAX_QUERY_PARAMS
    const profiles = await fetchUsers(user_ids.slice(start, end))
    let new_data: LocalImages = {}
    for (let {id, profile_image_url} of profiles) {
      new_data[id] = {
        url: profile_image_url,
        last_access: last_access,
      }
    }
    localImages.setValues(new_data)
  }
};

// https://dev.twitch.tv/docs/api/reference#get-streams
// NOTE: Twitch API has a limit 100 on how many user_ids can be added into one request
const fetchStreamsByUserIds = async (userIds: string[]): Promise<Stream[]> => {
  if (userIds.length === 0) return []
  const url = `https://api.twitch.tv/helix/streams?user_id=${userIds.join("&user_id=")}&first=100`;
  return (await (await fetch(url, HEADER_OPTS)).json()).data;
};

type LiveObject = Stream["game_name"]
type LocalLive = Record<Stream["user_id"], LiveObject>

const key_live_streams = "streams_live"
const key_live_streams_last_update = `${key_live_streams}_last_update`
export const localLiveStreams = createMutable({
  data: JSON.parse(window.localStorage.getItem(key_live_streams) ?? "{}") as LocalLive,
  lastUpdate: getLocalLastUpdate(key_live_streams_last_update),
  get(user_id: string): LiveObject {
    return this.data[user_id]
  },
  set(user_id: string, value: LiveObject) {
    this.data[user_id] = value
    window.localStorage.setItem(key_live_streams, JSON.stringify(this.data));
  },
  remove(user_id: string) {
    delete this.data[user_id]
    window.localStorage.setItem(key_live_streams, JSON.stringify(this.data));
  },
  async updateAll() {
    const five_min_ms = 300000
    const dateNow = Date.now()
    const timeSinceLastUpdate = dateNow - this.lastUpdate
    if (timeSinceLastUpdate > five_min_ms) {
      const user_ids = localStreams.streams.map(({user_id}:{user_id: string}) => user_id)
      const batch_count = Math.ceil(user_ids.length / TWITCH_MAX_QUERY_PARAMS)
      let new_data: LocalLive = {}
      for (let i = 0; i < batch_count; i+=1) {
        const ids_batch = user_ids.slice(i * TWITCH_MAX_QUERY_PARAMS, i * TWITCH_MAX_QUERY_PARAMS + TWITCH_MAX_QUERY_PARAMS)
        const streams = await fetchStreamsByUserIds(ids_batch)
        for (let {user_id, game_name, type} of streams) {
          if (type === "live") {
            new_data[user_id] = game_name 
          }
        }
      }
      if (batch_count > 0) {
        this.data = new_data
        window.localStorage.setItem(key_live_streams, JSON.stringify(this.data));
      }
      window.localStorage.setItem(key_live_streams_last_update, dateNow.toString());
    }
  },
});

