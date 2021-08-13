import { render } from 'solid-js/web';
import './index.css';
import App from './App';
import { localImages } from './common';

const root = document.getElementById("root") as HTMLElement;
root.removeChild(root.children[0])
render(() => <App />, root);
window.addEventListener("unload", () => localImages.clean());
