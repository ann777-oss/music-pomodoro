// usePomodoro：状态机 × 音频引擎 × 中断监听 的 React 接线（唯一时钟源）
// Task 5.4 持久化：当日两首歌恢复 / 跨日重选 / streak 连续天数
import { useEffect, useReducer, useRef, useState } from 'react'
import { initialState, reducer } from '../lib/session'
import { AudioEngine } from '../lib/audioEngine'
import { POOLS, FLOW_TYPES } from '../data/pools'
import { getTimeline, setTimeline, readTimelineCfg, persistTimelineCfg, REST_SEC, CHOOSE_SEC } from '../lib/timeline'

const todayStr = () => new Date().toISOString().slice(0, 10)
const yesterdayStr = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10)

// —— localStorage 持久化 ——
const LS_SONGS = 'mp-songs'
const LS_DAY = 'mp-last-choose-day'
const LS_STREAK = 'mp-streak'
const LS_ONBOARD = 'mp-onboarded'
const LS_LIFETIME = 'mp-lifetime'   // 跨天累计：{ min, tracks }
const LS_YESTERDAY = 'mp-yesterday' // 昨日成就：{ date: 'YYYY-MM-DD', count: N }

function readStreak() {
  try { return JSON.parse(localStorage.getItem(LS_STREAK)) || { days: 0, last: '' } }
  catch { return { days: 0, last: '' } }
}

function readLifetime() {
  try { return JSON.parse(localStorage.getItem(LS_LIFETIME)) || { min: 0, tracks: 0 } }
  catch { return { min: 0, tracks: 0 } }
}

function readYesterday() {
  try { return JSON.parse(localStorage.getItem(LS_YESTERDAY)) || null }
  catch { return null }
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
  const [lifetime, setLifetime] = useState(() => readLifetime())
  const [yesterday, setYesterday] = useState(() => readYesterday())   // 昨日成就（首页 footnote）
  const [tlVersion, setTlVersion] = useState(0)   // 时间轴配置版本（改动 11：保存后触发重渲染）
  const trackSetRef = useRef(new Set())   // 当日 unique 曲目

  // 启动：恢复自定义时间轴（mp-timeline；CONFIRM_SONGS 前生效即可）
  useEffect(() => { setTimeline(readTimelineCfg()) }, [])

  // 最新状态镜像（事件监听器读取，避免闭包过期）
  const sessionRef = useRef(session)
  useEffect(() => { sessionRef.current = session }, [session])

  // —— 主时钟：running 期每虚拟秒 TICK + 引擎 tick（暂停时停走，改动 8）——
  useEffect(() => {
    if (session.state !== 'running' || session.paused) return
    const timer = setInterval(() => {
      secRef.current = secRef.current + 1
      dispatch({ type: 'TICK', sec: secRef.current })
      engineRef.current?.tick(Math.min(secRef.current, getTimeline().totalSec - 1))
    }, 1000 / speedRef.current)
    return () => clearInterval(timer)
  }, [session.state, session.paused, speed])

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
    const t = setInterval(() => setChooseLeft(s => Math.max(0, s - 1)), 1000 / speedRef.current)
    return () => clearInterval(t)
  }, [session.state, speed])

  // —— 中断监听：切走标签页 = 分心信号（只记录，不打扰；暂停中不算分心，改动 8）——
  useEffect(() => {
    const onVis = () => {
      const s = sessionRef.current
      if (document.visibilityState === 'hidden' && s.state === 'running' && !s.paused) {
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
      engineRef.current.onTrackChange((pool, file) => {
        trackSetRef.current.add(file)                 // 当日听歌数（unique）
        setTrack({ pool, file: file.split('/').pop() })
      })
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
    // flowType（声场类型 key）→ engine 用的 flowFile；session.songs 保留 flowType（展示）
    const { flowType, ...rest } = songs
    const payload = { ...rest, flowFile: flowType ? FLOW_TYPES[flowType]?.file : null }
    dispatch({ type: 'CONFIRM_SONGS', songs, today: todayStr() })
    await engineRef.current.startPomodoro(payload)
  }

  return {
    session, track, restLeft, chooseLeft, speed, streak, lifetime, yesterday,
    todayTracks: trackSetRef.current.size,

    start: () => dispatch({ type: 'START_CHOOSE' }),

    // 暂停/继续（改动 8）：时钟停走由 reducer/TICK 兜底，音频由引擎淡出淡入
    pause: () => {
      dispatch({ type: 'PAUSE' })
      engineRef.current?.pause()
    },
    resume: () => {
      dispatch({ type: 'RESUME' })
      engineRef.current?.resume()
    },

    // 阶段时长设置（改动 11）：仅 idle 期可改；保存 = 生效 + 持久化
    timeline: { cfg: getTimeline().cfg, version: tlVersion },
    saveTimeline: (cfg) => {
      setTimeline(cfg)
      persistTimelineCfg(cfg)
      setTlVersion(v => v + 1)
    },

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
      // 跨天累计：专注分钟 + 听歌数（含今日）
      const todayMin = Math.floor(
        sessionRef.current.history.reduce((a, h) => a + h.duration, 0) / 60)
      const nextLife = {
        min: readLifetime().min + todayMin,
        tracks: readLifetime().tracks + trackSetRef.current.size,
      }
      try { localStorage.setItem(LS_LIFETIME, JSON.stringify(nextLife)) } catch {}
      setLifetime(nextLife)
      // 昨日成就记录（首页 footnote 显示；隔天打开仍有效）
      const rec = { date: todayStr(), count: sessionRef.current.history.filter(h => h.result === 'done').length }
      try { localStorage.setItem(LS_YESTERDAY, JSON.stringify(rec)) } catch {}
      setYesterday(rec)
      trackSetRef.current = new Set()               // 新的一天重新计数
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
