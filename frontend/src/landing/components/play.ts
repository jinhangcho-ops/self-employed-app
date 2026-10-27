import { createContext, useContext } from 'react'

/** 장면이 화면에 보여서 모션이 재생 중인지 */
export const PlayCtx = createContext(false)
export const usePlaying = () => useContext(PlayCtx)

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
export const motionPaused = () => document.documentElement.classList.contains('paused')
