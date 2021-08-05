import { createResource, Component, PropsWithChildren } from "solid-js";
import { HEADER_OPTS } from "../config";

interface Game {
  id: string,
  name: string,
  box_art_url: string,
}

interface Props {
  params: {
    name: string
  },
}

const fetchCategory = async (category): Promise<Game[]> => {
  const url = `https://api.twitch.tv/helix/games?name=${category}`;
  const result = (await (await fetch(url, HEADER_OPTS)).json()).data;
  return result[0];
};

const GameData = (props) => {
  // const [category] = createResource(() => props.params.name, fetchCategory);
  const [category] = createResource(props.params.name, fetchCategory);
  return {
    get category() {
      return category();
    }
  };
};

export default GameData;

