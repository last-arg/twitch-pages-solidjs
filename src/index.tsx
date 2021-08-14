import { render } from 'solid-js/web';
import './index.css';
import App from './App';
import { Router } from 'solid-app-router';
import { localImages } from './common';

const root = document.getElementById("root") as HTMLElement;
root.removeChild(root.children[0])
render(() => <Router><App /></Router>, root);
window.addEventListener("unload", () => localImages.clean());
