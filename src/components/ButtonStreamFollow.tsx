import { createSignal, createEffect, Show, PropsWithChildren } from 'solid-js';
import { localStreams, localLiveStreams, StreamFollow } from "../common";
import { IconFollow, IconUnfollow } from "../icons";
import { Stream } from "../stream";

type ButtonProps = StreamFollow & Partial<Pick<Stream, "game_name">>

const ButtonStreamFollow = (props: PropsWithChildren<ButtonProps>) => {
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
    }
  }

  return (
    <button class="w-4 text-trueGray-400 hover:text-trueGray-800" title={`${isFollowed() ? "Unfollow" : "Follow"} streamer`} onClick={[toggleStreamFollow, props]}>
      <Show when={!isFollowed()} fallback={<IconUnfollow />}><IconFollow /></Show>
    </button>
  );
}

export default ButtonStreamFollow
