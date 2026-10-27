/**
 * 앱 데이터 저장소.
 * 지금은 기기(localStorage)에 저장하고, ERD가 나오면 save()/load() 자리만 Supabase 호출로 바꾸면 된다.
 */
import { useSyncExternalStore } from 'react'
import { seed } from './data/templates'
import type { AppState } from './types'

const KEY = 'todaymargin.v1'

function load(): AppState | null {
  try {
    const s = localStorage.getItem(KEY)
    return s ? (JSON.parse(s) as AppState) : null
  } catch {
    return null
  }
}

function migrate(s: AppState): AppState {
  if (!s.receipts) s.receipts = []
  if (!s.settings.open) s.settings.open = '11:00'
  if (s.settings.ocrApi === undefined) s.settings.ocrApi = ''
  return s
}

let S: AppState = migrate(load() ?? seed('hansik', true))
const listeners = new Set<() => void>()

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(S))
  } catch {
    /* 저장 공간이 없거나 막힌 경우 */
  }
}

export const store = {
  get: () => S,
  /** 복사본을 고쳐서 바꾼다: store.update(s => { s.sample = false }) */
  update(fn: (draft: AppState) => void) {
    const next = structuredClone(S)
    fn(next)
    S = next
    save()
    listeners.forEach((l) => l())
  },
  /** 통째로 바꾸기 (템플릿 불러오기, 탈퇴) */
  replace(next: AppState) {
    S = migrate(next)
    save()
    listeners.forEach((l) => l())
  },
  subscribe(l: () => void) {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}

export const useAppState = () => useSyncExternalStore(store.subscribe, store.get)
