import { describe, it, expect, afterEach } from 'vitest'
import {
  DEFAULT_CFG, createTimeline, setTimeline, getTimeline,
  phaseAt, minuteDone, remainText, targetVolume,
} from '../src/lib/timeline'

// 用例间还原默认配置，保证隔离
afterEach(() => setTimeline(DEFAULT_CFG))

describe('时间轴 · 工厂（默认 5/10/30）', () => {
  const tl = createTimeline()
  it('阶段判定：0-5min 点火，5-15min 滑入，15-45min 心流', () => {
    expect(tl.phaseAt(0).key).toBe('fire')
    expect(tl.phaseAt(4 * 60 + 59).key).toBe('fire')
    expect(tl.phaseAt(5 * 60).key).toBe('glide')
    expect(tl.phaseAt(14 * 60 + 59).key).toBe('glide')
    expect(tl.phaseAt(15 * 60).key).toBe('flow')
    expect(tl.phaseAt(tl.totalSec - 1).key).toBe('flow')
  })
  it('已过完整分钟数（SegmentedBar 点亮格数）', () => {
    expect(tl.minuteDone(0)).toBe(0)
    expect(tl.minuteDone(5 * 60 - 1)).toBe(4)
    expect(tl.minuteDone(16 * 60 + 30)).toBe(16)
    expect(tl.minuteDone(tl.totalSec)).toBe(45)
  })
  it('剩余时间文本 mm:ss', () => {
    expect(tl.remainText(0)).toBe('45:00')
    expect(tl.remainText(16 * 60 + 30)).toBe('28:30')
    expect(tl.remainText(tl.totalSec - 1)).toBe('00:01')
  })
  it('音量曲线：点火1.0，滑入内渐变1.0→0.8，心流0.6稳态', () => {
    expect(tl.targetVolume(0)).toBe(1.0)
    expect(tl.targetVolume(5 * 60)).toBeCloseTo(1.0)
    expect(tl.targetVolume(10 * 60)).toBeCloseTo(0.9)
    expect(tl.targetVolume(15 * 60)).toBeCloseTo(0.8)
    expect(tl.targetVolume(20 * 60)).toBeCloseTo(0.6)
    expect(tl.targetVolume(44 * 60)).toBeCloseTo(0.6)
  })
  it('PHASES 元数据完整（三阶段与曲池分组数）', () => {
    expect(tl.phases.map(p => p.key)).toEqual(['fire', 'glide', 'flow'])
    expect(tl.phases.map(p => p.bars)).toEqual([5, 10, 30])
    expect(tl.phases[0].tempo).toBe('Allegro')
    expect(tl.phases[1].bpm).toBe(96)
    expect(tl.phases[2].endMin).toBe(45)
    expect(tl.totalSec).toBe(45 * 60)
  })
})

describe('时间轴 · 自定义配置（改动 11）', () => {
  it('全心流 0/0/45：全程 flow，总长 45min 不变', () => {
    const tl = createTimeline({ fire: 0, glide: 0, flow: 45 })
    expect(tl.totalSec).toBe(45 * 60)
    expect(tl.phaseAt(0).key).toBe('flow')
    expect(tl.phaseAt(tl.totalSec - 1).key).toBe('flow')
    expect(tl.phases.map(p => p.bars)).toEqual([0, 0, 45])
  })
  it('延长配置 10/15/25：阶段边界随配置平移', () => {
    const tl = createTimeline({ fire: 10, glide: 15, flow: 25 })
    expect(tl.totalMin).toBe(50)
    expect(tl.phaseAt(0).key).toBe('fire')
    expect(tl.phaseAt(9 * 60 + 59).key).toBe('fire')
    expect(tl.phaseAt(10 * 60).key).toBe('glide')
    expect(tl.phaseAt(25 * 60).key).toBe('flow')
    expect(tl.remainText(0)).toBe('50:00')
  })
  it('音量曲线随配置缩放（滑入 15min 内完成 1.0→0.8）', () => {
    const tl = createTimeline({ fire: 10, glide: 15, flow: 25 })
    expect(tl.targetVolume(10 * 60)).toBeCloseTo(1.0)
    expect(tl.targetVolume(17 * 60 + 30)).toBeCloseTo(0.9)
    expect(tl.targetVolume(25 * 60)).toBeCloseTo(0.8)
    expect(tl.targetVolume(30 * 60)).toBeCloseTo(0.6)
  })
  it('setTimeline 切换当前实例，兼容转发函数跟随', () => {
    setTimeline({ fire: 0, glide: 0, flow: 45 })
    expect(getTimeline().totalSec).toBe(45 * 60)
    expect(phaseAt(0).key).toBe('flow')
    expect(remainText(0)).toBe('45:00')
    setTimeline(DEFAULT_CFG)
    expect(phaseAt(0).key).toBe('fire')
    expect(minuteDone(16 * 60 + 30)).toBe(16)
    expect(targetVolume(10 * 60)).toBeCloseTo(0.9)
  })
})
