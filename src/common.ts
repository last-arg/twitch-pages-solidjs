import { createMutable } from "solid-js/store";

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
    this.streams.push(stream)
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
