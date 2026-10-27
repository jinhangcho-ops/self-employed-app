import { useApp } from '../context'
import Sheet from '../ui/Sheet'
import SocialButtons from '../ui/SocialButtons'

/** 가입 안 한 상태에서 저장하려 할 때 */
export default function GateSheet() {
  const { close, skipGate, openAuth } = useApp()
  return (
    <Sheet title="기록을 저장하려면" onClose={close}>
      <div style={{ textAlign: 'center', padding: '4px 0 8px' }}>
        <img
          src="/img/logo.png"
          width={455}
          height={102}
          alt="domain"
          style={{ width: 150, height: 'auto', margin: '6px auto 14px' }}
        />
        <p style={{ margin: '0 0 18px', color: 'var(--hwp-color-text-secondary)' }}>
          가입하면 입력한 메뉴·판매 기록이 안전하게 저장돼요.
          <br />
          3초면 끝나요.
        </p>
        <div className="sbtns">
          <SocialButtons />
          <button className="sbtn email" onClick={() => openAuth('email', 'signup')}>
            이메일로 가입하기
          </button>
        </div>
        <button className="later" onClick={skipGate}>
          나중에 할게요
        </button>
      </div>
    </Sheet>
  )
}
