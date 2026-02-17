import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:8001/api`

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

function getLocalToken() {
  return localStorage.getItem('token')
}

function getLocalRefresh() {
  return localStorage.getItem('refresh')
}

function setTokens({ access, refresh }) {
  if (access) localStorage.setItem('token', access)
  if (refresh) localStorage.setItem('refresh', refresh)
}

function clearTokens() {
  localStorage.removeItem('token')
  localStorage.removeItem('refresh')
}

// Attach Authorization header
api.interceptors.request.use((config) => {
  const token = getLocalToken()
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  return config
})

// Response interceptor to handle 401 and try refresh
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token
          return api(originalRequest)
        }).catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refresh = getLocalRefresh()
      if (!refresh) {
        clearTokens()
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        const resp = await axios.post(`${API_BASE}/token/refresh/`, { refresh })
        const newToken = resp.data.access
        setTokens({ access: newToken })
        api.defaults.headers.common['Authorization'] = 'Bearer ' + newToken
        window.dispatchEvent(new CustomEvent('token-refreshed', { detail: { access: newToken } }))
        processQueue(null, newToken)
        isRefreshing = false
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken
        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        clearTokens()
        isRefreshing = false
        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  }
)

export { api, setTokens, clearTokens }
