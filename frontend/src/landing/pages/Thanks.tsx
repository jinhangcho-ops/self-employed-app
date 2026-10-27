import { Link } from 'react-router'
import { SITE } from '@/shared/config'
import Layout from '../Layout'

interface Inquiry {
  type: string
  name: string
  email: string
}
/** 방금 보낸 문의 요약 (문의하기 화면에서 저장) */
function readInquiry(): Inquiry | null {
  try {
    return JSON.parse(sessionStorage.getItem('domain.inquiry') || 'null')
  } catch {
    return null
  }
}

export default function Thanks() {
  const p = readInquiry()
  return (
    <Layout
      crumb={
        <ol>
          <li>
            <Link to="/">홈</Link>
          </li>
          <li>
            <Link to="/contact">문의하기</Link>
          </li>
          <li>
            <span aria-current="page">접수 완료</span>
          </li>
        </ol>
      }
      title="문의 접수 완료 | domain"
      description="문의가 접수됐어요. 평일 기준 24시간 안에 이메일로 답변드릴게요."
    >
      <div className="wrap center">
        <img
          loading="lazy"
          decoding="async"
          className="pet"
          src="/img/mascot-happy.webp"
          width={161}
          height={205}
          alt="활짝 웃는 셰프 강아지 마스코트"
        />
        <h1>문의해 주셔서 감사해요!</h1>
        <p className="lead" style={{ marginInline: 'auto' }}>
          남겨 주신 이메일로 <b>{SITE.reply}</b>드릴게요.
        </p>
        {p && (
          <dl className="summary">
            {[
              ['문의 유형', p.type],
              ['이름', p.name],
              ['답변 받을 이메일', p.email],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="ctas">
          <a href={SITE.appUrl} className="btn btn-red" data-track="cta_click" data-loc="thanks">
            앱 둘러보기
          </a>
          <Link to="/" className="btn btn-white">
            홈으로
          </Link>
        </div>
        <p className="note">
          급한 문의는 카카오톡 채널{' '}
          <a href={SITE.kakaoUrl} target="_blank" rel="noopener">
            {SITE.kakaoId}
          </a>
          으로 보내 주세요.
        </p>
      </div>
    </Layout>
  )
}
