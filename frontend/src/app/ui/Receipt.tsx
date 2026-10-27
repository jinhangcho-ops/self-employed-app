import type { ReactNode } from 'react'
import { won } from '../lib/format'

export interface ReceiptRow {
  label: ReactNode
  value: string
}

/** 홈의 톱니 모양 영수증 카드 */
export default function Receipt({
  title,
  rows,
  total,
  small,
}: {
  title?: string
  rows: ReceiptRow[]
  total: number
  small?: boolean
}) {
  return (
    <div className={'rc3' + (small ? ' rc3-sm' : '')}>
      {title && (
        <p className="rc3-title" aria-hidden="true">
          {title}
        </p>
      )}
      <dl className="rc3-rows num">
        {rows.map((r, i) => (
          <div key={i}>
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
      <div className="rc3-total">
        <span>{total < 0 ? '손해' : '남은 돈'}</span>
        <b className={'num' + (total < 0 ? ' loss' : '')}>{won(total)}</b>
      </div>
    </div>
  )
}
