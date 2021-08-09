import { Component, createResource, createSignal, createEffect, For, Show } from 'solid-js';
import { HEADER_OPTS, IMG_WIDTH, IMG_HEIGHT } from "../config";
import { Link, useRouter } from 'solid-app-router';
import { createTwitchImage } from "../common";

const UserVideos: Component = (props) => {
  const [router] = useRouter();
  const username = decodeURIComponent(router.params.name as string);

  // TODO: make sure valid/existing user
  // TODO: get user videos
  // TODO: if live link to twitch.tv user page
  // TODO?: use twitch user display name instead?

  return (
    <>
      <h1>{username}</h1>
      <h2>Videos</h2>
    </>
  );
};

export default UserVideos;
