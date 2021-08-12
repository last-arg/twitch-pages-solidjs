export interface Stream {
  user_id: string,
  user_login: string,
  user_name: string,
  type: string, // "" (empty string is an error)
  viewer_count: number,
  thumbnail_url: string,
  title: string,
  game_id: string,
}
