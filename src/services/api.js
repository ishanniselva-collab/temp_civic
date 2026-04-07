// In dev, prefer same-origin `/api` (Vite proxy → backend).
// VITE_API_URL must be the full API root, e.g. http://localhost:3000/api
const rawEnv = import.meta.env.VITE_API_URL;
const envUrl = typeof rawEnv === 'string' ? rawEnv.trim() : '';
const useEnv = envUrl && envUrl !== 'undefined';

const API_BASE = useEnv
  ? envUrl.replace(/\/$/, '')
  : import.meta.env.DEV
    ? '/api'
    : 'http://localhost:3000/api';

// Used for serving static images from the backend (`/uploads/...`)
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

export { API_BASE, API_ORIGIN };

