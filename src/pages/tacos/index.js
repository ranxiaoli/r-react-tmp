import React from 'react'
import { HashRouter as Router, Link, Route, NavLink, Switch } from 'react-router-dom';

const RouteWithSubRoutes = route => (
  <Route
    path={route.path}
    render={props => {
      // pass the sub-routes down to keep nesting
      return <route.component {...props} routes={route.routes} />
    }}
  // component={(props) => <route.component {...props} routes={route.routes} />}
  />
);

const Tacos = ({ routes }) => {
  console.log(routes, "=====================routes")
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

      {routes.map((route, i) => <RouteWithSubRoutes key={i} {...route} />)}
    </div>
  )
};

export default Tacos;