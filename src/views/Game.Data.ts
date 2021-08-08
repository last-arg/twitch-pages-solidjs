import { createResource, Component, PropsWithChildren } from "solid-js";
import { HEADER_OPTS } from "../config";
import { Game } from "../common";

const fetchCategory = async (category): Promise<Game> => {
  const url = `https://api.twitch.tv/helix/games?name=${category}`;
  const result = (await (await fetch(url, HEADER_OPTS)).json()).data;
  return result[0];
};

const GameData = (props) => {
  const [category] = createResource(props.params.name, fetchCategory);
  return {
    get category() {
      return category;
    }
  };
};

export default GameData;

