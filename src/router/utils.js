/**
 * @flow
 */


import React from 'react'
import { Menu } from 'antd'
import { matchPath } from 'react-router'
import { Link, Redirect, Route, Switch } from 'react-router-dom'
import dynamic from '@/utils/dynamic'
import g from '@/utils/browserPath'


/**
 * 判断是否是第n级子地址
 * @param {url} 地址
 */
export function isDeepChild(url) {
  return routeMap.get(url) && routeMap.get(url).isDeepChild || false
}

/**
 * 得到路由匹配的栈
 * @param {*} url
 * @param {*routes} 使用的路由
 */
export function getRouteStacks(url, routes){
  const routeStack = []
  const routeKeys = Array.from(routes.keys())
  const matchedKey = routeKeys.filter(path => matchPath(url, {
    path,
    exact: true,
  }))
  if (matchedKey.length === 0) return routeStack
  let currentRoute = routes.get(matchedKey[0])
  routeStack.push(currentRoute)
  while (currentRoute && currentRoute.parentPath) {
    currentRoute = routes.get(currentRoute.parentPath)
    routeStack.unshift(currentRoute)
  }
  return routeStack
}

export function getMenus(path, routes){
  let shoudMatch = true
  path.replace(/^\/+|\/+/g, '')
  let matchedPath = path
  if (path.indexOf('!') === 0) {
    shoudMatch = false
    matchedPath = path.substr(1)
  }
  if (shoudMatch) {
    routes = routes.filter(items => items.path === matchedPath)
  } else {
    routes = routes.filter(items => items.path !== matchedPath)
  }

  return routes.map(route => {
    if (!route.name) return null // 这里需要抛出警告
    if (!route.component) {
      return (
        <Menu.SubMenu title={route.name} key={route.path}>
          {route.children.map(item => (
            <Menu.Item key={item.path}>
              <Link to={item.fullPath}>{item.name}</Link>
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      )
    }
    return (
      <Menu.Item key={route.path}>
        <Link to={route.fullPath}>{route.name}</Link>
      </Menu.Item>
    )
  })
}

export function processRoutes(routes) {
  routes && routes.forEach((route) => {
    if (route.component) {
      route.component = dynamic(route.component)
    }
    if (route.path && route.path !== '/') {
      route.path = g(route.path)
    }
    if (route.redirect) {
      route.redirect = g(route.redirect)
    }
    processRoutes(route.routes)
  })
}

export function getCurrentRoute(url, routes) {
  const routeKeys = Array.from(routes.keys())
  const currentKey = routeKeys.filter(path => matchPath(url, {
    path,
    exact: true,
  }))[0]
  return routes.get(currentKey) || {}
}

export function renderRoutes(routes) {
  return routes ? (
    <Switch>
      {routes.map((route, i) => {
        if (route.redirect) {
          return (
            <Redirect
              key={route.key || i}
              from={route.path}
              to={route.redirect}
              exact={route.exact}
            />
          )
        }
        return (
          <Route
            key={route.key || i}
            path={route.path}
            exact={!route.routes && route.exact}
            render={(props) => {
              const childRoutes = renderRoutes(route.routes)
              if (route.component) {
                return (
                  <route.component {...props} route={route}>
                    {childRoutes}
                  </route.component>
                )
              }
              return childRoutes
            }}
          />
        )
      })}
    </Switch>
  ) : null
}
