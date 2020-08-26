import React from "react";
import { hot } from "react-hot-loader/root";
// import "./app.css";
import { BrowserRouter as Router, Link, Route, NavLink, Switch } from 'react-router-dom';
import routes from './router/router.config';
// import Routes from './router';
import Sandwiches from '@/pages/sandwiches';
import Tacos from '@/pages/tacos';
import Bus from '@/pages/tacos/bus';
import Cart from '@/pages/tacos/cart';
import styles from "./app.less";
import close from "./assets/close.png";
import bg from "./assets/green-bottom-bg.svg";
import Btn from "@/components/Btn";

// const Sandwiches = () => <h2>Sandwiches</h2>;

// const Tacos = ({ routes }) => (
//   <div>
//     <h2>Tacos</h2>
//     <ul>
//       <li>
//         <Link to="/tacos/bus">Bus</Link>
//       </li>
//       <li>
//         <Link to="/tacos/cart">Cart</Link>
//       </li>
//     </ul>

//     {routes.map((route, i) => <RouteWithSubRoutes key={i} {...route} />)}
//   </div>
// );

// const Bus = () => <h3>Bus</h3>;
// const Cart = () => <h3>Cart</h3>;
// const routes = [
//   {
//     path: "/sandwiches",
//     component: Sandwiches
//   },
//   {
//     path: "/tacos",
//     component: Tacos,
//     routes: [
//       {
//         path: "/tacos/bus",
//         component: Bus
//       },
//       {
//         path: "/tacos/cart",
//         component: Cart
//       }
//     ]
//   }
// ];

const Home = () => (
	<div>
		<h2>Home</h2>
	</div>
)

const About = () => (
	<div>
		<h2>About</h2>
	</div>
)


const User = () => (
	<div>
		<h2>User</h2>
	</div>
)

const RouteWithSubRoutes = route => {
	console.log(route, "===============route")
	
	return (
		<Route
			path={route.path}
			render={props => (
				// pass the sub-routes down to keep nesting
				<route.component {...props} routes={route.routes} />
			)}
		// component={(props) => <route.component {...props} routes={route.routes} />}
		/>
	)
};

const RouteConfigExample = () => {
	// const arr = routes.map((route, i) => <RouteWithSubRoutes key={i} {...route} />)
	return (<Router>
		<div>
			<ul>
				<li>
					<Link to="/tacos">Tacos</Link>
				</li>
				<li>
					<Link to="/sandwiches">Sandwiches</Link>
				</li>
			</ul>
			{/* {routes} */}
			{/* <Routes /> */}
			{routes.map((route, i) => <RouteWithSubRoutes key={i} {...route} />)}
		</div>
	</Router>)
}


function App() {
	return (
		<div className={styles.titleAA}>

			{/* <img src={close} alt="" />
			<img src={bg} alt="" />
			<Btn /> */}
			{/* <div> */}
			{/* <br /> */}
			{/* <Router>
					<div className="App"> */}
			{/* <Link to="/">Home</Link>
						<Link to="/about">About</Link>
						<Link to="/product">Product</Link>
						<hr />
						<Route path="/" exact component={Home}></Route>
						<Route path="/about" component={About}></Route> */}
			{/* <Route path="/product" component={Product}></Route> */}
			{/* // 选中后被添加class selected */}
			{/* <NavLink to={'/'} exact activeClassName='selected'>Home</NavLink> */}
			{/* // 选中后被附加样式 color:red */}
			{/* <NavLink to={'/product'} activeStyle={{ color: 'red' }}>Gallery</NavLink> */}
			{/* </div> */}

			{/* <Switch>
							<Route exact path="/" component={Home} />
							<Route path="/about" component={About} />
							<Route path="/:user" component={User} /> */}
			{/* <Route component={NoMatch} /> */}
			{/* </Switch> */}
			{/* </Router> */}
			<RouteConfigExample />
			{/* // </div> */}
		</div>
	);
}

export default hot(App);
