import asyncComponent from './asyncDy';
const routes = [
  {
    path: "/sandwiches",
    name:'sandwiches',
    component: asyncComponent(() => import('@/pages/sandwiches'))
  },
  {
    path: "/tacos",
    name:'tacos',
    component: asyncComponent(() => import('@/pages/tacos')),
    routes: [
      {
        path: "/tacos/bus",
        name:'bus',
        component: asyncComponent(() => import('@/pages/tacos/bus'))
      },
      {
        path: "/tacos/cart",
        name:'cart',
        component: asyncComponent(() => import('@/pages/tacos/cart'))
      }
    ]
  }
];

export default routes;