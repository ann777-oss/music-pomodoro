import { describe, it, expect } from 'vitest'
import { PHASES, TOTAL_SEC, phaseAt, minuteDone, remainText, targetVolume } from '../src/lib/timeline'

describe('时间轴', () => {
  it('阶段判定：0-5min 点火，5-15min 滑入，15-45min 心流', () => {
    expect(phaseAt(0).key).toBe('fire')
    expect(phaseAt(4 * 60 + 59).key).toBe('fire')
    expect(phaseAt(5 * 60).key).toBe('glide')
    expect(phaseAt(14 * 60 + 59).key).toBe('glide')
    expect(phaseAt(15 * 60).key).toBe('flow')
    expect(phaseAt(TOTAL_SEC - 1).key).toBe('flow')
  })
  it('已过完整分钟数（SegmentedBar 点亮格数）', () => {
    expect(minuteDone(0)).toBe(0)
    expect(minuteDone(5 * 60 - 1)).toBe(4)
    expect(minuteDone(16 * 60 + 30)).toBe(16)
    expect(minuteDone(TOTAL_SEC)).toBe(45)
  })
  it('剩余时间文本 mm:ss', () => {
    expect(remainText(0)).toBe('45:00')
    expect(remainText(16 * 60 + 30)).toBe('28:30')
    expect(remainText(TOTAL_SEC - 1)).toBe('00:01')
  })
  it('音量曲线：点火1.0，滑入内渐变1.0→0.8，心流0.6稳态', () => {
    expect(targetVolume(0)).toBe(1.0)
    expect(targetVolume(5 * 60)).toBeCloseTo(1.0)
    expect(targetVolume(10 * 60)).toBeCloseTo(0.9)
    expect(targetVolume(15 * 60)).toBeCloseTo(0.8)
    expect(targetVolume(20 * 60)).toBeCloseTo(0.6)
    expect(targetVolume(44 * 60)).toBeCloseTo(0.6)
  })
  it('PHASES 元数据完整（三阶段与曲池分组数）', () => {
    expect(PHASES.map(p => p.key)).toEqual(['fire', 'glide', 'flow'])
    expect(PHASES.map(p => p.bars)).toEqual([5, 10, 30])
    expect(PHASES[0].tempo).toBe('Allegro')
    expect(PHASES[1].bpm).toBe(96)
    expect(PHASES[2].endMin).toBe(45)
  })
})
