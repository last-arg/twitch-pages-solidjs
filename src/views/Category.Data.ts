import { createResource, Component, PropsWithChildren, Resource } from "solid-js";
import { DataFnParams } from 'solid-app-router';
import { HEADER_OPTS } from "../config";
import { Category } from "../common";

const fetchCategory = async (category: string): Promise<Category> => {
  const url = `https://api.twitch.tv/helix/games?name=${category}`;
  const result = (await (await fetch(url, HEADER_OPTS)).json()).data;
  return result[0];
};

interface CategoryParams {
  name: string
}

const CategoryData = (props: DataFnParams<CategoryParams>)  => {
  const [category] = createResource(props.params.name, fetchCategory);
  return {
    get category() {
      return category;
    }
  };
};

export default CategoryData;

