import { Show, PropsWithChildren, createSignal } from 'solid-js';
import { rootGameStore, IconFollow, IconUnfollow } from '../common';

// TODO?: replace html element button with input checkbox?
const ButtonGameFollow = (props: PropsWithChildren<{isFollowed: Accessor<boolean>, id: string, name: string, classExtra: string}>) => {
  const classExtra = props.classExtra || "";

  const toggleFollow = (category: {id: string, name: string, isFollowed: boolean}, e: MouseEvent) => {
    e.preventDefault();
    const setGamesFollowed = rootGameStore[1];
    if (props.isFollowed) {
      // unfollow game
      setGamesFollowed("games", (games) => {
        const index = games.findIndex((cat) => cat.id === category.id)
        return [...games.slice(0, index), ...games.slice(index+1)];
      });
    } else {
      // follow game
      setGamesFollowed("games", (games) => {
        const index = games.findIndex((item: {name: string}) => category.name <= item.name)
        if (index === -1) {
          return [...games, {id: category.id, name: category.name}]
        } else {
          return [...games.slice(0, index), {id: category.id, name: category.name}, ...games.slice(index)];
        }
      });
    }
  }

  return (
    <button class={`text-trueGray-400 hover:text-black ${classExtra}`} onClick={[toggleFollow, {id: props.id, name: props.name}]} title={`${props.isFollowed ? "Unfollow" : "Follow"} game`}>
      <Show when={!props.isFollowed} fallback={<IconUnfollow />}><IconFollow /></Show>
    </button>
  );
};

export default ButtonGameFollow;
