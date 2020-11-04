import React from 'react';
import { hot } from 'react-hot-loader/root';
import { Menu } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { BrowserRouter as Router, Link, Route } from 'react-router-dom';
// import VTree from './components/VTree'
import Footer from '@/components/Footer';
import AddTodo from '@/pages/containers/AddTodo';
import VisibleTodoList from '@/pages/containers/VisibleTodoList';
import routes from './router/router.config';
import './app.less';

const { SubMenu } = Menu;

// Routes
const RouteWithSubRoutes = (route: any) => {
  return <Route path={route.path} render={(props) => <route.component {...props} routes={route.routes} />} />;
};

const RouteConfigExample = () => {
  // 创建菜单 -- routes.config.js
  const createMenu = ((routerMenus) => {
    let subMenuIndex = 0;
    const menus: any = [];
    const create = (routerMenus: any, el: any) => {
      for (let i = 0; i < routerMenus.length; i++) {
        // 有子路由
        if (routerMenus[i].routes) {
          const childRoutes: any = [];
          create(routerMenus[i].routes, childRoutes);
          subMenuIndex++;
          el.push(
            <SubMenu
              key={`sub${subMenuIndex}`}
              title={
                <span>
                  <MailOutlined />
                  <span>{routerMenus[i].name}</span>
                </span>
              }>
              {childRoutes}
            </SubMenu>
          )
        } else {
          // 如果没有子路由
          el.push(
            <Menu.Item key={routerMenus[i].path}>
              <Link to={routerMenus[i].path}>{routerMenus[i].name}</Link>
            </Menu.Item>
          );
        }
      }
    };
    create(routerMenus, menus);
    return menus;
  })(routes);

  // Menus
  const MenusWithRoutes = () => {
    return (
      <Menu defaultSelectedKeys={[window.location.pathname]} defaultOpenKeys={['sub1']} mode="inline">
        {createMenu}
      </Menu>
    );
  };

  return (
    <Router>
      <nav className="nav">{MenusWithRoutes()}</nav>
      <main className="main">
        {routes.map((route, i) => (
          <RouteWithSubRoutes key={i} {...route} />
        ))}
        <AddTodo />
        <Footer />
        <VisibleTodoList />
      </main>
    </Router>
  );
};

function App() {
  return (
    <div className="container">
      <header className="header">R-React-TMP</header>
      <div className="content">
        <RouteConfigExample />
      </div>
    </div>
  );
}

export default hot(App);
