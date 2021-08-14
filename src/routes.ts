import { lazy } from "solid-js";
import { RouteDefinition } from "solid-app-router";

export const routes: RouteDefinition[] = [
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

