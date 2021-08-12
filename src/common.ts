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
  get count(): number {
    return this.games.length;
  },
  get gameIds(): string[] {
    return this.games.map((game: GameFollow) => game.id)
  },
  isFollowed(id: string): boolean {
    return this.gameIds.includes(id)
  },
  followGame(game: {id: string, name: string}) {
    this.games.push(game)
    window.localStorage.setItem("games", JSON.stringify(this.games));
  },
  unfollowGame(id: string) {
    const index = this.games.findIndex((cat: GameFollow) => cat.id === id)
    if (index !== -1) {
      // this.games = [...this.games.slice(0, index), ...this.games.slice(index+1)]
      this.games.splice(index, 1)
      window.localStorage.setItem("games", JSON.stringify(this.games));
    }

  }
});


export const createTwitchImage = (name: string, width: number, height: number): string => {
  return `https://static-cdn.jtvnw.net/ttv-boxart/${name}-${width}x${height}.jpg`;
}
