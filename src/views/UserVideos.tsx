import { Component, createResource, createSignal, createEffect, For, Show } from 'solid-js';
import { HEADER_OPTS, IMG_WIDTH, IMG_HEIGHT } from "../config";
import { Link, useParams } from 'solid-app-router';
import { createTwitchImage } from "../common";

const UserVideos: Component = (props) => {
  const username = decodeURIComponent(useParams().name);

  // TODO: make sure valid/existing user
  // TODO: get user videos
  // TODO: if live link to twitch.tv user's video page
  // TODO?: use twitch user display name instead?
  // TODO: button un/follow stream

  return (
    <>
      <h1>{username}</h1>
      <h2>Videos</h2>
    </>
  );
};

export default UserVideos;
