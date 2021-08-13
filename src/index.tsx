import { render } from 'solid-js/web';
import './index.css';
import App from './App';

const root = document.getElementById("root");
if (root) {
  root.removeChild(root.children[0])
  render(() => <App />, root);
}
