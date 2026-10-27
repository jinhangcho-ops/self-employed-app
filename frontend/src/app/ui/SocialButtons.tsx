import { toast } from '@/shared/toast'
import { AUTH_MOCK, Auth, PROV } from '../auth'
import { useApp } from '../context'
import { store } from '../store'

/** 카카오·구글 로그인 버튼 */
export default function SocialButtons() {
  const { close, signedIn } = useApp()
  const go = async (pv: 'kakao' | 'google') => {
    close()
    try {
      const r = await Auth.oauth(pv, !!store.get().onboarded)
      if (r?.user) {
        if (AUTH_MOCK) toast(`체험 모드라 실제 ${PROV[pv]} 연결 없이 로그인했어요.`)
        signedIn(r.user, !!r.isNew)
      }
    } catch {
      toast(`${PROV[pv]} 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.`)
    }
  }
  return (
    <>
      <button className="sbtn kakao" onClick={() => go('kakao')}>
        <img className="mk" src="/img/kakao.png" width={22} height={22} alt="" />
        카카오로 시작하기
      </button>
      <button className="sbtn google" onClick={() => go('google')}>
        <img className="mk" src="/img/google.png" width={22} height={22} alt="" />
        구글로 시작하기
      </button>
    </>
  )
}
