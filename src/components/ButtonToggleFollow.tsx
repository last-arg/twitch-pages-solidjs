import { Show, PropsWithChildren } from 'solid-js';
import { rootGameStore, IconFollow, IconUnfollow } from '../common';

const ButtonToggleFollow = (props: PropsWithChildren<{isFollowed: boolean, id: string, name: string}>) => {
  const isFollowed = props.isFollowed || false;
  const setGamesFollowed = rootGameStore[1];

  const followGame = (category: {id: string, name: string}, e: MouseEvent) => {
    e.preventDefault();
    setGamesFollowed("games", (games) => {
      const index = games.findIndex((item: {name: string}) => props.name <= item.name)
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
    <Show when={!isFollowed}
      fallback={<button class="text-trueGray-400 p-1.5 w-8 hover:text-black" onClick={[unfollowGame, props.id]} title="Remove bookmark"><IconUnfollow /></button>}>
      <button class="text-trueGray-400 p-1.5 w-8 hover:text-black" onClick={[followGame, {id: props.id, name: props.name}]} title="Add bookmark"><IconFollow /></button>
    </Show>
  );
};

export default ButtonToggleFollow;
