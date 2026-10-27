import { Link } from 'react-router'
import type { PolicySection } from '../content/policies'
import Layout from '../Layout'

interface Props {
  title: string
  description: string
  sections: PolicySection[]
}

/** 약관류 공통 화면 */
export default function Policy({ title, description, sections }: Props) {
  return (
    <Layout
      title={`${title} | domain`}
      description={description}
      crumb={
        <ol>
          <li>
            <Link to="/">홈</Link>
          </li>
          <li>
            <span aria-current="page">{title}</span>
          </li>
        </ol>
      }
    >
      <div className="wrap" style={{ maxWidth: 760 }}>
        <h1>{title}</h1>
        <p className="lead">시행일: 정식 출시일 (현재 베타용 초안이에요. 출시 전 검토 후 확정돼요.)</p>
        {sections.map((s) => (
          <section key={s.title} style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{s.title}</h2>
            <p style={{ margin: 0, whiteSpace: 'pre-line', color: 'var(--text)' }}>
              {Array.isArray(s.body) ? s.body.join('\n') : s.body}
            </p>
          </section>
        ))}
        <p className="note" style={{ marginTop: 40 }}>
          궁금한 점은 <Link to="/contact">문의하기</Link>로 남겨 주세요.
        </p>
      </div>
    </Layout>
  )
}
