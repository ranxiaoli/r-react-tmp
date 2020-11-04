/**
 * @flow
 */
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import routes from './router.config';
import { processRoutes, renderRoutes } from './utils';

// export * from './utils'
// export * from './menu'
processRoutes(routes);
const Route = renderRoutes(routes);
// export {
//   // isDeepChild,
//   // getRouteStack,
//   // getRoutes,
//   // getMenus,
// }

const routers = () => <Router>{Route}</Router>;

export default routers;
