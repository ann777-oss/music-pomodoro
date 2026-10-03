// 三阶段时间轴（v2.3 参数化，改动 11）：时长可由设置面板调整（默认 5/10/30）。
// 所有 UI 与音频调度共用本模块，禁止他处重复实现。
// 用法：启动时读 mp-timeline 调 setTimeline(cfg)；运行期所有函数走"当前实例"。
export const DEFAULT_CFG = { fire: 5, glide: 10, flow: 30 }
export const REST_SEC = 10 * 60
export const CHOOSE_SEC = 90

// —— 工厂：按配置构建完整时间轴（纯函数，可测）——
export function createTimeline(cfg = DEFAULT_CFG) {
  const { fire, glide, flow } = cfg
  const fireEnd = fire                     // 点火结束（min）
  const glideEnd = fire + glide            // 滑入结束（min）
  const totalMin = fire + glide + flow     // 番茄总长（min）
  const flowRamp = Math.min(5, Math.max(1, Math.round(flow / 6)))  // 心流入场渐降时长（默认 30→5min，与原曲线一致）

  const phases = [
    { key: 'fire',  label: '点火', tempo: 'Allegro', bpm: 128, endMin: fireEnd,  bars: fire,  vol: 1.0 },
    { key: 'glide', label: '滑入', tempo: 'Andante', bpm: 96,  endMin: glideEnd, bars: glide, vol: 0.8 },
    { key: 'flow',  label: '心流', tempo: 'Adagio',  bpm: 72,  endMin: totalMin, bars: flow,  vol: 0.6 },
  ]
  const totalSec = totalMin * 60

  // 当前所处阶段（secElapsed = 番茄开始以来已过秒数）
  const phaseAt = secElapsed => {
    const min = secElapsed / 60
    return phases.find(p => min < p.endMin) || phases[phases.length - 1]
  }

  // 已过完整分钟数 = SegmentedBar 应点亮的格数（0-totalMin）
  const minuteDone = secElapsed => Math.min(totalMin, Math.floor(secElapsed / 60))

  // 剩余时间文本 mm:ss
  const remainText = secElapsed => {
    const remain = Math.max(0, totalSec - secElapsed)
    const mm = String(Math.floor(remain / 60)).padStart(2, '0')
    const ss = String(Math.floor(remain % 60)).padStart(2, '0')
    return `${mm}:${ss}`
  }

  // 音量曲线：点火段 1.0；滑入段线性 1.0→0.8；心流入场前 flowRamp 分钟线性 0.8→0.6；之后 0.6 稳态
  const targetVolume = sec => {
    const t = sec
    if (t <= fireEnd * 60) return 1.0
    if (t <= glideEnd * 60) return 1.0 - 0.2 * (t - fireEnd * 60) / Math.max(1, glide * 60)
    const rampEnd = (glideEnd + flowRamp) * 60
    if (t <= rampEnd) return 0.8 - 0.2 * (t - glideEnd * 60) / (flowRamp * 60)
    return 0.6
  }

  return { cfg, phases, totalMin, totalSec, phaseAt, minuteDone, remainText, targetVolume }
}

// —— 当前时间轴实例（App 启动时按 mp-timeline 设置一次；番茄运行中不可变）——
let current = createTimeline(DEFAULT_CFG)
export function setTimeline(cfg) { current = createTimeline(cfg) }
export function getTimeline() { return current }

// —— 存量函数签名兼容转发（audioTest 等直接调用处零改动）——
export const phaseAt = sec => current.phaseAt(sec)
export const minuteDone = sec => current.minuteDone(sec)
export const remainText = sec => current.remainText(sec)
export const targetVolume = sec => current.targetVolume(sec)

// —— 配置持久化（mp-timeline）——
export const LS_TIMELINE = 'mp-timeline'
export function readTimelineCfg() {
  try {
    const c = JSON.parse(localStorage.getItem(LS_TIMELINE))
    if (c && Number.isFinite(c.fire) && Number.isFinite(c.glide) && Number.isFinite(c.flow)) return c
  } catch { /* 静默降级为默认 */ }
  return { ...DEFAULT_CFG }
}
export function persistTimelineCfg(cfg) {
  try { localStorage.setItem(LS_TIMELINE, JSON.stringify(cfg)) } catch { /* 静默降级 */ }
}
