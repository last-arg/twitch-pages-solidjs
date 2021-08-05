import { Component, lazy } from 'solid-js';
import { Router, Route, Link } from 'solid-app-router';
import GameData from './views/Game.Data';
import Header from './components/Header';

const routes = [
  {
    path: '/',
    component: lazy(() => import('./views/Home'))
  },
  {
    path: '/directory/game/:name',
    component: lazy(() => import('./views/Game')),
    data: GameData
  },
  {
    path: "*all",
    component: lazy(() => import('./views/NotFound'))
  }
];

const App: Component = () => {
  return (
    <>
      <Router routes={routes}>
        <Header />
        <Route />
      </Router>
    </>
  );
};

export default App;
