import { imgOf } from '../lib/images'
import Icon from './Icon'

export default function Thumb({ o, kind }: { o: { id: string; img?: string }; kind: 'menu' | 'ing' }) {
  const src = imgOf(o, kind)
  if (src)
    return (
      <span className="thumb">
        <img src={src} alt="" width={56} height={56} />
      </span>
    )
  return (
    <span className="thumb ph" aria-hidden="true">
      <Icon name="cam" />
    </span>
  )
}
