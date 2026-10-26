import ApiStatus from './components/ApiStatus'

const sections = [
  { number: '01', title: '공부 기록', description: '오늘 배운 것과 작업한 내용을 차곡차곡 남겨요.' },
  { number: '02', title: '할 일', description: '앞으로 할 일을 정리하고 끝낸 일을 확인해요.' },
  { number: '03', title: '오류 기록', description: '막혔던 문제와 해결 과정을 다음을 위해 모아둬요.' },
]

export default function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="BuildLog 홈"><span className="brand-mark" aria-hidden="true">B</span>BuildLog<span className="brand-period">.</span></a>
        <nav aria-label="주 메뉴"><a className="nav-link" href="#overview" aria-current="page">홈</a></nav>
      </header>
      <main id="overview">
        <div className="intro">
          <p className="eyebrow">나의 학습 기록장</p>
          <h1>배운 오늘을,<br />다음의 나에게.</h1>
          <p className="intro-description">공부한 내용부터 할 일, 오류를 해결한 순간까지.<br className="desktop-break" /> 흩어진 공부의 과정을 한곳에 모아요.</p>
        </div>
        <section aria-labelledby="records-title">
          <div className="section-heading"><h2 id="records-title">기록할 공간</h2><span>하나씩 준비하고 있어요</span></div>
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
        <ApiStatus />
      </main>
      <footer>BuildLog <span>작은 기록이 쌓여, 나만의 성장으로.</span></footer>
    </div>
  )
}
