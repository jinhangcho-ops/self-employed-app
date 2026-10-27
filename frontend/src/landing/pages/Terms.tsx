import Policy from '../components/Policy'
import { TERMS } from '../content/policies'

export default function Terms() {
  return <Policy title="이용약관" description="domain 서비스 이용약관" sections={TERMS} />
}
