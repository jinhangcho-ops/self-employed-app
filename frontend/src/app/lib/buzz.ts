/** 누를 때 아주 짧은 진동 (지원하는 휴대폰만) */
export const buzz = (ms = 8) => {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* 진동 미지원 */
  }
}
