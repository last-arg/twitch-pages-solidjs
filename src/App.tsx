import { Component, lazy } from 'solid-js';
import { Router, useRoutes } from 'solid-app-router';
import Header from './components/Header';
import {routes} from './routes';

const App: Component = () => {
  const Routes = useRoutes(routes)

  return (
    <>
      <Header />
      <Routes />
    </>
  );
};

export default App;
