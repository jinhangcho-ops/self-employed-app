import { Link } from 'react-router'
import Layout from '../Layout'
import { SITE } from '@/shared/config'

export default function NotFound() {
  return (
    <Layout title="페이지를 찾을 수 없어요 | domain" description="요청하신 페이지가 없거나 주소가 바뀌었어요.">
      <div className="wrap center">
        <img
          loading="lazy"
          decoding="async"
          className="pet"
          src="/img/mascot-sad.webp"
          width={162}
          height={205}
          alt="시무룩한 표정의 셰프 강아지 마스코트"
        />
        <p className="kicker">404</p>
        <h1>앗, 이 페이지는 메뉴에 없어요</h1>
        <p className="lead" style={{ marginInline: 'auto' }}>
          주소가 바뀌었거나 삭제된 페이지예요. 아래에서 원하는 곳으로 이동해 주세요.
        </p>
        <div className="ctas">
          <Link to="/" className="btn btn-red">
            홈으로 가기
          </Link>
          <a href={SITE.appUrl} className="btn btn-white">
            앱 열기
          </a>
        </div>
        <p className="note">
          <Link to="/#faq">자주 묻는 질문</Link> · <Link to="/contact">문의하기</Link>
        </p>
      </div>
    </Layout>
  )
}
