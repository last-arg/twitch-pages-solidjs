import { HEADER_OPTS } from "./common";

// https://dev.twitch.tv/docs/api/reference#get-users
export interface User {
  id: string,
  display_name: string,
  login: string,
  profile_image_url: string,
  view_count: number,
}

export const fetchUsers = async (ids: string[]): Promise<User[]> => {
  if (ids.length === 0) return []
  const url = `https://api.twitch.tv/helix/users?id=${ids.join("&id=")}`;
  return (await (await fetch(url, HEADER_OPTS)).json()).data;
}

export const fetchUser = async (username: string): Promise<User | undefined> => {
  if (username.length === 0) return undefined
  const url = `https://api.twitch.tv/helix/users?login=${username}`;
  return (await (await fetch(url, HEADER_OPTS)).json()).data[0];
}

