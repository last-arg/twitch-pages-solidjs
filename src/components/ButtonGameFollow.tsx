import { Show, Component, createSignal, createEffect } from 'solid-js';
import { localGames } from '../common';
import { IconFollow, IconUnfollow } from '../icons';

type ButtonAttr = {title: string, "aria-pressed": boolean}

const createButtonAttr = (id: string): ButtonAttr => {
  const isFollowed = localGames.isFollowed(id)
  const title = isFollowed ? "Unfollow game" : "Follow game"
  return { title, "aria-pressed": isFollowed }
}

const ButtonGameFollow: Component<{id: string, name: string, classExtra: string}> = (props) => {
  const classExtra = props.classExtra || "";
  const [buttonAttr, setButtonAttr] = createSignal<ButtonAttr>(createButtonAttr(props.id))
  createEffect(() => setButtonAttr(createButtonAttr(props.id)))

  const toggleFollow = (category: {id: string, name: string}, e: MouseEvent) => {
    e.preventDefault();
    if (buttonAttr()["aria-pressed"]) {
      localGames.unfollowGame(category.id)
    } else {
      localGames.followGame({id: category.id, name: category.name})
    }
  }

  return (
    <button type="button" class={`text-trueGray-400 hover:text-black ${classExtra}`} onClick={[toggleFollow, {id: props.id, name: props.name}]} {...buttonAttr}>
      <Show when={!buttonAttr()["aria-pressed"]} fallback={<IconUnfollow />}>
        <IconFollow />
      </Show>
    </button>
  );
};

export default ButtonGameFollow;
