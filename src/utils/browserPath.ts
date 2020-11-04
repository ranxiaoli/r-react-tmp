const ROUTE_PREFIX = '';

function createBrowserPath(path: string) {
  return `${ROUTE_PREFIX}/${path}`.replace(/\/\//g, '/');
}

export default createBrowserPath;
