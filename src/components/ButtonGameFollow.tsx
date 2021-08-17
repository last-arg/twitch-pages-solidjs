import { Show, Component, createSignal, createEffect } from 'solid-js';
import { localGames } from '../common';
import { IconSprite } from '../icons';

type ButtonAttr = {title: string, "aria-pressed": boolean}

const createButtonAttr = (id: string): ButtonAttr => {
  const isFollowed = localGames.isFollowed(id)
  const title = isFollowed ? "Unfollow game" : "Follow game"
  return { title, "aria-pressed": isFollowed }
}

const ButtonGameFollow: Component<{id: string, name: string, class?: string}> = (props) => {
  const classStr = props.class || ""
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
    <button type="button" class={classStr} onClick={[toggleFollow, {id: props.id, name: props.name}]} {...buttonAttr}>
      <Show when={!buttonAttr()["aria-pressed"]} fallback={<IconSprite id="star-full" class="fill-current w-full h-full" />}>
        <IconSprite id="star-empty" class="fill-current w-full h-full" />
      </Show>
    </button>
  );
};

export default ButtonGameFollow;
