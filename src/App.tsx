import { Component, lazy } from 'solid-js';
import { Router, Route, useRouter } from 'solid-app-router';

const routes = [
  {
    path: '/',
    component: lazy(() => import('./views/Home'))
  },
  {
    path: '/directory/game/:name',
    component: lazy(() => import('./views/Game'))
  },
  {
    path: "*all",
    component: lazy(() => import('./views/NotFound'))
  }
];

const App: Component = () => {
  console.log(useRouter())
  return (
    <Router routes={routes}>
      <Route />
    </Router>
  );
};

export default App;
