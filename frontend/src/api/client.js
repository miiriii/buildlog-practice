const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')

export async function getHealth(signal) {
  const response = await fetch(`${API_BASE_URL}/api/health`, {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!response.ok) throw new Error('상태를 확인하지 못했습니다.')
  const data = await response.json()
  if (data.status !== 'ok' || data.service !== 'BuildLog API') {
    throw new Error('서버 응답을 확인하지 못했습니다.')
  }
  return data
}
