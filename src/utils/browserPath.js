/**
 * @author lizhangrui
 * @param {path} 相对路径
 */

 
const ROUTE_PREFIX = ""

function createBrowserPath(path) {
  return `${ROUTE_PREFIX}/${path}`.replace(/\/\//g, '/')
}

export default createBrowserPath
