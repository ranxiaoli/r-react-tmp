import React from 'react';
import { Link, Route } from 'react-router-dom';

const RouteWithSubRoutes = (route: any) => (
  <Route
    path={route.path}
    render={(props: any) => {
      // pass the sub-routes down to keep nesting
      return <route.component {...props} routes={route.routes} />;
    }}
    // component={(props) => <route.component {...props} routes={route.routes} />}
  />
);

const Tacos = ({ routes }: any) => {
  return (
    <div>
      <h2>Tacos</h2>
      <ul>
        <li>
          <Link to="/tacos/bus">Bus</Link>
        </li>
        <li>
          <Link to="/tacos/cart">Cart</Link>
        </li>
      </ul>

      {routes.map((route: any, i: number) => (
        <RouteWithSubRoutes key={i} {...route} />
      ))}
    </div>
  );
};

export default Tacos;
