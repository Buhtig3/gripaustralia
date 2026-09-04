export function getUrl(path: string = ''): string {
  const base = import.meta.env.BASE_URL ? import.meta.env.BASE_URL.replace(/\/+$/, '') : '';
  if (!path || path === '/') {
    return base ? `${base}/` : '/';
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
