import axios from 'axios'

// Always prefer env; fallback to '/api' so we hit the local proxy/server.
const baseURL = import.meta?.env?.VITE_API_BASE_URL || '/api'

export const ApiClient = axios.create({ baseURL })

if (import.meta?.env?.DEV) {
  // Helpful during local troubleshooting
  // eslint-disable-next-line no-console
  console.log('[ApiClient] baseURL =', baseURL)
}
