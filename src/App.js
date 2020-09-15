import React from "react";
import { hot } from "react-hot-loader/root";
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
import VTree from './components/VTree'
import Footer from '@/components/Footer'
import AddTodo from '@/pages/containers/AddTodo'
import VisibleTodoList from '@/pages/containers/VisibleTodoList'
import routes from './router/router.config';
import styles from "./app.less";

const RouteWithSubRoutes = route => {
	return (
		<Route
			path={route.path}
			render={props => (
				<route.component {...props} routes={route.routes} />
			)}
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
			{routes.map((route, i) => <RouteWithSubRoutes key={i} {...route} />)}
			
		</div>

	</Router>)
}




function App() {

	const treeDataSetting = {
		dataKey: 'id',
		dataViewKey: 'resource_name',
		childArrayKey: 'child',
		// needLoadData: (node) => {
		// 	if (node.id === 45) {
		// 		return true;
		// 	}
		// 	return false;
		// },
		// loadData: () => new Promise((resolve) => {
		// 	setTimeout(() => {
		// 		const arr = [];
		// 		const gaps = 120000;
		// 		for (let i = gaps; i < gaps + 3000; i++) {
		// 			arr.push({ id: i, resource_name: `异步测试${i}`, child: [{ id: i + 100000, resource_name: `异步测试${i + 100000}` }] });
		// 		}
		// 		resolve({ isSuccess: true, data: arr });
		// 	}, 1000);
		// })
	}

	const mockData = () => {
		const arr = [];
		const baseGap = 10000;
		for (let i = 1; i < baseGap; i++) {
			arr.push({
				id: i, resource_name: `异步测试${i}`, child: [
					{ id: i + baseGap, resource_name: `异步测试${i + baseGap}` },
					{ id: i + baseGap * 2, resource_name: `异步测试${i + baseGap * 2}`, }
				]
			});
		}
		return [{ id: 0, resource_name: '根', child: arr }]
	};

	const __mockData = mockData()
	return (
		<div className={styles.titleAA}>
			<RouteConfigExample />
			<div style={{ height: 300 }}>
				<VTree
					dataSetting={treeDataSetting}
					data={__mockData}
				/>
			</div>
			<div>
				<AddTodo />
				<VisibleTodoList />
				<Footer />
			</div>
		</div>
	);
}

export default hot(App);
