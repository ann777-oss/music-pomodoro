// 音频引擎：三阶段曲池调度 + 双轨 crossfade + 音量曲线 + 灵活边界。
// 引擎以外部喂入的 secElapsed（虚拟番茄时间）为准——音频自然播放，
// 阶段切换在时间轴上发生，但尊重歌曲完整性（±15s 容差，PRD 4.2 灵活边界原则）。
import { getTimeline, phaseAt, targetVolume } from './timeline'

const FADE_SEC = 10          // crossfade 时长
const TOLERANCE_SEC = 15     // 灵活边界容差
const BASE_VOL = 0.7         // 总基准音量（乘以阶段曲线）

export class AudioEngine {
  constructor(pools) {
    this.pools = pools
    this.ctx = null
    this.slots = null
    this.active = 0
    this.phasePlaying = null   // 正在播放的池 key
    this.pendingPool = null    // 歌播完后要切去的池
    this.fireTrack = null      // 用户选的点火主歌（单曲循环）
    this.lastSec = 0
    this.idx = {}              // 各池队列指针
    this.trackListeners = []
    this.endedHandler = null
  }

  // 需在用户手势后调用（AudioContext 自动播放策略）
  async ensureCtx() {
    if (this.ctx) return
    this.ctx = new (window.AudioContext || window.webkitAudioContext)()
    this.slots = [0, 1].map(() => {
      const el = new Audio()
      el.preload = 'auto'
      const src = this.ctx.createMediaElementSource(el)
      const gain = this.ctx.createGain()
      gain.gain.value = 0.0001
      src.connect(gain).connect(this.ctx.destination)
      return { el, gain }
    })
    // 歌曲自然播完：pending 切池 / 提前切 / 同池下一首 / fire 重播
    this.endedHandler = () => this._onEnded()
    this.slots.forEach(s => s.el.addEventListener('ended', this.endedHandler))
  }

  _currentVol() {
    return Math.max(0.0001, targetVolume(this.lastSec) * BASE_VOL)
  }

  // 指定池的下一首：fire 单曲循环；glide 先消耗队列（glideStart 优先）再按池循环
  _nextFile(poolKey) {
    if (poolKey === 'fire') return this.fireTrack
    if (poolKey === 'glide' && this.glideQueue?.length) {
      return this.glideQueue.shift()
    }
    const list = this.pools[poolKey].tracks
    this.idx[poolKey] = ((this.idx[poolKey] ?? -1) + 1) % list.length
    return list[this.idx[poolKey]]
  }

  // 切歌：双轨 crossfade（新歌 fade-in，旧歌 fade-out）
  async _play(poolKey, { fadeIn = FADE_SEC } = {}) {
    const file = this._nextFile(poolKey)
    const cur = this.slots[this.active]
    const next = this.slots[1 - this.active]
    this.phasePlaying = poolKey
    next.el.src = file
    next.el.currentTime = 0
    try { await next.el.play() } catch { return }
    const t = this.ctx.currentTime
    const v = this._currentVol()
    next.gain.gain.cancelScheduledValues(t)
    next.gain.gain.setValueAtTime(0.0001, t)
    next.gain.gain.exponentialRampToValueAtTime(v, t + fadeIn)
    cur.gain.gain.cancelScheduledValues(t)
    cur.gain.gain.setValueAtTime(cur.gain.gain.value, t)
    cur.gain.gain.exponentialRampToValueAtTime(0.0001, t + fadeIn)
    this.active = 1 - this.active
    // fade 完成后释放旧轨
    setTimeout(() => { if (cur !== this.slots[this.active]) { cur.el.pause(); cur.el.src = '' } },
      fadeIn * 1000 + 200)
    this.trackListeners.forEach(cb => cb(poolKey, file))
  }

