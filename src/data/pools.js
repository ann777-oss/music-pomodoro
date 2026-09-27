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
