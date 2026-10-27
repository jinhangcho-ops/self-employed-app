import { useState } from 'react'
import { track } from '@/shared/analytics'
import { toast } from '@/shared/toast'
import { Auth, PROV } from '../auth'
import { useApp } from '../context'
import { TPL, seed } from '../data/templates'
import { uid } from '../lib/format'
import { promptInstall } from '../lib/install'
import { store, useAppState } from '../store'
import type { BizKey, Settings as SettingsT } from '../types'
import ArmButton from '../ui/ArmButton'
import Icon from '../ui/Icon'
import PageTitle from '../ui/PageTitle'

export default function Settings() {
  const S = useAppState()
  const s = S.settings
  const u = S.user
  const { go, openAuth, setUi, ui } = useApp()
  const [tplArm, setTplArm] = useState<BizKey | null>(null)
  const [notifyMsg, setNotifyMsg] = useState('')
  const [installMsg, setInstallMsg] = useState('iPhone은 Safari 공유 버튼 → ‘홈 화면에 추가’를 누르세요.')

  const set = <K extends keyof SettingsT>(k: K, v: SettingsT[K]) =>
    store.update((d) => {
      d.settings[k] = v
      if (k === 'close') d.settings.lastNotified = ''
    })

  const toggleNotify = async () => {
    const on = !s.notify
    set('notify', on)
    if (!on) return setNotifyMsg('')
    let p: NotificationPermission | 'unsupported' = 'unsupported'
    try {
      if ('Notification' in window) p = await Notification.requestPermission()
    } catch {
      /* 무시 */
    }
    setNotifyMsg(
      p === 'granted'
        ? `매일 ${s.close}에 알려드려요.`
        : '휴대폰 알림이 꺼져 있어 앱 안에서만 알려드려요. 홈 화면에 설치하면 휴대폰 알림을 켤 수 있어요.',
    )
  }

  const loadTpl = (k: BizKey) => {
    if (tplArm !== k) return setTplArm(k)
    setTplArm(null)
    const next = seed(k, false)
    next.settings.ocrApi = s.ocrApi
    next.user = S.user
    next.onboarded = S.onboarded
    store.replace(next)
    go('menus')
    toast(`${TPL[k].label} 템플릿을 불러왔어요. 가격을 내 가게 기준으로 고쳐 주세요.`)
  }

  const logout = async () => {
    await Auth.signOut()
    store.update((d) => {
      d.user = null
    })
    go('cal')
    toast('로그아웃했어요.')
  }
  const withdraw = async () => {
    await Auth.signOut()
    track('withdraw')
    store.replace(seed('hansik', true))
    go('cal')
    toast('탈퇴했어요. 그동안 이용해 주셔서 고마워요.')
  }

  return (
    <>
      <PageTitle>설정</PageTitle>
      {u ? (
        <div className="acct">
          <span className="av">{(u.name || '사')[0]}</span>
          <div className="grow">
            <div className="t">
              {u.name}
              <span className={'ptag ' + u.provider}>{PROV[u.provider] || ''}</span>
            </div>
            <div className="s">{u.email}</div>
          </div>
          <ArmButton
            className="link"
            confirm="한 번 더 누르면 로그아웃"
            onConfirm={logout}
            style={{ fontSize: 'var(--hwp-font-headline-2)', color: 'var(--hwp-color-text-secondary)' }}
          >
            로그아웃
          </ArmButton>
        </div>
      ) : (
        <button className="acct" onClick={() => openAuth()} style={{ width: '100%', textAlign: 'left' }}>
          <span className="av" style={{ background: 'var(--hwp-color-border-disabled)' }}>
            ?
          </span>
          <div className="grow">
            <div className="t">로그인하고 기록 저장하기</div>
            <div className="s">카카오 · 구글 · 이메일</div>
          </div>
          <span style={{ color: 'var(--hwp-color-text-muted)' }}>
            <Icon name="r" size={20} />
          </span>
        </button>
      )}
      <label className="field">
        <span>가게 이름</span>
        <input
          autoComplete="off"
          name="set-store"
          className="inp"
          value={s.store}
          onChange={(e) => set('store', e.target.value)}
        />
      </label>

      <section className="sec">
        <div className="row between">
          <span className="label">판매 채널 수수료</span>
          <button
            className="link"
            onClick={() =>
              store.update((d) => {
                d.channels.push({ id: uid(), name: '새 채널', fee: 0, fixed: 0 })
              })
            }
          >
            채널 추가
          </button>
        </div>
        <div className="chrow label" style={{ marginTop: 10 }}>
          <span>채널</span>
          <span>수수료 %</span>
          <span>개당 추가비용</span>
          <span style={{ width: 36 }} />
        </div>
        {S.channels.map((c, i) => (
          <div className="chrow" key={c.id}>
            <input
              autoComplete="off"
              name={'ch-n-' + c.id}
              className="inp"
              value={c.name}
              aria-label="채널 이름"
              onChange={(e) =>
                store.update((d) => {
                  d.channels[i].name = e.target.value
                })
              }
            />
            <input
              autoComplete="off"
              name={'ch-f-' + c.id}
              className="inp num"
              type="number"
              step="0.1"
              min="0"
              value={c.fee}
              aria-label="수수료 %"
              onChange={(e) =>
                store.update((d) => {
                  d.channels[i].fee = Math.max(0, +e.target.value || 0)
                })
              }
            />
            <input
              autoComplete="off"
              name={'ch-x-' + c.id}
              className="inp num"
              type="number"
              step="10"
              min="0"
              value={c.fixed || 0}
              aria-label="개당 추가비용(원)"
              onChange={(e) =>
                store.update((d) => {
                  d.channels[i].fixed = Math.max(0, +e.target.value || 0)
                })
              }
            />
            <button
              className="x"
              aria-label="채널 삭제"
              disabled={S.channels.length < 2}
              onClick={() => {
                store.update((d) => {
                  d.channels.splice(i, 1)
                })
                if (ui.ch === c.id) setUi({ ch: store.get().channels[0].id })
              }}
            >
              <Icon name="x" />
            </button>
          </div>
        ))}
        <p className="hint">기본값은 예시예요. 실제 계약 요율과 포장용기·배달비 부담액으로 바꿔 주세요.</p>
      </section>

      <section className="sec">
        <span className="label">정리 알림</span>
        <div className="row between" style={{ marginTop: 10 }}>
          <div>
            <div style={{ color: 'var(--hwp-color-foreground)', fontWeight: 500 }}>영업 종료 시각에 판매 입력 알림</div>
            <div className="hint" style={{ margin: 0 }}>
              앱이 열려 있거나 설치돼 있을 때 알려드려요.
            </div>
          </div>
          <button
            className="toggle"
            role="switch"
            aria-checked={s.notify}
            onClick={toggleNotify}
            aria-label="정리 알림"
          />
        </div>
        <div className="grid2">
          <label className="field">
            <span>영업 시작 시각</span>
            <input
              autoComplete="off"
              name="set-open"
              className="inp num"
              type="time"
              value={s.open || '11:00'}
              onChange={(e) => set('open', e.target.value)}
            />
          </label>
          <label className="field">
            <span>영업 종료 시각</span>
            <input
              autoComplete="off"
              name="set-close"
              className="inp num"
              type="time"
              value={s.close}
              onChange={(e) => set('close', e.target.value)}
            />
          </label>
        </div>
        <p className="hint">{notifyMsg}</p>
      </section>

      <section className="sec">
        <span className="label">영수증 인식</span>
        <label className="field">
          <span>서버 주소 (FastAPI) · 영수증 인식</span>
          <input
            autoComplete="off"
            name="set-ocr"
            className="inp"
            value={s.ocrApi}
            placeholder="예: https://내-서버.onrender.com…"
            inputMode="url"
            onChange={(e) => set('ocrApi', e.target.value)}
          />
        </label>
        <p className="hint">
          비워 두면 휴대폰 안에서 인식해요(한글 정확도 낮음). 서버를 넣으면 Google Cloud Vision으로 읽고, 확정한
          영수증을 DB에 저장해요.
        </p>
      </section>

      <section className="sec">
        <span className="label">업종 템플릿으로 시작</span>
        <p className="hint">식자재와 메뉴 샘플을 불러와요. 지금 데이터는 모두 바뀌어요.</p>
        <div className="row" style={{ marginTop: 10 }}>
          {(Object.keys(TPL) as BizKey[]).map((k) => (
            <button key={k} className="chip" onClick={() => loadTpl(k)}>
              {TPL[k].label}
            </button>
          ))}
        </div>
        {tplArm && (
          <div className="banner">
            <div>
              <b>{TPL[tplArm].label} 템플릿</b>으로 바꾸면 지금 메뉴·식자재·판매 기록이 사라져요.{' '}
              <button className="link" onClick={() => loadTpl(tplArm)}>
                바꾸기
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="sec">
        <span className="label">앱</span>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn" onClick={async () => setInstallMsg(await promptInstall())}>
            홈 화면에 설치
          </button>
          <ArmButton
            className="btn danger"
            confirm="한 번 더 누르면 비워요"
            onConfirm={() => {
              store.update((d) => {
                d.sales = {}
                d.sample = false
              })
              toast('판매 기록을 비웠어요.')
            }}
          >
            판매 기록 비우기
          </ArmButton>
        </div>
        <p className="hint">{installMsg}</p>
      </section>

      {u && (
        <section className="sec">
          <span className="label">계정</span>
          <p className="hint">탈퇴하면 이 계정에 저장된 메뉴·식자재·판매 기록이 모두 삭제돼요.</p>
          <ArmButton
            className="btn danger"
            style={{ marginTop: 10 }}
            confirm="한 번 더 누르면 모든 기록이 삭제돼요"
            onConfirm={withdraw}
          >
            회원 탈퇴
          </ArmButton>
        </section>
      )}
    </>
  )
}
