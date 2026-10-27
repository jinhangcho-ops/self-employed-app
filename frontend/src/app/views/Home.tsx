import { useApp } from '../context'
import { TPL } from '../data/templates'
import { dayLabel, ds, parseKey, short, todayKey, won } from '../lib/format'
import { WARN_RATE, bizStatus, chMargin, costRate, dayStats } from '../lib/margin'
import { useAppState } from '../store'
import Icon from '../ui/Icon'
import Receipt from '../ui/Receipt'
import { toast } from '@/shared/toast'

const WEEK = ['일', '월', '화', '수', '목', '금', '토']

/** 홈: 간판 → 큰 버튼 → 오늘 영수증 → 달력 → 많이 남는 메뉴 → 영업 정보 */
export default function Home() {
  const S = useAppState()
  const { ui, setUi, go, gate, openReceipt, openAuth } = useApp()
  const { y, m, sel, metric } = ui
  const today = todayKey()
  const first = new Date(y, m, 1).getDay()
  const days = new Date(y, m + 1, 0).getDate()

  const monthDays = Array.from({ length: days }, (_, i) => dayStats(S, ds(y, m, i + 1))).filter((st) => st.cnt)
  const mProfit = monthDays.reduce((a, st) => a + st.profit, 0)
  const openDays = monthDays.length
  const cells = Array.from({ length: days }, (_, i) => {
    const d = i + 1
    const key = ds(y, m, d)
    const st = dayStats(S, key)
    const val = st.cnt ? (metric === 'profit' ? short(st.profit) : short(st.rev).replace('+', '')) : ''
    const cls = ['day', key > today && 'future', key === today && 'today', key === sel && 'sel', st.cnt && 'has']
      .filter(Boolean)
      .join(' ')
    return (
      <button key={key} className={cls} onClick={() => setUi({ sel: key })} aria-label={`${m + 1}월 ${d}일`}>
        <span className="n num">{d}</span>
        <span className={'v num' + (st.cnt && metric === 'profit' && st.profit < 0 ? ' loss' : '')}>{val}</span>
      </button>
    )
  })

  const st = dayStats(S, sel)
  const td = dayStats(S, today)
  const bz = bizStatus(S.settings.open, S.settings.close)
  const biz = TPL[S.tpl]?.label || '외식업'
  const hall = S.channels[0] || { fee: 0, fixed: 0, name: '홀' }
  const top = S.menus
    .map((mn) => ({ mn, m: chMargin(mn, hall, S.ings), r: costRate(mn, S.ings) }))
    .sort((a, b) => b.m - a.m)
    .slice(0, 3)
  const hours = `${S.settings.open || '11:00'}–${S.settings.close || '21:30'}`

  const salesToday = () => {
    const t = new Date()
    setUi({ sel: todayKey(), y: t.getFullYear(), m: t.getMonth() })
    gate({ kind: 'sales' })
  }
  const salesSel = () => {
    if (sel > today) return toast('미래 날짜에는 입력할 수 없어요.')
    gate({ kind: 'sales' })
  }
  const moveMonth = (d: number) => {
    let mm = m + d,
      yy = y
    if (mm < 0) {
      mm = 11
      yy--
    }
    if (mm > 11) {
      mm = 0
      yy++
    }
    setUi({ y: yy, m: mm })
  }

  return (
    <>
      <div className="appbar">
        <img className="applogo" src="/img/logo.png" width={455} height={102} alt="domain" translate="no" />
        <button className="iconbtn" onClick={() => go('settings')} aria-label="설정">
          <Icon name="gear" />
        </button>
      </div>
      <header className="sign">
        <img className="sign-pet" src="/img/mascot-happy.webp" width={161} height={205} alt="" />
        <div className="sign-top">
          <span className="biz">{biz}</span>
        </div>
        <h1 className="store-name">{S.settings.store}</h1>
        <div className="status">
          <span className={'lamp ' + bz.cls}>{bz.label}</span>
          <span className="hours num">{hours}</span>
          <span className="left">{bz.sub}</span>
        </div>
      </header>

      {!S.user ? (
        <div className="note">
          <p className="note-t">예시 데이터로 둘러보는 중이에요</p>
          <p className="note-b">가입하면 내 가게 기록을 저장할 수 있어요.</p>
          <button className="note-a" onClick={() => openAuth()}>
            내 가게로 시작하기
          </button>
        </div>
      ) : S.sample ? (
        <div className="note">
          <p className="note-t">예시 데이터로 보고 있어요</p>
          <p className="note-b">설정에서 업종 템플릿을 고르면 내 가게로 바뀌어요.</p>
          <button className="note-a" onClick={() => go('settings')}>
            설정 열기
          </button>
        </div>
      ) : null}

      <div className="actions">
        <button className="cta-main" onClick={salesToday}>
          <Icon name="plus" />
          <span>오늘 판매 입력하기</span>
        </button>
        <div className="cta-row">
          <button className="cta-sub" onClick={openReceipt}>
            <Icon name="cam" />
            <span>영수증 찍기</span>
          </button>
          <button className="cta-sub" onClick={() => go('menus')}>
            <Icon name="menu" />
            <span>메뉴 마진 보기</span>
          </button>
        </div>
      </div>

      <section className="blk" aria-labelledby="h-today">
        <div className="blk-h">
          <h2 id="h-today">오늘</h2>
          <span className="hint-r">{dayLabel(new Date())}</span>
        </div>
        {td.cnt ? (
          <Receipt
            title="영수증"
            total={td.profit}
            rows={[
              {
                label: (
                  <>
                    매출 <small>{td.cnt}개</small>
                  </>
                ),
                value: won(td.rev),
              },
              { label: '식자재 원가', value: '− ' + won(td.cost) },
              { label: '채널 수수료', value: '− ' + won(td.fee) },
            ]}
          />
        ) : (
          <div className="today empty-today">
            <b>아직 입력한 판매가 없어요</b>
            <span>영업이 끝나면 위 빨간 버튼으로 1분 만에 입력하세요.</span>
          </div>
        )}
      </section>

      <section className="blk" aria-labelledby="h-cal">
        <div className="blk-h">
          <h2 id="h-cal" className="num">
            {y}년 {m + 1}월
          </h2>
          <div className="mnav">
            <button className="iconbtn" onClick={() => moveMonth(-1)} aria-label="이전 달">
              <Icon name="l" />
            </button>
            <button className="iconbtn" onClick={() => moveMonth(1)} aria-label="다음 달">
              <Icon name="r" />
            </button>
          </div>
        </div>
        <div className="row between" style={{ marginBottom: 4 }}>
          <div className="row">
            <button className="chip" onClick={() => setUi({ metric: 'profit' })} aria-pressed={metric === 'profit'}>
              이익
            </button>
            <button className="chip" onClick={() => setUi({ metric: 'rev' })} aria-pressed={metric === 'rev'}>
              매출
            </button>
          </div>
          <span className="hint-r num">
            영업 {openDays}일 · 이익 {won(mProfit)}
          </span>
        </div>
        <div className="cal">
          {WEEK.map((w) => (
            <div key={w} className="wd">
              {w}
            </div>
          ))}
          {Array.from({ length: first }, (_, i) => (
            <div key={'e' + i} />
          ))}
          {cells}
        </div>
        {sel !== today && (
          <div className="dayd2">
            <div className="row between">
              <span className="dayd-t">{dayLabel(parseKey(sel))}</span>
              <button className="link" onClick={salesSel}>
                {st.cnt ? '판매 수정' : '판매 입력'}
              </button>
            </div>
            {st.cnt ? (
              <Receipt
                small
                total={st.profit}
                rows={st.per.map((p) => ({
                  label: (
                    <>
                      {p.m.name} <small>{p.n}개</small>
                    </>
                  ),
                  value: won(p.p),
                }))}
              />
            ) : (
              <p className="hint" style={{ margin: '6px 0 0' }}>
                {sel > today ? '아직 오지 않은 날이에요.' : '이날 입력한 판매가 없어요.'}
              </p>
            )}
          </div>
        )}
      </section>

      <section className="blk" aria-labelledby="h-menu">
        <div className="blk-h">
          <h2 id="h-menu">많이 남는 메뉴</h2>
          <button className="link" onClick={() => go('menus')}>
            전체 보기
          </button>
        </div>
        {top.length ? (
          <>
            <ol className="rank">
              {top.map((t, i) => (
                <li key={t.mn.id}>
                  <span className="rk num">{i + 1}</span>
                  <span className="rn">{t.mn.name}</span>
                  <span className="rm num">{won(t.m)}</span>
                  <span className={'pill num' + (t.r >= WARN_RATE ? ' warn' : '')}>
                    원가율 {Math.round(t.r * 100)}%
                  </span>
                </li>
              ))}
            </ol>
            <p className="hint">{hall.name || '홀'}에서 1개 팔 때 남는 돈 기준이에요.</p>
          </>
        ) : (
          <p className="hint">메뉴를 등록하면 많이 남는 순서로 보여 드려요.</p>
        )}
      </section>

      <section className="blk" aria-labelledby="h-info">
        <div className="blk-h">
          <h2 id="h-info">영업 정보</h2>
          <button className="link" onClick={() => go('settings')}>
            수정
          </button>
        </div>
        <dl className="info">
          <div>
            <dt>영업 시간</dt>
            <dd className="num">{hours}</dd>
          </div>
          <div>
            <dt>정리 알림</dt>
            <dd>{S.settings.notify ? `${S.settings.close}에 알려 드려요` : '꺼져 있어요'}</dd>
          </div>
          <div>
            <dt>판매 채널</dt>
            <dd>{S.channels.map((c) => c.name).join(', ')}</dd>
          </div>
          <div>
            <dt>메뉴·식자재</dt>
            <dd className="num">
              메뉴 {S.menus.length}개, 식자재 {S.ings.length}개
            </dd>
          </div>
        </dl>
      </section>
    </>
  )
}
