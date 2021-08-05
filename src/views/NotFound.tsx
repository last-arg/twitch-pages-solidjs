import { Component } from 'solid-js';
import { Link } from 'solid-app-router';

const NotFound: Component = () => {
  return (
    <main>
      <Link href="/" title="Home">Home</Link>
      <p>Not found</p>
    </main>
  );
};

export default NotFound;
