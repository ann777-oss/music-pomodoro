import { describe, it, expect, afterEach } from 'vitest'
import { initialState, reducer } from '../src/lib/session'
import { setTimeline, DEFAULT_CFG } from '../src/lib/timeline'

const go = (actions) => actions.reduce(reducer, initialState())
afterEach(() => setTimeline(DEFAULT_CFG))   // 自定义时间轴用例后还原默认

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
  it('RESET：报告页开始新的一天，回初始态', () => {
    const s = go([
      { type: 'START_CHOOSE' }, { type: 'CONFIRM_SONGS', songs: {} },
      { type: 'TICK', sec: 45 * 60 }, { type: 'REST_END' },
      { type: 'FINISH_DAY' },
    ])
    const r = reducer(s, { type: 'RESET' })
    expect(r.state).toBe('idle')
    expect(r.history.length).toBe(0)
    expect(r.pomodoroIndex).toBe(0)
  })
  it('自定义时间轴（改动 11）：0/0/45 全心流——起始即 flow，45min 完成', () => {
    setTimeline({ fire: 0, glide: 0, flow: 45 })
    let s = go([
      { type: 'START_CHOOSE' },
      { type: 'CONFIRM_SONGS', songs: {} },
      { type: 'TICK', sec: 0 },
    ])
    expect(s.phase.key).toBe('flow')          // 无点火/滑入，直接心流
    s = reducer(s, { type: 'TICK', sec: 45 * 60 })
    expect(s.state).toBe('resting')
    expect(s.history[0].result).toBe('done')
    expect(s.history[0].duration).toBe(45 * 60)
  })
  it('自定义时间轴：延长 10/15/25——50min 完成，边界平移', () => {
    setTimeline({ fire: 10, glide: 15, flow: 25 })
    const s = go([
      { type: 'START_CHOOSE' },
      { type: 'CONFIRM_SONGS', songs: {} },
      { type: 'TICK', sec: 12 * 60 },
    ])
    expect(s.phase.key).toBe('glide')
    expect(s.minuteDone).toBe(12)
    const done = reducer(s, { type: 'TICK', sec: 50 * 60 })
    expect(done.state).toBe('resting')
  })
})
