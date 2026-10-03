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

// 心流声场类型（改动 7：选歌页可选/可试听；改动 9：白噪音类别扩展 + 分组）。
// 音频由 gen-audio.mjs 合成（80s loop）；demo 元数据，接入 TME 音乐疗愈专区即真实内容。
// group: 'music' 纯音乐组 / 'noise' 白噪音组（选歌页分两行展示）。
export const FLOW_TYPES = {
  piano:   { file: '/audio/flow-piano.wav',   label: '钢琴',   desc: '纯音乐 · C-Am-F-G 慢和弦', group: 'music' },
  lofi:    { file: '/audio/flow-lofi.wav',    label: 'Lo-fi',  desc: '纯音乐 · 80 BPM 黑胶炒豆', group: 'music' },
  rain:    { file: '/audio/flow-rain.wav',    label: '雨声',   desc: '白噪音 · 经典学习声场', group: 'noise' },
  wave:    { file: '/audio/flow-wave.wav',    label: '海浪',   desc: '白噪音 · 慢涌节律', group: 'noise' },
  library: { file: '/audio/flow-library.wav', label: '图书馆', desc: '白噪音 · 致敬民间智慧', group: 'noise' },
  wind:    { file: '/audio/flow-wind.wav',    label: '风声',   desc: '白噪音 · 阵风呼啸起伏', group: 'noise' },
  cafe:    { file: '/audio/flow-cafe.wav',    label: '咖啡馆', desc: '白噪音 · 人声嗡嗡+杯具叮当', group: 'noise' },
  night:   { file: '/audio/flow-night.wav',   label: '夜晚虫鸣', desc: '白噪音 · 夏夜蟋蟀', group: 'noise' },
}
export const FLOW_DEFAULT = 'piano'

// 分组渲染结构（改动 9）：纯音乐 / 白噪音 两行
export const FLOW_GROUPS = [
  { key: 'music', label: '纯音乐' },
  { key: 'noise', label: '白噪音' },
]

// 计时背景（改动 10）：默认黑白点阵 / 窗边黄昏 / 伴学书桌（AI 生成暖色真实感素材）。
// 渲染规则见 FocusPage 背景层：图 + 纯色暗化遮罩（禁渐变）；有图时隐藏背景点场。
export const BG_TYPES = {
  none:   { label: '默认', desc: 'Nothing 黑白点阵',            file: null },
  window: { label: '窗边', desc: '黄昏窗景 · 暖光台灯',          file: '/bg/window.jpg' },
  buddy:  { label: '伴学', desc: '斜对桌的台灯下 · 有人陪你学',  file: '/bg/study-buddy.jpg' },
}
export const BG_DEFAULT = 'none'

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

