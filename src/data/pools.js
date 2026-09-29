// demo 预置音频池（合成素材，scripts/gen-audio.mjs 生成；P5 前替换真实免版权音乐）
export const POOLS = {
  fire: {
    label: '点火池',
    tracks: ['/audio/fire-01.wav', '/audio/fire-02.wav'],
  },
  glide: {
    label: '滑入池',
    tracks: ['/audio/glide-01.wav', '/audio/glide-02.wav', '/audio/glide-03.wav'],
  },
  flow: {
    label: '心流池',
    tracks: ['/audio/flow-01.wav', '/audio/flow-02.wav', '/audio/flow-03.wav', '/audio/flow-04.wav'],
  },
  human: {
    label: '人间池',
    tracks: ['/audio/human-01.wav', '/audio/human-02.wav'],
  },
}

// 心流声场类型（改动 7：选歌页可选/可试听）。
// 音频由 gen-audio.mjs 合成（80s loop）；demo 元数据，接入 TME 音乐疗愈专区即真实内容。
export const FLOW_TYPES = {
  rain:    { file: '/audio/flow-rain.wav',    label: '雨声',   desc: '白噪音 · 经典学习声场' },
  wave:    { file: '/audio/flow-wave.wav',    label: '海浪',   desc: '白噪音 · 慢涌节律' },
  piano:   { file: '/audio/flow-piano.wav',   label: '钢琴',   desc: '纯音乐 · C-Am-F-G 慢和弦' },
  lofi:    { file: '/audio/flow-lofi.wav',    label: 'Lo-fi',  desc: '80 BPM · 黑胶炒豆' },
  library: { file: '/audio/flow-library.wav', label: '图书馆', desc: '环境音 · 致敬民间智慧' },
}
export const FLOW_DEFAULT = 'piano'

// 模拟红心池（选歌页候选；demo 阶段曲名仅作 UI 展示，音频仍走 POOLS）
export const HEART_POOL = {
  fire: [
    { name: '孤勇者', tag: '高能' },
    { name: '追梦赤子心', tag: '高能' },
    { name: '倔强', tag: '高能' },
    { name: '怒放的生命', tag: '高能' },
    { name: 'You Raise Me Up', tag: '钢琴' },
  ],
  glide: [
    { name: '晴天', tag: '老歌' },
    { name: '稻香', tag: '老歌' },
    { name: '七里香', tag: '老歌' },
    { name: '南山南', tag: '民谣' },
    { name: '成都', tag: '民谣' },
  ],
}

