import asyncComponent from './asyncDy';
const routes = [
  {
    path: "/sandwiches",
    component: asyncComponent(() => import('@/pages/sandwiches'))
  },
  {
    path: "/tacos",
    component: asyncComponent(() => import('@/pages/tacos')),
    routes: [
      {
        path: "/tacos/bus",
        component: asyncComponent(() => import('@/pages/tacos/bus'))
      },
      {
        path: "/tacos/cart",
        component: asyncComponent(() => import('@/pages/tacos/cart'))
      }
    ]
  }
];

export default routes;