import { Show, PropsWithChildren } from 'solid-js';
import { IMG_WIDTH, IMG_HEIGHT } from '../config';
import { createTwitchImage, rootGameStore, IconExternalLink, IconFollow, IconUnfollow } from '../common';
import { Link } from "solid-app-router";


const CategoryCard = (props: PropsWithChildren<{id: string, name: string, is_followed: boolean, img_class: string}>) => {
  const is_followed = props.is_followed;
  const id = props.id;
  const name = props.name;
  const encoded_name = encodeURI(name);
  let img_url = createTwitchImage(encoded_name, IMG_WIDTH, IMG_HEIGHT);
  const game_link = `/directory/game/${encoded_name}`;

  const setGamesFollowed = rootGameStore[1];

  const followGame = (category: {id: string, name: string}, e: MouseEvent) => {
    e.preventDefault();
    setGamesFollowed("games", (games) => {
      const index = games.findIndex((item) => name <= item.name)
      if (index === -1) {
        return [...games, {id: category.id, name: category.name}]
      } else {
        return [...games.slice(0, index), {id: category.id, name: category.name}, ...games.slice(index)];
      }

    });
  };

  const unfollowGame = (id: string, e: MouseEvent) => {
    e.preventDefault();
    setGamesFollowed("games", (games) => {
      const index = games.findIndex((cat) => cat.id === id)
      return [...games.slice(0, index), ...games.slice(index+1)];
    });
  };

  return (
    <div class="bg-purple-50 text-gray-700">
      <Link class="flex border-2 border-purple-200 rounded-sm hover:text-purple-800 hover:border-purple-500" href={game_link} title={name}>
        <div class="flex-grow flex items-center">
          <img class={`${props.img_class}`} src={img_url} alt="" width={IMG_WIDTH} height={IMG_HEIGHT} />
          <p class="ml-3 text-lg line-clamp-2">{name}</p>
        </div>
        <div class="flex flex-col justify-between">
          <Show when={!is_followed}
            fallback={<button class="text-trueGray-400 p-1.5 w-8 hover:text-black" onClick={[unfollowGame, id]} title="Remove bookmark"><IconUnfollow /></button>}>
            <button class="text-trueGray-400 p-1.5 w-8 hover:text-black" onClick={[followGame, {id, name}]} title="Add bookmark"><IconFollow /></button>
          </Show>
          <Link class="text-trueGray-400 p-2 w-8 hover:text-black" href={`https://www.twitch.tv${game_link}`} title="Open game in Twitch" onClick={(e: Event) => e.stopPropagation()}><IconExternalLink /></Link>
        </div>
      </Link>

    </div>
  );
};

export default CategoryCard;
