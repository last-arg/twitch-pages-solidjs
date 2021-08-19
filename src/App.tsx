import { Component, lazy } from 'solid-js';
import { Router, useRoutes, useParams } from 'solid-app-router';
import Header from './components/Header';
import {routes} from './routes';

const App: Component = () => {
  const Routes = useRoutes(routes)

  return (
    <>
      <Header />
      <main class="px-2 contain-content">
        <Routes />
      </main>
    </>
  );
};

export default App;
