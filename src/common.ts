import { createMutable } from "solid-js/store";
import { HEADER_OPTS } from "./config";
import {Stream} from "./stream";

const TWITCH_MAX_QUERY_PARAMS = 100

// TODO?: move into category.ts file?
export interface Category {
  id: string,
  name: string,
  box_art_url: string,
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
    // TODO: make sure games are sorted
    this.games.push(game)
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
    // TODO: make sure streams are sorted
    this.streams.push(stream)
    window.localStorage.setItem("streams", JSON.stringify(this.streams));
    fetchAndSetProfileImages([stream.user_id])
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

// TODO?: move to user.ts file?
// https://dev.twitch.tv/docs/api/reference#get-users
interface User {
  id: string,
  display_name: string,
  login: string,
  profile_image_url: string,
  view_count: number,
}

// TODO: make it work also with login names. Or make another function.
// The other function should only need to return one user.
// And I could trim fields/keys from fetchUsers return type
export const fetchUsers = async (ids: string[]): Promise<User[]> => {
  // TODO: twitch user_id limit is 100
  if (ids.length === 0) return []
  const url = `https://api.twitch.tv/helix/users?id=${ids.join("&id=")}`;
  return (await (await fetch(url, HEADER_OPTS)).json()).data;
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

export const localImages = createMutable({
  images: JSON.parse(window.localStorage.getItem("images") ?? "{}") as LocalImages,
  lastUpdateDate: getLocalLastUpdate("last_image_update"),
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
    window.localStorage.setItem("images", JSON.stringify(this.images));
  },
  setValues(images: LocalImages) {
    Object.assign(this.images, images)
    window.localStorage.setItem("images", JSON.stringify(this.images));
  },
  clean() {
    // Remove images that haven't been accessed more than a week
    const weekInMilliseconds = 518400000
    const nowDate = Date.now()
    const timePassedSinceLast = nowDate - this.lastUpdateDate
    if (timePassedSinceLast >= weekInMilliseconds) {
      let has_changed = false
      for (let user_id of Object.keys(this.images)) {
        if ((nowDate - this.images[user_id].last_access) > weekInMilliseconds) {
          has_changed = true
          delete this.images[user_id]
        }
      }

      if (has_changed) {
        window.localStorage.setItem("images", JSON.stringify(this.images));
      }
    }
    this.lastUpdateDate = nowDate
  }
})

export const fetchAndSetProfileImages = async (user_ids: string[]) => {
  if (user_ids.length === 0) return
  const profiles = await fetchUsers(user_ids)
  const last_access = Date.now()
  let images: LocalImages = {}
  for (let {id, profile_image_url} of profiles) {
    images[id] = {
      url: profile_image_url,
      last_access: last_access,
    }
  }
  localImages.setValues(images)
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

export const localLiveStreams = createMutable({
  data: JSON.parse(window.localStorage.getItem("live_streams") ?? "{}") as LocalLive,
  lastUpdate: getLocalLastUpdate("last_live_update"),
  get(user_id: string): LiveObject {
    return this.data[user_id]
  },
  async updateAll() {
    const five_min_ms = 300000
    const timeSinceLastUpdate = Date.now() - this.lastUpdate
    console.log(timeSinceLastUpdate, timeSinceLastUpdate > five_min_ms)
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
      window.localStorage.setItem("live_streams", JSON.stringify(new_data));
      this.data = new_data
    }
    window.localStorage.setItem("last_live_update", this.lastUpdate.toString());
  },
});

