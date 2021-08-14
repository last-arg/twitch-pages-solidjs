import { Show, PropsWithChildren, createSignal, createEffect } from 'solid-js';
import { localGames } from '../common';
import { IconFollow, IconUnfollow } from '../icons';

const ButtonGameFollow = (props: PropsWithChildren<{id: string, name: string, classExtra: string}>) => {
  const classExtra = props.classExtra || "";
  const [isFollowed, setIsFollowed] = createSignal<boolean>(localGames.isFollowed(props.id))
  createEffect(() => setIsFollowed(localGames.isFollowed(props.id)))

  const toggleFollow = (category: {id: string, name: string}, e: MouseEvent) => {
    e.preventDefault();
    if (isFollowed()) {
      localGames.unfollowGame(category.id)
    } else {
      localGames.followGame({id: category.id, name: category.name})
    }
  }

  return (
    <button type="button" class={`text-trueGray-400 hover:text-black ${classExtra}`} onClick={[toggleFollow, {id: props.id, name: props.name}]} title={`${isFollowed() ? "Unfollow" : "Follow"} game`} aria-pressed={isFollowed() ? "true" : "false"}>
      <Show when={!isFollowed()} fallback={<IconUnfollow />}><IconFollow /></Show>
    </button>
  );
};

export default ButtonGameFollow;
