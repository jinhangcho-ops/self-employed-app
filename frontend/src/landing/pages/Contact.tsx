import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { track } from '@/shared/analytics'
import { ENV, SITE } from '@/shared/config'
import { toast } from '@/shared/toast'
import Layout from '../Layout'

type Field = 'name' | 'email' | 'msg' | 'agree'
const emailOk = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)

export default function Contact() {
  const nav = useNavigate()
  const form = useRef<HTMLFormElement>(null)
  const [err, setErr] = useState<Partial<Record<Field, string>>>({})
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const f = form.current!
    const d = Object.fromEntries(new FormData(f)) as Record<string, string>
    const ne: typeof err = {}
    if (!(d.name || '').trim()) ne.name = '이름을 입력해 주세요.'
    if (!emailOk(d.email || '')) ne.email = '답변 받을 이메일을 정확히 입력해 주세요. 예: owner@example.com'
    if ((d.message || '').trim().length < 5) ne.msg = '문의 내용을 5자 이상 적어 주세요.'
    if (!d.agree) ne.agree = '개인정보 수집에 동의해야 문의를 보낼 수 있어요.'
    setErr(ne)
    const first = (Object.keys(ne) as Field[])[0]
    if (first) {
      const el = f.elements.namedItem(first === 'msg' ? 'message' : first) as HTMLElement | null
      el?.focus()
      return
    }
    setBusy(true)
    const payload = {
      type: d.type,
      name: d.name.trim(),
      email: d.email.trim(),
      biz: d.biz || '',
      message: d.message.trim(),
      sentAt: new Date().toISOString(),
    }
    try {
      // 서버 주소(VITE_API_BASE)가 있으면 FastAPI /api/inquiries 로 보냄
      if (ENV.apiBase) {
        const r = await fetch(ENV.apiBase.replace(/\/+$/, '') + '/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!r.ok) throw new Error()
      }
      try {
        sessionStorage.setItem('domain.inquiry', JSON.stringify(payload))
      } catch {
        /* 무시 */
      }
      track('inquiry_submit', { type: payload.type })
      nav('/thanks')
    } catch {
      setBusy(false)
      toast('문의를 보내지 못했어요. 잠시 후 다시 시도하거나 이메일로 보내 주세요.')
    }
  }
  const inv = (k: Field) => (err[k] ? true : undefined)

  return (
    <Layout
      crumb={
        <ol>
          <li>
            <Link to="/">홈</Link>
          </li>
          <li>
            <span aria-current="page">문의하기</span>
          </li>
        </ol>
      }
      title="문의하기 | domain"
      description="domain 서비스 이용, 제휴, 오류 신고를 남겨 주세요. 평일 10~18시, 접수 후 24시간 안에 답변드려요."
    >
      <div className="wrap">
        <h1>무엇이든 물어보세요</h1>
        <p className="lead">사용 방법, 오류, 제휴 제안 모두 좋아요. 남겨 주신 이메일로 답변드려요.</p>
        <div className="two">
          <form className="card" id="inq" noValidate ref={form} onSubmit={submit}>
            <div className="field">
              <span className="lb" id="t-l">
                문의 유형 <span className="req">*</span>
              </span>
              <div className="chips" role="radiogroup" aria-labelledby="t-l">
                <input type="radio" name="type" id="t1" value="사용 방법" defaultChecked />
                <label htmlFor="t1">사용 방법</label> <input type="radio" name="type" id="t2" value="오류 신고" />
                <label htmlFor="t2">오류 신고</label> <input type="radio" name="type" id="t3" value="기능 제안" />
                <label htmlFor="t3">기능 제안</label> <input type="radio" name="type" id="t4" value="제휴·기타" />
                <label htmlFor="t4">제휴·기타</label>
              </div>
            </div>
            <div className="field">
              <label htmlFor="f-name">
                이름 <span className="req">*</span>
              </label>
              <input
                className="inp"
                id="f-name"
                name="name"
                autoComplete="name"
                placeholder="예: 홍길동…"
                required
                aria-invalid={inv('name')}
              />
              <span className="err" id="e-name">
                {err.name}
              </span>
            </div>
            <div className="field">
              <label htmlFor="f-email">
                답변 받을 이메일 <span className="req">*</span>
              </label>
              <input
                className="inp"
                id="f-email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="예: owner@example.com…"
                spellCheck={false}
                required
                aria-invalid={inv('email')}
              />
              <span className="err" id="e-email">
                {err.email}
              </span>
            </div>
            <div className="field">
              <label htmlFor="f-biz">업종</label>
              <select className="inp" id="f-biz" name="biz">
                <option value="">선택 안 함</option>
                <option>한식</option>
                <option>카페·디저트</option>
                <option>분식</option>
                <option>중식·일식·양식</option>
                <option>주점</option>
                <option>기타</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-msg">
                문의 내용 <span className="req">*</span>
              </label>
              <textarea
                className="inp"
                id="f-msg"
                name="message"
                maxLength={2000}
                placeholder="어떤 점이 궁금한지 적어 주세요…"
                required
                aria-invalid={inv('msg')}
              />
              <span className="err" id="e-msg">
                {err.msg}
              </span>
            </div>
            <label className="agree">
              <input type="checkbox" id="f-agree" name="agree" aria-invalid={inv('agree')} />
              <span>
                문의 답변을 위해 이름과 이메일을 수집하고, 답변 후 6개월 동안 보관하는 데 동의해요.{' '}
                <span className="req">*</span>
              </span>
            </label>{' '}
            <span className="err" id="e-agree" style={{ display: 'block', margin: '-12px 0 16px' }}>
              {err.agree}
            </span>{' '}
            <button className="btn btn-red" type="submit" style={{ width: '100%' }} disabled={busy}>
              {busy ? '보내는 중…' : '문의 보내기'}
            </button>
          </form>
          <aside className="card info" aria-label="다른 연락 방법">
            <div className="row2">
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </span>
              <div>
                <b>답변 시간</b>
                <span>{SITE.hours}</span>
                <br />
                <span>{SITE.reply}</span>
              </div>
            </div>
            <div className="row2">
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="5" width={18} height={14} rx="3" />
                  <path d="M4 7l8 6 8-6" />
                </svg>
              </span>
              <div>
                <b>
                  이메일 <span className="tmp">임시</span>
                </b>
                <a href={'mailto:' + SITE.email}>{SITE.email}</a>
                <button className="copybtn" type="button" data-copy="email">
                  복사
                </button>
              </div>
            </div>
            <div className="row2">
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
                  <path d="M12 4c5 0 9 3.1 9 7s-4 7-9 7c-.9 0-1.8-.1-2.6-.3L5 20l1-3.6C4.2 15.1 3 13.2 3 11c0-3.9 4-7 9-7z" />
                </svg>
              </span>
              <div>
                <b>
                  카카오톡 채널 <span className="tmp">임시</span>
                </b>
                <a href={SITE.kakaoUrl} target="_blank" rel="noopener">
                  {SITE.kakaoId}
                </a>
                <button className="copybtn" type="button" data-copy="kakaoId">
                  복사
                </button>
              </div>
            </div>
            <div className="row2">
              <span className="ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3.5" y="3.5" width={17} height={17} rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.3" cy="6.7" r="1" fill="currentColor" />
                </svg>
              </span>
              <div>
                <b>
                  인스타그램 <span className="tmp">임시</span>
                </b>
                <a href={'https://instagram.com/' + SITE.instagram.replace('@', '')} target="_blank" rel="noopener">
                  {SITE.instagram}
                </a>
              </div>
            </div>
            <p style={{ margin: '0', fontSize: 14, color: 'var(--muted)' }}>
              먼저 <Link to="/#faq">자주 묻는 질문</Link>을 보면 더 빨리 해결될 수도 있어요.
            </p>
          </aside>
        </div>
      </div>
    </Layout>
  )
}
