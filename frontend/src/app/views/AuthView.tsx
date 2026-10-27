import { useRef, useState, type FormEvent } from 'react'
import { toast } from '@/shared/toast'
import { AUTH_MOCK, Auth, emailOk, pwOk } from '../auth'
import { useApp } from '../context'
import { useAppState } from '../store'
import Icon from '../ui/Icon'
import SocialButtons from '../ui/SocialButtons'

type Err = Partial<Record<'email' | 'pw' | 'pw2' | 'agree' | 'form', string>>

export default function AuthView() {
  const S = useAppState()
  const { auth, setAuth, authBack, open, signedIn } = useApp()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [agree, setAgree] = useState({ terms: false, privacy: false, mkt: false })
  const [err, setErr] = useState<Err>({})
  const [busy, setBusy] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const pwRef = useRef<HTMLInputElement>(null)
  const pw2Ref = useRef<HTMLInputElement>(null)
  const agreeRef = useRef<HTMLInputElement>(null)

  const back = (
    <header className="top">
      <button className="iconbtn" onClick={authBack} aria-label="뒤로">
        <Icon name="l" />
      </button>
      <span />
      <span style={{ width: 40 }} />
    </header>
  )

  if (auth.mode === 'main')
    return (
      <>
        {back}
        <div className="auth">
          <img className="logo" src="/img/logo.png" width={455} height={102} alt="domain" />
          <h1>3초 만에 시작하기</h1>
          <p className="sub">
            가입하면 입력한 기록이 안전하게 저장되고
            <br />
            휴대폰을 바꿔도 그대로 이어서 쓸 수 있어요.
          </p>
          <div className="sbtns">
            <SocialButtons />
            <div className="or">또는</div>
            <button className="sbtn email" onClick={() => setAuth({ mode: 'email', tab: 'signup' })}>
              이메일로 가입하기
            </button>
          </div>
          <p
            style={{
              margin: '16px 0 0',
              fontSize: 'var(--hwp-font-headline-2)',
              color: 'var(--hwp-color-text-secondary)',
            }}
          >
            이미 이메일로 가입했나요?{' '}
            <button
              className="link"
              style={{ fontSize: 'inherit' }}
              onClick={() => setAuth({ mode: 'email', tab: 'login' })}
            >
              이메일 로그인
            </button>
          </p>
          {!S.user && (
            <button className="later" onClick={authBack}>
              가입 없이 둘러볼게요
            </button>
          )}
          {AUTH_MOCK && (
            <p className="mode">지금은 체험 모드예요. 실제 카카오·구글 연결 없이 이 기기 안에서만 로그인돼요.</p>
          )}
        </div>
      </>
    )

  const su = auth.tab === 'signup'
  const all = agree.terms && agree.privacy && agree.mkt
  const clearErr = (k: keyof Err) => err[k] && setErr((e) => ({ ...e, [k]: '' }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const em = email.trim()
    const ne: Err = {}
    if (!emailOk(em)) ne.email = '이메일 형식을 확인해 주세요. 예: owner@example.com'
    if (su && !pwOk(pw)) ne.pw = '비밀번호는 영문과 숫자를 섞어 8자 이상으로 만들어 주세요.'
    if (!su && !pw) ne.pw = '비밀번호를 입력해 주세요.'
    if (su && pw2 !== pw) ne.pw2 = '비밀번호가 서로 달라요.'
    if (su && !(agree.terms && agree.privacy)) ne.agree = '필수 항목에 동의해야 가입할 수 있어요.'
    const first = Object.keys(ne)[0]
    if (first) {
      setErr(ne)
      const el = { email: emailRef, pw: pwRef, pw2: pw2Ref, agree: agreeRef }[first as 'email']
      el.current?.focus()
      return
    }
    setBusy(true)
    setErr({})
    try {
      const r = su ? await Auth.signUp(em, pw, agree.mkt) : await Auth.signIn(em, pw)
      setBusy(false)
      if (r.confirm) {
        setAuth({ mode: 'main' })
        toast(`${em}로 인증 메일을 보냈어요. 메일의 링크를 누르면 가입이 끝나요.`)
        return
      }
      setPw('')
      setPw2('')
      if (r.user) signedIn(r.user, !!r.isNew)
    } catch (er) {
      setBusy(false)
      setErr({ form: (er as Error).message || '잠시 후 다시 시도해 주세요.' })
    }
  }

  const reset = async () => {
    if (!emailOk(email)) {
      setErr({ email: '비밀번호를 재설정할 이메일을 먼저 입력해 주세요.' })
      emailRef.current?.focus()
      return
    }
    try {
      await Auth.reset(email)
      toast(`${email}로 비밀번호 재설정 링크를 보냈어요.${AUTH_MOCK ? ' (체험 모드라 실제로 보내지는 않아요)' : ''}`)
    } catch {
      toast('메일을 보내지 못했어요. 이메일을 확인해 주세요.')
    }
  }

  const setAg = (k: 'all' | 'terms' | 'privacy' | 'mkt', v: boolean) => {
    const next = k === 'all' ? { terms: v, privacy: v, mkt: v } : { ...agree, [k]: v }
    setAgree(next)
    if (next.terms && next.privacy) clearErr('agree')
  }

  return (
    <>
      {back}
      <div className="auth" style={{ paddingTop: 4 }}>
        <h1 style={{ marginTop: 0 }}>{su ? '이메일로 가입하기' : '이메일 로그인'}</h1>
        <div className="tabs2" role="tablist">
          <button
            role="tab"
            aria-selected={su}
            onClick={() => {
              setAuth({ tab: 'signup' })
              setErr({})
            }}
          >
            회원가입
          </button>
          <button
            role="tab"
            aria-selected={!su}
            onClick={() => {
              setAuth({ tab: 'login' })
              setErr({})
            }}
          >
            로그인
          </button>
        </div>
        <form className="form" noValidate onSubmit={submit}>
          <label className="field">
            <span>이메일</span>
            <input
              ref={emailRef}
              name="email"
              className="inp"
              id="a-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              placeholder="예: owner@example.com…"
              spellCheck={false}
              autoCapitalize="off"
              onChange={(e) => {
                setEmail(e.target.value)
                clearErr('email')
              }}
            />
            <span className="ferr">{err.email}</span>
          </label>
          <label className="field" style={{ marginTop: 6 }}>
            <span>비밀번호</span>
            <input
              ref={pwRef}
              name="password"
              className="inp"
              id="a-pw"
              type="password"
              autoComplete={su ? 'new-password' : 'current-password'}
              value={pw}
              placeholder={su ? '영문과 숫자 포함 8자 이상…' : '비밀번호…'}
              onChange={(e) => {
                setPw(e.target.value)
                clearErr('pw')
              }}
            />
            <span className="ferr">{err.pw}</span>
          </label>
          {su ? (
            <>
              <label className="field" style={{ marginTop: 6 }}>
                <span>비밀번호 확인</span>
                <input
                  ref={pw2Ref}
                  name="password-confirm"
                  className="inp"
                  id="a-pw2"
                  type="password"
                  autoComplete="new-password"
                  value={pw2}
                  placeholder="한 번 더 입력…"
                  onChange={(e) => {
                    setPw2(e.target.value)
                    clearErr('pw2')
                  }}
                />
                <span className="ferr">{err.pw2}</span>
              </label>
              <div className="agrees">
                <label className="agree all">
                  <input
                    ref={agreeRef}
                    type="checkbox"
                    id="ag-all"
                    checked={all}
                    onChange={(e) => setAg('all', e.target.checked)}
                  />
                  <span className="grow">전체 동의</span>
                </label>
                <label className="agree">
                  <input type="checkbox" checked={agree.terms} onChange={(e) => setAg('terms', e.target.checked)} />
                  <span className="grow">
                    <span className="req">[필수]</span> 이용약관
                  </span>
                  <button
                    type="button"
                    className="view-doc"
                    onClick={(e) => {
                      e.preventDefault()
                      open({ kind: 'doc', doc: 'terms' })
                    }}
                  >
                    보기
                  </button>
                </label>
                <label className="agree">
                  <input type="checkbox" checked={agree.privacy} onChange={(e) => setAg('privacy', e.target.checked)} />
                  <span className="grow">
                    <span className="req">[필수]</span> 개인정보 수집·이용
                  </span>
                  <button
                    type="button"
                    className="view-doc"
                    onClick={(e) => {
                      e.preventDefault()
                      open({ kind: 'doc', doc: 'privacy' })
                    }}
                  >
                    보기
                  </button>
                </label>
                <label className="agree">
                  <input type="checkbox" checked={agree.mkt} onChange={(e) => setAg('mkt', e.target.checked)} />
                  <span className="grow">
                    <span className="opt">[선택]</span> 이벤트·혜택 알림 받기
                  </span>
                </label>
              </div>
              <p className="ferr" style={{ margin: '6px 0 0' }}>
                {err.agree}
              </p>
            </>
          ) : (
            <div style={{ textAlign: 'right', marginTop: 2 }}>
              <button type="button" className="link" style={{ fontSize: 'var(--hwp-font-headline-2)' }} onClick={reset}>
                비밀번호를 잊었어요
              </button>
            </div>
          )}
          {err.form && (
            <div className="banner">
              <div className="warn-t">{err.form}</div>
            </div>
          )}
          <button className="btn primary block" type="submit" style={{ marginTop: 18 }} disabled={busy}>
            {busy ? '잠시만요…' : su ? '가입하기' : '로그인'}
          </button>
        </form>
        {AUTH_MOCK && <p className="mode">체험 모드: 가입 정보는 이 기기에만 저장돼요.</p>}
      </div>
    </>
  )
}
