import { Component, Resource, Switch, Match } from 'solid-js';

// TODO: add Found no videos msg. But probably not here but to pages/views
const ButtonFetchMore: Component<{onClick: (e: Event) => void, fetchResp: Resource<any> }> = (props) => {
  return (
    <div class="my-10 text-center text-base">
      <Switch>
        <Match when={props.fetchResp.loading}>
          <p class="py-1 border-2 border-gray-300">Loading videos...</p>
        </Match>
        <Match when={!props.fetchResp.loading && props.fetchResp().pagination.cursor}>
          <button type="button" class="border-2 py-1 border-violet-600 block w-full hover:bg-violet-600 hover:text-gray-50" onClick={props.onClick}>Load more videos</button>
        </Match>
      </Switch>
    </div>
  );
}

export default ButtonFetchMore
