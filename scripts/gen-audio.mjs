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

// =——— 心流声场类型（改动 7：选歌页可选/可试听，80s loop 素材）———=
// 首尾 1.5s 淡入淡出保证 loop 接缝平滑；噪声类为稳态天然无缝。
const edgeFade = (s, fade = 1.5) => {
  for (let i = 0; i < s.length; i++) {
    const t = i / SR
    const g = Math.min(1, t / fade, (s.length / SR - t) / fade)
    s[i] *= g
  }
  return s
}

// —— 雨声：宽带白噪 + 低通铺垫 + 随机雨滴（泊松 ~2/s）——
function rainField(dur) {
  let lp = 0
  const drops = []                                        // [时刻, 频率]
  let rng = 1234567
  const rand = () => (rng = (rng * 16807) % 2147483647) / 2147483647
  for (let t = 0; t < dur; t += 0.3 + rand() * 0.7) drops.push([t, 3800 + rand() * 2200])
  return edgeFade(synth(dur, t => {
    const x = rand() * 2 - 1
    lp += 0.08 * (x - lp)                                 // 一阶低通
    let v = lp * 0.55 + x * 0.3                           // 沙沙宽带 + 闷底
    for (const [t0, f] of drops) {
      const dt = t - t0
      if (dt >= 0 && dt < 0.012) v += sin(f, dt) * 0.1 * Math.exp(-dt * 700)
    }
    return v * 0.85
  }))
}

// —— 海浪：棕噪 + 0.08Hz 涌动 LFO + 偶发浪拍 ——
function waveField(dur) {
  let brown = 0
  let rng = 7654321
  const rand = () => (rng = (rng * 16807) % 2147483647) / 2147483647
  return edgeFade(synth(dur, t => {
    brown = (brown + 0.02 * (rand() * 2 - 1)) / 1.02      // 棕噪积分
    const swell = 0.55 + 0.45 * sin(0.08, t)               // 慢涌
    let v = brown * 3.2 * swell
    const ph = (t * 0.08) % 1                              // 浪拍叠在涌峰
    if (ph > 0.86) v += (rand() * 2 - 1) * 0.22 * (ph - 0.86) / 0.14
    return v * 0.7
  }))
}

// —— 钢琴 pad：C-Am-F-G 慢和弦（4s/和弦 ×5 循环 = 80s，默认心流）——
function pianoField(dur) {
  const prog = [
    [130.81, 164.81, 196.0],                              // C 大三
    [110.0, 130.81, 164.81],                              // A 小
    [87.31, 130.81, 174.61],                              // F 大
    [98.0, 146.83, 196.0],                                // G 大
  ]
  const chordDur = 4
  return edgeFade(synth(dur, t => {
    const idx = Math.floor(t / chordDur) % prog.length
    const tl = t % chordDur
    let v = 0
    for (const f of prog[idx]) {
      const env = Math.exp(-tl * 0.45)                     // 长衰减"踏板"感
      v += sin(f, t) * 0.16 * env + sin(f * 2, t) * 0.05 * env
    }
    return v
  }))
}

// —— Lo-fi：Am7-Cmaj7（6s/和弦）+ 80BPM 弱鼓 + 黑胶炒豆 ——
function lofiField(dur) {
  const prog = [
    [110.0, 130.81, 164.81, 196.0],                        // Am7
    [130.81, 164.81, 196.0, 233.08],                       // Cmaj7
  ]
  const beat = 60 / 80
  let rng = 998877
  const rand = () => (rng = (rng * 16807) % 2147483647) / 2147483647
  return edgeFade(synth(dur, t => {
    const chord = prog[Math.floor(t / 6) % 2]
    const tl6 = t % 6
    let v = 0
    for (const f of chord) v += sin(f, t) * 0.09 * Math.exp(-tl6 * 0.3)
    const tb = t % beat
    if (tb < 0.1) v += sin(58, tb) * 0.3 * Math.exp(-tb * 30)          // kick
    if (tb > beat / 2 && tb < beat / 2 + 0.03) v += (rand() * 2 - 1) * 0.05 * Math.exp(-(tb - beat / 2) * 80)  // hat
    if (rand() < 0.00015) v += (rand() * 2 - 1) * 0.12                  // 炒豆
    return v * 0.9
  }))
}

// —— 图书馆：极低粉噪底 + 空调低鸣 + 稀疏翻页（~每 25s）——
// 致敬 QQ 音乐曲库里那首"图书馆环境音.番茄钟"的民间智慧。
function libraryField(dur) {
  let brown = 0
  let rng = 24680
  const rand = () => (rng = (rng * 16807) % 2147483647) / 2147483647
  const pages = []
  for (let t = 8; t < dur; t += 18 + rand() * 14) pages.push(t)
  return edgeFade(synth(dur, t => {
    brown = (brown + 0.015 * (rand() * 2 - 1)) / 1.015
    let v = brown * 1.6                                    // 底噪
    v += sin(120, t) * 0.012                               // 空调低鸣
    for (const t0 of pages) {
      const dt = t - t0
      if (dt >= 0 && dt < 0.45) {                          // 翻页 swish
        const env = Math.sin((dt / 0.45) * Math.PI)
        v += (rand() * 2 - 1) * 0.1 * env
      }
    }
    return v * 0.9
  }))
}

writeWav('flow-rain.wav', rainField(80))
writeWav('flow-wave.wav', waveField(80))
writeWav('flow-piano.wav', pianoField(80))
writeWav('flow-lofi.wav', lofiField(80))
writeWav('flow-library.wav', libraryField(80))
console.log('done -> public/audio/')
