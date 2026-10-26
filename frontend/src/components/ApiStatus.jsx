import { useEffect, useState } from 'react'
import { getHealth } from '../api/client'

export default function ApiStatus() {
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 8000)
    let active = true
    setStatus('loading')

    getHealth(controller.signal)
      .then(() => { if (active) setStatus('success') })
      .catch(() => { if (active) setStatus('error') })
      .finally(() => window.clearTimeout(timeout))

    return () => {
      active = false
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [attempt])

  return (
    <section className={`status-card status-${status}`} aria-labelledby="status-title">
      <div>
        <p className="eyebrow">연결 상태</p>
        <h2 id="status-title">BuildLog 서버</h2>
        <p role="status" aria-live="polite">
          {status === 'loading' && '서버 연결을 확인하고 있어요.'}
          {status === 'success' && '서버에 정상적으로 연결되었습니다.'}
          {status === 'error' && '서버에 연결하지 못했습니다. 잠시 후 다시 확인해 주세요.'}
        </p>
      </div>
      {status === 'error'
        ? <button className="secondary-button" onClick={() => setAttempt((value) => value + 1)}>다시 확인</button>
        : <span className="status-badge"><span className="status-dot" />{status === 'success' ? '연결됨' : '확인 중'}</span>}
    </section>
  )
}