  // 开始一颗番茄：songs = { fire, glideStart }
  async startPomodoro(songs) {
    await this.ensureCtx()
    if (this.ctx.state === 'suspended') await this.ctx.resume()
    this.fireTrack = songs.fire
    this.idx = {}
    // 滑入队列：用户选的启动歌排最前，之后按池子顺序
    this.glideQueue = [songs.glideStart, ...this.pools.glide.tracks]
    // 心流声场（改动 7）：用户选的类型 → flow 池切换（默认 flow-01 预置）
    if (songs.flowFile) this.pools.flow.tracks = [songs.flowFile]
    this.lastSec = 0
    this.phasePlaying = null
    this.pendingPool = null
    await this._play('fire', { fadeIn: 1 })
  }

  // 每秒（虚拟时间）由外部调用：驱动音量曲线与阶段切换
  async tick(sec) {
    if (!this.ctx) return
    this.lastSec = sec
    // 音量跟随（每秒向目标平滑推进）
    const t = this.ctx.currentTime
    const g = this.slots[this.active].gain.gain
    g.cancelScheduledValues(t)
    g.setValueAtTime(g.value, t)
    g.linearRampToValueAtTime(this._currentVol(), t + 1)

    // 阶段切换（时间轴判定 + 灵活边界）
    const desired = phaseAt(sec).key
    if (desired !== this.phasePlaying && !this.pendingPool) {
      const el = this.slots[this.active].el
      const remaining = el.duration ? el.duration - el.currentTime : Infinity
      if (remaining <= TOLERANCE_SEC) {
        this.pendingPool = desired        // 歌即将播完：等自然结束（延后切）
      } else {
        await this._play(desired)         // 歌还长：边界处截断（时间轴优先）
      }
    }
  }

  // 歌曲自然播完的三种去向
  async _onEnded() {
    const sec = this.lastSec
    const cur = phaseAt(sec).key
    // ① pending：阶段已到界但等歌播完 → 现在切
    if (this.pendingPool) {
      const pool = this.pendingPool
      this.pendingPool = null
      await this._play(pool)
      return
    }
    // ② 提前切：距下一阶段边界 ≤15s → 歌播完直接进下池
    const phases = getTimeline().phases
    const i = phases.findIndex(p => p.key === cur)
    const nextPhase = phases[i + 1]
    if (nextPhase && nextPhase.endMin * 60 - sec <= TOLERANCE_SEC) {
      await this._play(nextPhase.key)
      return
    }
    // ③ 同池推进：fire 重播（单曲循环），glide/flow 下一首
    await this._play(cur)
  }

  // 休息期：人间池随机 + 末 30 秒预埋下段点火前奏（简化：随机入池）
  async startRest() {
    await this.ensureCtx()
    if (this.ctx.state === 'suspended') await this.ctx.resume()
    const list = this.pools.human.tracks
    const file = list[Math.floor(Math.random() * list.length)]
    this.idx.human = list.indexOf(file)
    this.phasePlaying = 'human'
    this.pendingPool = null
    await this._play('human')
  }

  // 中断联动：静音保持（模拟锁屏/切走音频暂停），恢复续播
  pause() {
    if (!this.ctx) return
    const t = this.ctx.currentTime
    const g = this.slots[this.active].gain.gain
    g.cancelScheduledValues(t)
    g.setValueAtTime(g.value, t)
    g.linearRampToValueAtTime(0.0001, t + 0.3)
    setTimeout(() => this.slots[this.active].el.pause(), 350)
  }
  resume() {
    if (!this.ctx) return
    this.slots[this.active].el.play().catch(() => {})
    const t = this.ctx.currentTime
    const g = this.slots[this.active].gain.gain
    g.cancelScheduledValues(t)
    g.setValueAtTime(g.value, t)
    g.linearRampToValueAtTime(this._currentVol(), t + 0.5)
  }

  onTrackChange(cb) { this.trackListeners.push(cb) }

  destroy() {
    if (!this.slots) return
    this.slots.forEach(s => {
      s.el.removeEventListener('ended', this.endedHandler)
      s.el.pause(); s.el.src = ''
    })
    this.ctx?.close()
    this.ctx = null
  }
}
