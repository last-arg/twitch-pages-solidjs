import { createMutable } from "solid-js/store";
import { HEADER_OPTS } from "./config";

export interface Category {
  id: string,
  name: string,
  box_art_url: string,
}

interface GameFollow {
  id: string,
  name: string,
}

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

export interface StreamFollow {
  user_id: string,
  user_login: string,
  user_name: string,
}

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

export interface LocalImages {
  //    user_id: profile_image_url
  [user_id: string]: string,
}

// TODO: remove unused images from localStorage
// 1) when page is opened, reloaded, closed
// 2) somekind of interval: hours, days, ...
export const localImages = createMutable({
  images: JSON.parse(window.localStorage.getItem("images") ?? "{}") as LocalImages,
  get getAll() {
    return this.images
  },
  get(key: string): string {
    return this.images[key] ?? ""
  },
  set(key: string, value: string) {
    this.images[key] = value;
    window.localStorage.setItem("images", JSON.stringify(this.images));
  },
  setValues(images: LocalImages) {
    Object.assign(this.images, images)
    window.localStorage.setItem("images", JSON.stringify(this.images));
  }
})

export const fetchAndSetProfileImages = async (user_ids: string[]) => {
  if (user_ids.length === 0) return
  const profiles = await fetchUsers(user_ids)
  let images: LocalImages = {}
  for (let p of profiles) {
    images[p.id] = p.profile_image_url
  }
  localImages.setValues(images)
};

// TODO: live streams data
// TODO: Check liveness of streams between interval
