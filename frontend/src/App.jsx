import { useEffect, useState } from 'react'
import ApiStatus from './components/ApiStatus'
import { ApiError, getMe, login, signup, updateNickname } from './api/client'

const sections = [
  { number: '01', title: '공부 기록', description: '오늘 배운 것과 작업한 내용을 차곡차곡 남겨요.' },
  { number: '02', title: '할 일', description: '앞으로 할 일을 정리하고 끝낸 일을 확인해요.' },
  { number: '03', title: '오류 기록', description: '막혔던 문제와 해결 과정을 다음을 위해 모아둬요.' },
]

function navigate(path, state = null) {
  window.history.pushState(state, '', path)
  window.dispatchEvent(new PopStateEvent('popstate', { state }))
}

function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname)
  useEffect(() => {
    const update = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', update)
    return () => window.removeEventListener('popstate', update)
  }, [])
  return pathname
}

function LinkButton({ to, children, className = 'nav-link' }) {
  return <a className={className} href={to} onClick={(event) => { event.preventDefault(); navigate(to) }}>{children}</a>
}

function Header({ user }) {
  return (
    <header className="site-header">
      <LinkButton className="brand" to={user ? '/home' : '/'}>
        <span className="brand-mark" aria-hidden="true">B</span>BuildLog<span className="brand-period">.</span>
      </LinkButton>
      <nav aria-label="주 메뉴" className="site-nav">
        {user ? (
          <><LinkButton to="/home">내 기록</LinkButton><LinkButton to="/account">계정 설정</LinkButton></>
        ) : (
          <><LinkButton to="/login">로그인</LinkButton><LinkButton to="/signup" className="nav-button">회원가입</LinkButton></>
        )}
      </nav>
    </header>
  )
}

