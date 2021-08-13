import { createMutable } from "solid-js/store";
import { HEADER_OPTS } from "./config";
import {Stream} from "./stream";

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
  if (ids.length === 0) return []
  const url = `https://api.twitch.tv/helix/users?id=${ids.join("&id=")}`;
  return (await (await fetch(url, HEADER_OPTS)).json()).data;
}

// {user_id: profile_image_url}
export type LocalImages = Record<User["id"], {
  url: User["profile_image_url"],
  last_access: number,
}>

export const localImages = createMutable({
  images: JSON.parse(window.localStorage.getItem("images") ?? "{}") as LocalImages,
  lastUpdateDate: (() => {
    const storedLastUpdate = window.localStorage.getItem("last_image_update")
    if (storedLastUpdate) {
      return parseInt(storedLastUpdate, 10)
    }
    return Date.now()
  })(),
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
    // TODO: when to run function clean
    // 1) when page has finished loading
    // 2) on App unmount

    // Remove images that haven't been accessed more than a week
    const weekInMilliseconds = 518400000
    const nowDate = Date.now()
    const updateInterval = new Date(nowDate - this.lastUpdateDate)
    if (updateInterval.getUTCDate() >= 0) {
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

// TODO: live streams data
// TODO: Check liveness of streams between interval
