import type { ReactNode } from 'react'

/** 마진·식자재·설정 화면 제목 (앞에 심볼 로고) */
export default function PageTitle({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <header className="top">
      <h1 className="h1 with-sym">
        <img className="sym" src="/img/symbol.png" width={96} height={96} alt="" aria-hidden="true" />
        {children}
      </h1>
      {actions}
    </header>
  )
}
