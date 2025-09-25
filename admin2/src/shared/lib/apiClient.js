import axios from 'axios'

// Always prefer env; fallback to '/api' so we hit the local proxy/server.
const baseURL = import.meta?.env?.VITE_API_BASE_URL || '/api'

export const ApiClient = axios.create({ baseURL })

if (import.meta?.env?.DEV) {
  // Helpful during local troubleshooting
  // eslint-disable-next-line no-console
  console.log('[ApiClient] baseURL =', baseURL)
}

// Attach Authorization header if token exists
ApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 responses globally
ApiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Notify app to transition to login without full reload
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      }
    }
    return Promise.reject(err)
  }
)
