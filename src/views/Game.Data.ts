import { createResource, Component, PropsWithChildren, Resource } from "solid-js";
import { DataFnParams } from 'solid-app-router';
import { HEADER_OPTS } from "../config";
import { Game } from "../common";

const fetchCategory = async (category: string): Promise<Game> => {
  const url = `https://api.twitch.tv/helix/games?name=${category}`;
  const result = (await (await fetch(url, HEADER_OPTS)).json()).data;
  return result[0];
};

interface GameParams {
  name: string
}

const GameData = (props: DataFnParams<GameParams>)  => {
  const [category] = createResource(props.params.name, fetchCategory);
  return {
    get category() {
      return category;
    }
  };
};

export default GameData;

