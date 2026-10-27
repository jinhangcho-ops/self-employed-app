import { useState, type ButtonHTMLAttributes } from 'react'

/** 위험한 동작: 한 번 누르면 확인 문구로 바뀌고, 한 번 더 눌러야 실행 */
export default function ArmButton({
  confirm,
  onConfirm,
  children,
  ...rest
}: { confirm: string; onConfirm: () => void } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const [armed, setArmed] = useState(false)
  return (
    <button {...rest} onClick={() => (armed ? onConfirm() : setArmed(true))}>
      {armed ? confirm : children}
    </button>
  )
}
