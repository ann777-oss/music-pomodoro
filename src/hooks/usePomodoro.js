// usePomodoro：状态机 × 音频引擎 × 中断监听 的 React 接线（唯一时钟源）
// Task 5.4 持久化：当日两首歌恢复 / 跨日重选 / streak 连续天数
import { useEffect, useReducer, useRef, useState } from 'react'
import { initialState, reducer } from '../lib/session'
import { AudioEngine } from '../lib/audioEngine'
import { POOLS } from '../data/pools'
import { TOTAL_SEC, REST_SEC, CHOOSE_SEC } from '../lib/timeline'

const todayStr = () => new Date().toISOString().slice(0, 10)
const yesterdayStr = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10)

// —— localStorage 持久化 ——
const LS_SONGS = 'mp-songs'
const LS_DAY = 'mp-last-choose-day'
const LS_STREAK = 'mp-streak'
const LS_ONBOARD = 'mp-onboarded'

function readStreak() {
  try { return JSON.parse(localStorage.getItem(LS_STREAK)) || { days: 0, last: '' } }
  catch { return { days: 0, last: '' } }
}

// 当天已选过歌：恢复两首歌（重开应用不重选）；否则全新初始态
function initFromStorage() {
  const base = initialState()
  try {
    const day = localStorage.getItem(LS_DAY)
    const songs = JSON.parse(localStorage.getItem(LS_SONGS) || 'null')
    if (day === todayStr() && songs) return { ...base, lastChooseDay: day, songs }
  } catch { /* 忽略损坏数据 */ }
  return base
}

export function usePomodoro() {
  const [session, dispatch] = useReducer(reducer, initFromStorage())
  const engineRef = useRef(null)
  const secRef = useRef(0)
  const speedRef = useRef(1)
  const [speed, setSpeed] = useState(1)
  const [track, setTrack] = useState({ pool: '—', file: '' })
  const [restLeft, setRestLeft] = useState(REST_SEC)
  const [chooseLeft, setChooseLeft] = useState(CHOOSE_SEC)
  const [streak, setStreak] = useState(() => readStreak().days)

  // 最新状态镜像（事件监听器读取，避免闭包过期）
  const sessionRef = useRef(session)
  useEffect(() => { sessionRef.current = session }, [session])

  // —— 主时钟：running 期每虚拟秒 TICK + 引擎 tick ——
  useEffect(() => {
    if (session.state !== 'running') return
    const timer = setInterval(() => {
      secRef.current = secRef.current + 1
      dispatch({ type: 'TICK', sec: secRef.current })
      engineRef.current?.tick(Math.min(secRef.current, TOTAL_SEC - 1))
    }, 1000 / speedRef.current)
    return () => clearInterval(timer)
  }, [session.state, speed])

  // —— 番茄结束（进入 resting）：人间池 ——
  useEffect(() => {
    if (session.state === 'resting' && engineRef.current) {
      engineRef.current.startRest()
      setRestLeft(REST_SEC)
    }
  }, [session.state])

  // —— 休息倒计时 ——
  useEffect(() => {
    if (session.state !== 'resting') return
    const t = setInterval(() => setRestLeft(s => Math.max(0, s - 1)), 1000 / speedRef.current)
    return () => clearInterval(t)
  }, [session.state, speed])

  // —— 选歌倒计时 ——
  useEffect(() => {
    if (session.state !== 'choosing') return
    setChooseLeft(CHOOSE_SEC)
    const t = setInterval(() => setChooseLeft(s => s - 1), 1000 / speedRef.current)
    return () => clearInterval(t)
  }, [session.state, speed])

  // —— 中断监听：切走标签页 = 分心信号（只记录，不打扰）——
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'hidden' && sessionRef.current.state === 'running') {
        dispatch({ type: 'INTERRUPT', kind: 'visibility', at: secRef.current, dur: 0 })
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // —— 对外动作 ——
  const ensureEngine = () => {
    if (!engineRef.current) {
      engineRef.current = new AudioEngine(POOLS)
      engineRef.current.onTrackChange((pool, file) =>
        setTrack({ pool, file: file.split('/').pop() }))
    }
    return engineRef.current
  }

  const persistSongs = (songs) => {
    try {
      localStorage.setItem(LS_SONGS, JSON.stringify(songs))
      localStorage.setItem(LS_DAY, todayStr())
    } catch { /* 存储不可用时静默降级 */ }
  }

  const confirmSongs = async (songs) => {
    ensureEngine()
    secRef.current = 0
    persistSongs(songs)
    dispatch({ type: 'CONFIRM_SONGS', songs, today: todayStr() })
    await engineRef.current.startPomodoro(songs)
  }

  return {
    session, track, restLeft, chooseLeft, speed, streak,

    start: () => dispatch({ type: 'START_CHOOSE' }),

    confirmSongs,

    // "继承上次配置"：读持久化的两首歌直接开跑
    inheritSongs: async () => {
      try {
        const songs = JSON.parse(localStorage.getItem(LS_SONGS) || 'null')
        if (songs) await confirmSongs(songs)
      } catch { /* 存储不可用则忽略 */ }
    },

    abandon: () => {
      dispatch({ type: 'ABANDON', at: secRef.current })
      engineRef.current?.startRest()
      setRestLeft(REST_SEC)
    },

    nextPomodoro: async () => {
      const sameDay = sessionRef.current.lastChooseDay === todayStr()
      if (!sameDay) {                       // 跨日：回限时选歌
        dispatch({ type: 'START_POMODORO', today: todayStr() })
        return
      }
      secRef.current = 0
      dispatch({ type: 'START_POMODORO', today: todayStr() })
      await ensureEngine().startPomodoro(sessionRef.current.songs)
    },

    rechoose: () => dispatch({ type: 'START_CHOOSE' }),   // 休息期修改两首歌

    finishDay: () => {
      // 当天有完成番茄 → 计入 streak（连续天）
      if (sessionRef.current.history.some(h => h.result === 'done')) {
        const s = readStreak()
        if (s.last !== todayStr()) {
          const days = s.last === yesterdayStr() ? s.days + 1 : 1
          const next = { days, last: todayStr() }
          try { localStorage.setItem(LS_STREAK, JSON.stringify(next)) } catch {}
          setStreak(days)
        }
      }
      dispatch({ type: 'FINISH_DAY' })
    },

    resetDay: () => {
      engineRef.current?.destroy()
      engineRef.current = null
      dispatch({ type: 'RESET' })
    },

    setSpeed: (s) => { speedRef.current = s; setSpeed(s) },
  }
}

// 新手引导标记（Onboarding 消费）
export const onboarded = () => localStorage.getItem(LS_ONBOARD) === '1'
export const markOnboarded = () => localStorage.setItem(LS_ONBOARD, '1')
