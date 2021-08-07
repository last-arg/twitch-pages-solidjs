
export const createTwitchImage = (name: string, width: number, height: number): string => {
  return `https://static-cdn.jtvnw.net/ttv-boxart/${name}-${width}x${height}.jpg`;
}

export interface Game {
  id: string,
  name: string,
  box_art_url: string,
}
