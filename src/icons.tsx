import { Component } from 'solid-js';
import iconsUrl from "./assets/icons.svg?url";

export const IconSprite: Component<{id: string, class?: string}> = (props) =>
  <svg class={props.class || ""}>
    <use href={`${iconsUrl}#${props.id}`}></use>
  </svg>

export const IconClose = () =>
  <svg class="fill-current" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.2545 0.984985L8.49996 7.70489L1.74538 0.984985L0.041626 2.67999L6.79621 9.3999L0.041626 16.1198L1.74538 17.8148L8.49996 11.0949L15.2545 17.8148L16.9583 16.1198L10.2037 9.3999L16.9583 2.67999L15.2545 0.984985Z" />
  </svg>

