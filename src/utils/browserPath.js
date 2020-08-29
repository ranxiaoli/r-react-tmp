
const ROUTE_PREFIX = ""

function createBrowserPath(path) {
  return `${ROUTE_PREFIX}/${path}`.replace(/\/\//g, '/')
}

export default createBrowserPath
