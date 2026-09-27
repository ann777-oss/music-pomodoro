// 音乐番茄钟 · demo 合成音频生成脚本（node，零依赖）
// 生成四类素材：fire 高能和弦 / glide 中板琶音 / flow 低频纯音 / human 明亮旋律
// 22050Hz 单声道 16bit PCM WAV。真实音乐素材（免版权 mp3）在 P5 前替换。
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SR = 22050
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'audio')

// —— WAV 写出（RIFF/PCM 16bit 单声道）——
function writeWav(name, samples) {
  const n = samples.length
  const buf = Buffer.alloc(44 + n * 2)
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8)
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20)
  buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28)
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34)
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40)
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]))
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2)
  }
  writeFileSync(join(OUT, name), buf)
  console.log(`${name}: ${(n / SR).toFixed(1)}s`)
}

// 采样合成器：fn(t, tLocal) -> [-1, 1]
function synth(duration, fn) {
  const n = Math.floor(duration * SR)
  const out = new Float64Array(n)
  for (let i = 0; i < n; i++) out[i] = fn(i / SR)
  return out
}
const sin = (f, t) => Math.sin(2 * Math.PI * f * t)

// —— fire：128BPM 和弦脉冲（A 大调，明亮高能）——
function fireTrack(dur) {
  const chord = [220, 277.18, 329.63, 440]     // A3 C#4 E4 A4
  const beat = 60 / 128                          // 469ms
  return synth(dur, t => {
    const tb = t % beat
    let v = 0
    const env = Math.exp(-tb * 9)                // 每拍快衰减
    for (const f of chord) v += sin(f, t) * 0.22 * env
    v += sin(55, t) * 0.5 * Math.exp(-tb * 14)   // 低频"鼓点"
    return v * 0.8
  })
}

// —— glide：中板琶音（C 大调，柔和三角波感）——
function glideTrack(dur) {
  const notes = [261.63, 329.63, 392.0, 523.25]  // C4 E4 G4 C5
  const step = 0.38
  return synth(dur, t => {
    const idx = Math.floor(t / step)
    const tl = t - idx * step
    const f = notes[idx % notes.length]
    const env = Math.min(1, tl / 0.02) * Math.exp(-tl * 3.2)  // 20ms attack + 慢衰减
    const tri = Math.asin(sin(f, t)) * (2 / Math.PI)          // 三角波
    return tri * 0.4 * env
  })
}

// —— flow：低频纯音 pad（110Hz + 泛音 + 微颤，Adagio 沉静）——
function flowTrack(dur) {
  return synth(dur, t => {
    const vib = 1 + 0.0025 * sin(0.15, t)        // 缓慢颤音
    let v = sin(110 * vib, t) * 0.5
    v += sin(165 * vib, t) * 0.2                // 1.5x 泛音
    v += sin(220 * vib, t) * 0.15               // 2x 泛音
    const fade = Math.min(1, t / 2, (dur - t) / 2)  // 首尾 2s 淡入淡出
    return v * 0.55 * fade
  })
}

// —— human：明亮旋律 + 节拍（"人间感"——休息期）——
function humanTrack(dur, seed) {
  const scale = [523.25, 587.33, 659.25, 783.99, 880.0]  // C5 D5 E5 G5 A5
  let rng = seed
  const rand = () => (rng = (rng * 16807) % 2147483647) / 2147483647
  const noteDur = 0.32
  const notes = []
  for (let i = 0; i < dur / noteDur; i++) notes.push(scale[Math.floor(rand() * scale.length)])
  return synth(dur, t => {
    const idx = Math.floor(t / noteDur)
    const tl = t - idx * noteDur
    const f = notes[idx]
    const env = Math.min(1, tl / 0.015) * Math.exp(-tl * 2.5)
    const tri = Math.asin(sin(f, t)) * (2 / Math.PI)
    let v = tri * 0.35 * env
    if (tl < 0.08) v += (rand() * 2 - 1) * 0.12 * (1 - tl / 0.08)  // 短促"沙锤"
    return v
  })
}

// —— 素材清单（时长服务灵活边界听测）——
mkdirSync(OUT, { recursive: true })
writeWav('fire-01.wav', fireTrack(30))
writeWav('fire-02.wav', fireTrack(60))   // 备用（跨日换曲）
writeWav('glide-01.wav', glideTrack(40))
writeWav('glide-02.wav', glideTrack(45))
writeWav('glide-03.wav', glideTrack(50))
writeWav('flow-01.wav', flowTrack(60))
writeWav('flow-02.wav', flowTrack(60))
writeWav('flow-03.wav', flowTrack(60))
writeWav('flow-04.wav', flowTrack(60))
writeWav('human-01.wav', humanTrack(40, 42))
writeWav('human-02.wav', humanTrack(40, 7))
console.log('done -> public/audio/')
