import { Component, lazy } from 'solid-js';
import { Router, useRoutes } from 'solid-app-router';
import Header from './components/Header';

const routes = [
  {
    path: '/',
    component: lazy(() => import('./views/Home'))
  },
  {
    path: '/directory/game/:name',
    component: lazy(() => import('./views/Category'))
  },
  {
    path: '/:name/videos',
    component: lazy(() => import('./views/UserVideos')),
    // data: UserVideosData
  },
  {
    path: "*all",
    component: lazy(() => import('./views/NotFound'))
  }
];

const App: Component = () => {
  const Routes = useRoutes(routes)
  return (
    <>
      <Router>
        <Header />
        <Routes />
      </Router>
    </>
  );
};

export default App;
