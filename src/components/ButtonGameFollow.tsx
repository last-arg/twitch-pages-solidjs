import { Show, Component, createSignal, createEffect } from 'solid-js';
import { localGames } from '../common';
import { IconFollow, IconUnfollow } from '../icons';

type ButtonAttr = {title: string, "aria-pressed": "true" | "false"}

const createButtonAttr = (id: string): ButtonAttr => {
  const isFollowed = localGames.isFollowed(id)
  const title = isFollowed ? "Unfollow game" : "Follow game"
  const ariaPressed = isFollowed ? "true" : "false"
  return { title, "aria-pressed": ariaPressed }
}

const ButtonGameFollow: Component<{id: string, name: string, classExtra: string}> = (props) => {
  const classExtra = props.classExtra || "";
  const [buttonAttr, setButtonAttr] = createSignal<ButtonAttr>(createButtonAttr(props.id))
  createEffect(() => setButtonAttr(createButtonAttr(props.id)))

  const toggleFollow = (category: {id: string, name: string}, e: MouseEvent) => {
    e.preventDefault();
    if (buttonAttr()["aria-pressed"] === "true") {
      localGames.unfollowGame(category.id)
    } else {
      localGames.followGame({id: category.id, name: category.name})
    }
  }

  const t = {
    "is-disabled": "test",
    width: 10
  }

  return (
    <button type="button" class={`text-trueGray-400 hover:text-black ${classExtra}`} onClick={[toggleFollow, {id: props.id, name: props.name}]} {...buttonAttr}>
      <Show when={buttonAttr()["aria-pressed"] === "false"} fallback={<IconUnfollow />}><IconFollow /></Show>
    </button>
  );
};

export default ButtonGameFollow;
