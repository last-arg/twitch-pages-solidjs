import { Component } from 'solid-js';
import { IMG_WIDTH, IMG_HEIGHT } from '../config';
import { createTwitchImage } from '../common';
import { IconExternalLink } from '../icons';
import { Link } from "solid-app-router";
import ButtonGameFollow from "./ButtonGameFollow";

const CategoryCard: Component<{id: string, name: string, img_class: string}> = (props) => {
  const id = props.id;
  const name = props.name;
  const encoded_name = encodeURI(name);
  let img_url = createTwitchImage(encoded_name, IMG_WIDTH, IMG_HEIGHT);
  const game_link = `/directory/game/${encoded_name}`;

  return (
    <div class="bg-gray-800 flex">
      <Link class="flex flex-grow hover:text-gray-50 hover:underline border-l-6 border-transparent hover:border-violet-700" href={game_link} title={name}>
        <div class="flex-grow flex items-center ml-1.5">
          <img class={`${props.img_class}`} src={img_url} alt="" width={IMG_WIDTH} height={IMG_HEIGHT} />
          <p class="mx-3 text-lg line-clamp-2">{name}</p>
        </div>
      </Link>
      <div class="flex flex-col justify-between py-1.5 px-1.5 border-l-2 border-gray-700">
        <ButtonGameFollow class="w-5 h-5 text-trueGray-500  hover:text-violet-500" name={name} id={id} />
        <Link class="text-trueGray-500 w-5 h-5 hover:text-violet-500" href={`https://www.twitch.tv${game_link}`} title="Open game in Twitch" onClick={(e: Event) => e.stopPropagation()}><IconExternalLink /></Link>
      </div>
    </div>
  );
};

export default CategoryCard;
