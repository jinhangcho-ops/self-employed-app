/** 화면 아래 잠깐 뜨는 알림. React 밖에서도 부를 수 있게 작은 이벤트로 만든다. */
type Listener = (msg: string | null) => void
const listeners = new Set<Listener>()
let timer: ReturnType<typeof setTimeout> | undefined

export function toast(msg: string, ms = 3200) {
  clearTimeout(timer)
  listeners.forEach((l) => l(msg))
  timer = setTimeout(() => listeners.forEach((l) => l(null)), ms)
}

export function onToast(l: Listener) {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
