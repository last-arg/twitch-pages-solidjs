import { createSignal, createEffect, Show, Component } from 'solid-js';
import { localStreams, localLiveStreams, localImages, StreamFollow, fetchAndSetProfileImages } from "../common";
import { IconSprite } from "../icons";
import { Stream } from "../stream";

type ButtonProps = StreamFollow & Partial<Pick<Stream, "game_name">> & {class?: string}

const ButtonStreamFollow: Component<ButtonProps> = (props) => {
  const classStr = props.class || ""
  const [isFollowed, setIsFollowed] = createSignal<boolean>(localStreams.isFollowed(props.user_id))
  createEffect(() => setIsFollowed(localStreams.isFollowed(props.user_id)))

  const toggleStreamFollow = (stream: ButtonProps, e: MouseEvent) => {
    e.preventDefault()
    if (isFollowed()) {
      localStreams.unfollow(stream.user_id)
      localLiveStreams.remove(stream.user_id)
    } else {
      localStreams.follow({
        user_id: stream.user_id,
        user_login: stream.user_login,
        user_name: stream.user_name
      })
      if (stream.game_name) {
        localLiveStreams.set(stream.user_id, stream.game_name)
      }
      if (localImages.get(stream.user_id) === "") {
        fetchAndSetProfileImages([stream.user_id])
      }
    }
  }

  return (
    <button class={classStr} title={`${isFollowed() ? "Unfollow" : "Follow"} streamer`} onClick={[toggleStreamFollow, props]}>
      <Show when={!isFollowed()} fallback={<IconSprite id="star-full" class="fill-current w-full h-full" />}>
        <IconSprite id="star-empty" class="fill-current w-full h-full" />
      </Show>
    </button>
  );
}

export default ButtonStreamFollow
