import { render } from 'solid-js/web';
import './index.css';
import App from './App';
import { Router } from 'solid-app-router';
import { localImages, clientId } from './common';

let token = localStorage.getItem("twitch_token")
const root = document.getElementById("root") as HTMLElement;

if (window.location.hash) {
  for (const param_str of window.location.hash.slice(1).split("&")) {
    const [key, value] = param_str.split("=")
    if (key === "access_token") {
      token = value
      localStorage.setItem("twitch_token", value)
      break
    }
  }
}

root.removeChild(root.children[0])

if (token) {
  render(() => <Router><App /></Router>, root);
  window.addEventListener("unload", () => localImages.clean());
} else {
  const div = document.createElement("div")
  div.classList.add("text-center")
  const link = document.createElement("a")
  link.classList.add("bg-violet-700", "text-gray-50", "px-3" ,"py-2" , "rouned-sm", "hover:underline")
  link.text = "Login with Twitch"
  link.href = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${window.location.origin + window.location.pathname}&response_type=token&scope=`
  div.appendChild(link)
  root.appendChild(div)
}
