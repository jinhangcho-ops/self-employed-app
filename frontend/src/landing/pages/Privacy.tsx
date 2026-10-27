import Policy from '../components/Policy'
import { PRIVACY } from '../content/policies'

export default function Privacy() {
  return (
    <Policy
      title="개인정보처리방침"
      description="domain이 어떤 개인정보를 왜, 얼마나 보관하는지 안내해요."
      sections={PRIVACY}
    />
  )
}
