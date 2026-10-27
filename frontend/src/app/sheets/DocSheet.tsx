import { DOCS } from '../auth'
import { useApp } from '../context'
import Sheet from '../ui/Sheet'

export default function DocSheet({ doc }: { doc: keyof typeof DOCS }) {
  const { close } = useApp()
  return (
    <Sheet title={doc === 'terms' ? '이용약관' : '개인정보 수집·이용'} onClose={close}>
      <p className="doc">{DOCS[doc]}</p>
    </Sheet>
  )
}
