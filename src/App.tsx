import { Component, lazy } from 'solid-js';
import { Router, Route} from 'solid-app-router';
import CategoryData from './views/Category.Data';
import Header from './components/Header';

const routes = [
  {
    path: '/',
    component: lazy(() => import('./views/Home'))
  },
  {
    path: '/directory/game/:name',
    component: lazy(() => import('./views/Category')),
    data: CategoryData
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

// TODO: Games sidebar link won't navigate to another stream from game/category's page
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
