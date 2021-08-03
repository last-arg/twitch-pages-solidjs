import { Component } from 'solid-js';

const Header: Component = () => {
  return (
    <header class="bg-gray-700 p-1 shadow flex">
      <h1 class="text-white">Twitch filter</h1>
      <input type="search" class="border bg-blue-100" placeholder="Search for game"/>
    </header>
  );
};

export default Header;
