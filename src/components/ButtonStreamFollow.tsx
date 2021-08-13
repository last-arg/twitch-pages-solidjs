import { createSignal, createEffect, Show, PropsWithChildren } from 'solid-js';
import { localStreams, StreamFollow } from "../common";
import { IconFollow, IconUnfollow } from "../icons";

const ButtonStreamFollow = (props: PropsWithChildren<StreamFollow>) => {
  const [isFollowed, setIsFollowed] = createSignal<boolean>(localStreams.isFollowed(props.user_id))
  createEffect(() => setIsFollowed(localStreams.isFollowed(props.user_id)))

  const toggleStreamFollow = (stream: StreamFollow, e: MouseEvent) => {
    e.preventDefault()
    if (isFollowed()) {
      localStreams.unfollow(stream.user_id)
    } else {
      localStreams.follow({
        user_id: stream.user_id,
        user_login: stream.user_login,
        user_name: stream.user_name
      })
    }
  }

  return (
    <button class="w-4 text-trueGray-400 hover:text-trueGray-800" title={`${isFollowed() ? "Unfollow" : "Follow"} streamer`} onClick={[toggleStreamFollow, props]}>
      <Show when={!isFollowed()} fallback={<IconUnfollow />}><IconFollow /></Show>
    </button>
  );
}

export default ButtonStreamFollow
