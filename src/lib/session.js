// 番茄会话状态机（纯逻辑，无 UI/音频依赖）。
// 状态：idle → choosing → running ⇄ (中断仅记录) → resting → running/choosing → report
import { PHASES, TOTAL_SEC, phaseAt, minuteDone } from './timeline'

export function initialState() {
  return {
    state: 'idle',            // idle | choosing | running | resting | report
    songs: null,              // { fire, glideStart } 每日两首歌
    pomodoroIndex: 0,         // 今天第几颗（0 基）
    secElapsed: 0,            // 当前番茄已过秒数
    phase: PHASES[0],
    minuteDone: 0,            // SegmentedBar 已点亮格数
    interrupts: [],           // [{ kind, at, dur }] 只记录，不干扰
    history: [],              // 已完成/作废番茄：{ result, index, duration, interrupts }
    abandoned: false,         // 当前颗是否已作废
    lastChooseDay: null,      // 最后一次选歌日期（YYYY-MM-DD），用于每日首次判定
  }
}

export function reducer(s, a) {
  switch (a.type) {
    case 'START_CHOOSE':
      return { ...s, state: 'choosing' }

    case 'CONFIRM_SONGS':
      return { ...s, songs: a.songs, state: 'running', secElapsed: 0,
               phase: PHASES[0], minuteDone: 0, interrupts: [], abandoned: false,
               lastChooseDay: a.today ?? s.lastChooseDay }

    case 'START_POMODORO':    // 休息结束后：同日继承选歌直接开跑；跨日回选歌
      const knownDay = a.lastChooseDay !== undefined ? a.lastChooseDay : s.lastChooseDay
      if (a.today !== knownDay) {
        return { ...s, state: 'choosing' }
      }
      return { ...s, state: 'running', secElapsed: 0, phase: PHASES[0],
               minuteDone: 0, interrupts: [], abandoned: false }

    case 'TICK':
      if (s.state !== 'running') return s
      if (a.sec >= TOTAL_SEC) {
        return { ...s, state: 'resting', secElapsed: TOTAL_SEC, minuteDone: 45,
                 history: [...s.history, { result: 'done', index: s.pomodoroIndex,
                   duration: TOTAL_SEC, interrupts: s.interrupts }] }
      }
      return { ...s, secElapsed: a.sec, phase: phaseAt(a.sec), minuteDone: minuteDone(a.sec) }

    case 'INTERRUPT':        // 纯记录：不提醒、不弹窗、不惩罚
      return { ...s, interrupts: [...s.interrupts, { kind: a.kind, at: a.at, dur: a.dur }] }

    case 'ABANDON':           // 应急入口放弃：番茄作废
      return { ...s, state: 'resting', abandoned: true,
               history: [...s.history, { result: 'abandoned', index: s.pomodoroIndex,
                 duration: a.at, interrupts: s.interrupts }] }

    case 'REST_END':
      return { ...s, state: 'running', pomodoroIndex: s.pomodoroIndex + 1,
               secElapsed: 0, phase: PHASES[0], minuteDone: 0, interrupts: [], abandoned: false }

    case 'FINISH_DAY':
      return { ...s, state: 'report' }

    case 'RESET':              // 报告页"开始新的一天"：回初始
      return initialState()

    default:
      return s
  }
}
