const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch {
    throw new ApiError('서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.')
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(
      typeof data.detail === 'string' ? data.detail : '요청을 처리하지 못했습니다.',
      response.status,
    )
  }
  return data
}

export async function getHealth(signal) {
  const data = await request('/api/health', { signal })
  if (data.status !== 'ok' || data.service !== 'BuildLog API') {
    throw new ApiError('서버 응답을 확인하지 못했습니다.')
  }
  return data
}

export const signup = (values) => request('/api/auth/signup', {
  method: 'POST',
  body: JSON.stringify(values),
})

export const login = (values) => request('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify(values),
})

export const getMe = () => request('/api/auth/me')

export const updateNickname = (nickname) => request('/api/auth/me/nickname', {
  method: 'PATCH',
  body: JSON.stringify({ nickname }),
})
