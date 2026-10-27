import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { track } from '@/shared/analytics'
import { SITE } from '@/shared/config'
import Toaster from '@/shared/Toaster'

interface Props {
  title: string
  description: string
  /** 현재 위치 (빵부스러기) */
  crumb?: ReactNode
  /** 첫 화면: 모바일 하단 고정 버튼 표시 */
  home?: boolean
  children: ReactNode
}

/** 랜딩 공통 틀: 머리글 · 본문 · 바닥글 */
export default function Layout({ title, description, crumb, home, children }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [mcta, setMcta] = useState(false)
  const shell = useRef<HTMLDivElement>(null)
  const { hash, pathname } = useLocation()

  // 머리글 아래 구분선
  useEffect(() => {
    const on = () => setScrolled(scrollY > 8)
    on()
    addEventListener('scroll', on, { passive: true })
    return () => removeEventListener('scroll', on)
  }, [])

  // 페이지 이동: #위치가 있으면 그곳으로, 없으면 맨 위로
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else scrollTo(0, 0)
  }, [hash, pathname])

  // 모바일 고정 버튼: 첫 화면 버튼이 위로 사라지면 나타남
  useEffect(() => {
    if (!home) return
    const anchor = shell.current?.querySelector('[data-hero-cta]')
    if (!anchor || !('IntersectionObserver' in window)) return setMcta(true)
    const io = new IntersectionObserver(([e]) => setMcta(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(anchor)
    return () => io.disconnect()
  }, [home])

  // 분석: data-track 붙은 링크·버튼 클릭, 자주 묻는 질문 펼침
  useEffect(() => {
    const el = shell.current
    if (!el) return
    const onClick = (e: MouseEvent) => {
      const t = (e.target as Element).closest<HTMLElement>('[data-track]')
      if (t) track(t.dataset.track!, { location: t.dataset.loc || '' })
    }
    const onToggle = (e: Event) => {
      const d = e.target as HTMLDetailsElement
      if (d.matches?.('.faq details') && d.open)
        track('faq_open', { question: d.querySelector('summary')?.textContent?.trim() })
    }
    el.addEventListener('click', onClick)
    el.addEventListener('toggle', onToggle, true)
    return () => {
      el.removeEventListener('click', onClick)
      el.removeEventListener('toggle', onToggle, true)
    }
  }, [])

  return (
    <div className="shell" ref={shell}>
      <title>{title}</title>
      <meta name="description" content={description} />
      <a className="sr" href="#main">
        본문으로 건너뛰기
      </a>
      <header className={'hd' + (scrolled ? ' scrolled' : '')}>
        <div className="wrap">
          <Link className="logo" to="/" aria-label="domain 홈" translate="no">
            <img src="/img/logo.png" alt="domain" width={135} height={30} />
          </Link>
          <nav className="nav" aria-label="주요 메뉴">
            <Link to="/#features">기능</Link>
            <Link to="/#cases">활용 사례</Link>
            <Link to="/#faq">자주 묻는 질문</Link>
            <Link to="/contact">문의하기</Link>
          </nav>
          <div className="hd-act">
            <a className="login" href={SITE.appUrl + '#login'} data-track="login_click">
              로그인
            </a>{' '}
            <a className="btn btn-red btn-sm" href={SITE.appUrl} data-track="cta_click" data-loc="header">
              무료로 시작하기
            </a>
          </div>
        </div>
      </header>
      {crumb && (
        <nav className="crumb wrap" aria-label="현재 위치">
          {crumb}
        </nav>
      )}
      <main id="main" className={home ? undefined : 'page'}>
        {children}
      </main>
      <footer className="ft">
        <div className="wrap">
          <div className="cols">
            <div>
              <img loading="lazy" decoding="async" src="/img/logo.png" alt="domain" width={117} height={26} />
              <p style={{ margin: 0 }}>
                외식업 사장님을 위한
                <br />
                메뉴별 실제 마진 계산 서비스
              </p>
            </div>
            <div>
              <h3>바로가기</h3>
              <ul>
                <li>
                  <Link to="/#features">기능 소개</Link>
                </li>
                <li>
                  <Link to="/#cases">활용 사례</Link>
                </li>
                <li>
                  <Link to="/#faq">자주 묻는 질문</Link>
                </li>
                <li>
                  <Link to="/contact">문의하기</Link>
                </li>
                <li>
                  <a href={SITE.appUrl}>앱 시작하기</a>
                </li>
              </ul>
            </div>
            <div>
              <h3>
                연락처 <span className="tmp">임시</span>
              </h3>
              <ul>
                <li>
                  이메일 <a href={'mailto:' + SITE.email}>{SITE.email}</a>
                </li>
                <li>
                  카카오톡{' '}
                  <a href={SITE.kakaoUrl} target="_blank" rel="noopener">
                    {SITE.kakaoId}
                  </a>
                </li>
                <li>
                  인스타그램{' '}
                  <a href={'https://instagram.com/' + SITE.instagram.replace('@', '')} target="_blank" rel="noopener">
                    {SITE.instagram}
                  </a>
                </li>
                <li>
                  <span>{SITE.hours}</span>
                </li>
              </ul>
            </div>
          </div>
          <p className="copy">
            <Link to="/terms">이용약관</Link> ·{' '}
            <Link to="/privacy">
              <b>개인정보처리방침</b>
            </Link>
            <br />© {new Date().getFullYear()} domain 팀. 베타 서비스예요.
          </p>
        </div>
      </footer>
      {home && (
        <div className={'mcta' + (mcta ? ' show' : '')}>
          <a className="btn btn-red" href={SITE.appUrl} data-track="cta_click" data-loc="mobile_sticky">
            무료로 시작하기
          </a>
        </div>
      )}
      <Toaster />
    </div>
  )
}
