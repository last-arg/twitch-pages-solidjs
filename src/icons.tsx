import { Component } from 'solid-js';
import iconsUrl from "./assets/icons.svg?url";

export const IconSprite: Component<{id: string, class?: string}> = (props) =>
  <svg class={props.class || ""}>
    <use href={`${iconsUrl}#${props.id}`}></use>
  </svg>
