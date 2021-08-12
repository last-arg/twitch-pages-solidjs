import { PropsWithChildren } from 'solid-js';
import { IMG_WIDTH, IMG_HEIGHT } from '../config';
import { createTwitchImage } from '../common';
import { IconExternalLink } from '../icons';
import { Link } from "solid-app-router";
import ButtonGameFollow from "./ButtonGameFollow";


const CategoryCard = (props: PropsWithChildren<{id: string, name: string, img_class: string}>) => {
  const id = props.id;
  const name = props.name;
  const encoded_name = encodeURI(name);
  let img_url = createTwitchImage(encoded_name, IMG_WIDTH, IMG_HEIGHT);
  const game_link = `/directory/game/${encoded_name}`;

  return (
    <div class="bg-purple-50 text-gray-700">
      <Link class="flex border-2 border-purple-200 rounded-sm hover:text-purple-800 hover:border-purple-500" href={game_link} title={name}>
        <div class="flex-grow flex items-center">
          <img class={`${props.img_class}`} src={img_url} alt="" width={IMG_WIDTH} height={IMG_HEIGHT} />
          <p class="ml-3 text-lg line-clamp-2">{name}</p>
        </div>
        <div class="flex flex-col justify-between py-1.5 pr-1.5">
          <ButtonGameFollow classExtra="w-5 h-5" name={name} id={id} />
          <Link class="text-trueGray-400 w-5 h-5 hover:text-black" href={`https://www.twitch.tv${game_link}`} title="Open game in Twitch" onClick={(e: Event) => e.stopPropagation()}><IconExternalLink /></Link>
        </div>
      </Link>

    </div>
  );
};

export default CategoryCard;
