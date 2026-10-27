import { useEffect, useState } from 'react'
import { onToast } from './toast'

export default function Toaster() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => onToast(setMsg), [])
  if (!msg) return null
  return (
    <div className="toast" role="status" key={msg}>
      {msg}
    </div>
  )
}