function RecordCards({ ready = false }) {
  return (
    <section aria-labelledby="records-title">
      <div className="section-heading">
        <h2 id="records-title">{ready ? '내 기록' : '기록할 공간'}</h2>
        <span>{ready ? '기록 기능은 다음 단계에서 만들어요' : '하나씩 준비하고 있어요'}</span>
      </div>
      <div className="record-grid">
        {sections.map((section) => (
          <article className="record-card" key={section.number}>
            <div className="card-top"><span className="card-number">{section.number}</span><span className="soon-badge">준비 중</span></div>
            <h3>{section.title}</h3>
            <p>{section.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function Landing() {
  return (
    <main id="overview">
      <div className="intro">
        <p className="eyebrow">나의 학습 기록장</p>
        <h1>배운 오늘을,<br />다음의 나에게.</h1>
        <p className="intro-description">공부한 내용부터 할 일, 오류를 해결한 순간까지.<br className="desktop-break" /> 흩어진 공부의 과정을 한곳에 모아요.</p>
        <div className="intro-actions"><LinkButton to="/signup" className="primary-button">기록 시작하기</LinkButton><LinkButton to="/login" className="text-button">이미 계정이 있어요</LinkButton></div>
      </div>
      <RecordCards />
      <ApiStatus />
    </main>
  )
}

function FormField({ id, label, hint, ...props }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} />
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  )
}

function AuthPage({ mode, onLogin }) {
  const isSignup = mode === 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const joined = !isSignup && window.history.state?.joined

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (isSignup) {
        await signup({ email, password, nickname })
        setPassword('')
        navigate('/login', { joined: true })
      } else {
        const user = await login({ email, password })
        setPassword('')
        onLogin(user)
        navigate('/home')
      }
    } catch (requestError) {
      setPassword('')
      setError(requestError instanceof ApiError ? requestError.message : '요청을 처리하지 못했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-main">
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="eyebrow">{isSignup ? 'BuildLog 시작하기' : '다시 만나서 반가워요'}</p>
        <h1 id="auth-title">{isSignup ? '회원가입' : '로그인'}</h1>
        <p className="auth-description">{isSignup ? '공부의 과정을 내 기록으로 남겨보세요.' : '저장한 기록을 이어서 확인해 보세요.'}</p>
        {joined && <p className="success-message" role="status">회원가입이 완료되었습니다. 로그인해 주세요.</p>}
        {error && <p className="error-message" role="alert">{error}</p>}
        <form onSubmit={submit} noValidate>
          <FormField id={`${mode}-email`} label="이메일" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          {isSignup && <FormField id="signup-nickname" label="닉네임" type="text" autoComplete="nickname" value={nickname} onChange={(event) => setNickname(event.target.value)} hint="2~20자, 한글·영문·숫자·밑줄만 사용할 수 있어요." required />}
          <FormField id={`${mode}-password`} label="비밀번호" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} hint={isSignup ? '8~64자로 입력해 주세요.' : undefined} minLength={8} maxLength={64} required />
          <button className="primary-button form-submit" type="submit" disabled={submitting}>{submitting ? '처리 중...' : isSignup ? '가입하기' : '로그인'}</button>
        </form>
        <p className="form-switch">{isSignup ? '이미 계정이 있나요?' : '아직 계정이 없나요?'} <LinkButton to={isSignup ? '/login' : '/signup'} className="inline-link">{isSignup ? '로그인' : '회원가입'}</LinkButton></p>
      </section>
    </main>
  )
}

function ProtectedPage({ user, authStatus, children }) {
  useEffect(() => {
    if (authStatus === 'ready' && !user) navigate('/login')
  }, [authStatus, user])
  if (authStatus === 'loading') return <main className="center-message" role="status">로그인 상태를 확인하고 있어요.</main>
  if (!user) return null
  return children
}

function Dashboard({ user }) {
  return (
    <main>
      <div className="dashboard-heading"><p className="eyebrow">내 기록 홈</p><h1><span>{user.nickname}</span>님의<br />배움을 이어가세요.</h1><p>공부 기록, 할 일, 오류 기록 기능은 다음 단계에서 차례로 연결합니다.</p></div>
      <RecordCards ready />
    </main>
  )
}

function AccountPage({ user, onUpdate }) {
  const [nickname, setNickname] = useState(user.nickname)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)
    try {
      const updated = await updateNickname(nickname)
      onUpdate(updated)
      setNickname(updated.nickname)
      setMessage('닉네임을 변경했습니다.')
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : '닉네임을 변경하지 못했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="account-main">
      <section className="settings-card" aria-labelledby="settings-title">
        <p className="eyebrow">계정 설정</p><h1 id="settings-title">내 정보</h1>
        <div className="account-email"><span>이메일</span><strong>{user.email}</strong></div>
        {message && <p className="success-message" role="status">{message}</p>}
        {error && <p className="error-message" role="alert">{error}</p>}
        <form onSubmit={submit} noValidate>
          <FormField id="account-nickname" label="닉네임" type="text" value={nickname} onChange={(event) => setNickname(event.target.value)} hint="2~20자, 한글·영문·숫자·밑줄만 사용할 수 있어요." required />
          <button className="primary-button form-submit" type="submit" disabled={submitting}>{submitting ? '변경 중...' : '닉네임 변경'}</button>
        </form>
      </section>
    </main>
  )
}

export default function App() {
  const pathname = usePathname()
  const [authStatus, setAuthStatus] = useState('loading')
  const [user, setUser] = useState(null)

  useEffect(() => {
    let active = true
    getMe()
      .then((currentUser) => { if (active) setUser(currentUser) })
      .catch(() => { if (active) setUser(null) })
      .finally(() => { if (active) setAuthStatus('ready') })
    return () => { active = false }
  }, [])

  let page
  if (pathname === '/signup') page = <AuthPage mode="signup" onLogin={setUser} />
  else if (pathname === '/login') page = <AuthPage mode="login" onLogin={(currentUser) => { setUser(currentUser); setAuthStatus('ready') }} />
  else if (pathname === '/home') page = <ProtectedPage user={user} authStatus={authStatus}><Dashboard user={user} /></ProtectedPage>
  else if (pathname === '/account') page = <ProtectedPage user={user} authStatus={authStatus}><AccountPage user={user} onUpdate={setUser} /></ProtectedPage>
  else page = <Landing />

  return (
    <div className="app-shell">
      <Header user={user} />
      {page}
      <footer>BuildLog <span>작은 기록이 쌓여, 나만의 성장으로.</span></footer>
    </div>
  )
}
