/** 홈 화면 설치 버튼용: 브라우저가 주는 설치 이벤트를 잡아 둔다 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}
let deferred: BeforeInstallPromptEvent | null = null
addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferred = e as BeforeInstallPromptEvent
})

export async function promptInstall(): Promise<string> {
  if (deferred) {
    await deferred.prompt()
    const r = await deferred.userChoice
    deferred = null
    return r.outcome === 'accepted' ? '설치했어요.' : '다음에 설치할 수 있어요.'
  }
  return matchMedia('(display-mode: standalone)').matches
    ? '이미 앱으로 실행 중이에요.'
    : '브라우저 메뉴의 ‘앱 설치’ 또는 ‘홈 화면에 추가’를 누르세요.'
}
