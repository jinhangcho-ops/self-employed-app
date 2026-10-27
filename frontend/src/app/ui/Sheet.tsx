import { type ReactNode } from 'react'
import Icon from './Icon'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
  foot?: ReactNode
  /** 가운데 뜨는 창 (영수증) */
  center?: boolean
}

/** 아래에서 올라오는 시트. 바깥(어두운 부분)을 누르면 닫힌다. */
export default function Sheet({ title, onClose, children, foot, center }: Props) {
  return (
    <div className={'mask' + (center ? ' center' : '')} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sh-head">
          <h2>{title}</h2>
          <button className="x" onClick={onClose} aria-label="닫기">
            <Icon name="x" />
          </button>
        </div>
        <div className="sh-body">{children}</div>
        {foot && <div className="sh-foot">{foot}</div>}
      </div>
    </div>
  )
}
