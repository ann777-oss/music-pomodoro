import { describe, it, expect } from 'vitest'
import { initialState, reducer } from '../src/lib/session'

const go = (actions) => actions.reduce(reducer, initialState())

describe('番茄会话状态机', () => {
  it('主流程：选歌→番茄→休息→下一颗（选歌继承）', () => {
    const s = go([
      { type: 'START_CHOOSE' },
      { type: 'CONFIRM_SONGS', songs: { fire: 'a.mp3', glideStart: 'b.mp3' } },
      { type: 'TICK', sec: 0 },
      { type: 'TICK', sec: 45 * 60 },                       // 番茄结束
      { type: 'REST_END' },
    ])
    expect(s.state).toBe('running')
    expect(s.pomodoroIndex).toBe(1)
    expect(s.songs).toEqual({ fire: 'a.mp3', glideStart: 'b.mp3' }) // 当日继承
  })
  it('TICK 更新阶段与已过分钟', () => {
    const s = go([
      { type: 'START_CHOOSE' },
      { type: 'CONFIRM_SONGS', songs: {} },
      { type: 'TICK', sec: 16 * 60 + 30 },
    ])
    expect(s.phase.key).toBe('flow')
    expect(s.minuteDone).toBe(16)
  })
  it('中断：只记录，不改变状态', () => {
    const s = go([
      { type: 'START_CHOOSE' },
      { type: 'CONFIRM_SONGS', songs: {} },
      { type: 'TICK', sec: 100 },
      { type: 'INTERRUPT', kind: 'blur', at: 100, dur: 4 },
    ])
    expect(s.state).toBe('running')
    expect(s.interrupts).toEqual([{ kind: 'blur', at: 100, dur: 4 }])
  })
  it('放弃：番茄作废，进入休息，history 记录 abandoned', () => {
    const s = go([
      { type: 'START_CHOOSE' },
      { type: 'CONFIRM_SONGS', songs: {} },
      { type: 'ABANDON', at: 200 },
    ])
    expect(s.state).toBe('resting')
    expect(s.abandoned).toBe(true)
    expect(s.history[0].result).toBe('abandoned')
  })
  it('结束今天：出报告，history 完整', () => {
    const s = go([
      { type: 'START_CHOOSE' },
      { type: 'CONFIRM_SONGS', songs: {} },
      { type: 'TICK', sec: 45 * 60 }, { type: 'REST_END' },
      { type: 'TICK', sec: 45 * 60 }, { type: 'REST_END' },
      { type: 'FINISH_DAY' },
    ])
    expect(s.state).toBe('report')
    expect(s.history.length).toBe(2)
    expect(s.history.every(h => h.result === 'done')).toBe(true)
  })
  it('每日首次判定：日期变化后重置选歌', () => {
    let s = go([
      { type: 'START_CHOOSE' },
      { type: 'CONFIRM_SONGS', songs: {} },
      { type: 'TICK', sec: 45 * 60 }, { type: 'REST_END' },
    ])
    // 同日再来一颗：直接 running（继承选歌）
    s = reducer(s, { type: 'START_POMODORO', today: '2026-09-27', lastChooseDay: '2026-09-27' })
    expect(s.state).toBe('running')
    // 跨日再来：回到 choosing 重新限时选歌
    s = reducer(s, { type: 'START_POMODORO', today: '2026-09-28', lastChooseDay: '2026-09-27' })
    expect(s.state).toBe('choosing')
  })
  it('未知 action 与非法状态下 TICK 不改变状态', () => {
    const s0 = initialState()
    expect(reducer(s0, { type: 'TICK', sec: 10 })).toBe(s0)
    expect(reducer(s0, { type: 'WHATEVER' })).toBe(s0)
  })
})
