// 45 分钟三阶段时间轴。所有 UI 与音频调度共用本模块，禁止他处重复实现。
export const PHASES = [
  { key: 'fire',  label: '点火', tempo: 'Allegro', bpm: 128, endMin: 5,  bars: 5,  vol: 1.0 },
  { key: 'glide', label: '滑入', tempo: 'Andante', bpm: 96,  endMin: 15, bars: 10, vol: 0.8 },
  { key: 'flow',  label: '心流', tempo: 'Adagio',  bpm: 72,  endMin: 45, bars: 30, vol: 0.6 },
]
export const TOTAL_SEC = 45 * 60
export const REST_SEC = 10 * 60
export const CHOOSE_SEC = 90

// 当前所处阶段（secElapsed = 番茄开始以来已过秒数）
export function phaseAt(secElapsed) {
  const min = secElapsed / 60
  return PHASES.find(p => min < p.endMin) || PHASES[PHASES.length - 1]
}

// 已过完整分钟数 = SegmentedBar 应点亮的格数（0-45）
export function minuteDone(secElapsed) {
  return Math.min(45, Math.floor(secElapsed / 60))
}

// 剩余时间文本 mm:ss
export function remainText(secElapsed) {
  const remain = Math.max(0, TOTAL_SEC - secElapsed)
  const mm = String(Math.floor(remain / 60)).padStart(2, '0')
  const ss = String(Math.floor(remain % 60)).padStart(2, '0')
  return `${mm}:${ss}`
}

// 音量曲线：0-5min=1.0；5-15min 线性 1.0→0.8；15-20min 线性 0.8→0.6；之后 0.6 稳态
export function targetVolume(secElapsed) {
  const t = secElapsed
  if (t <= 5 * 60) return 1.0
  if (t <= 15 * 60) return 1.0 - 0.2 * (t - 5 * 60) / (10 * 60)
  if (t <= 20 * 60) return 0.8 - 0.2 * (t - 15 * 60) / (5 * 60)
  return 0.6
}
