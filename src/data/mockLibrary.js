// demo 曲库元数据（50 首）：答辩口径——元数据为演示 mock，接入 TME 曲库 API 后即为真实曲库。
// 音频层解耦：任何选中曲目仍由 POOLS 合成音频驱动（demo 无版权音频）。
// energy 分组 = 选歌层的音乐导演：点火候选限高 BPM（120+），滑入候选中低能量。
export const LIBRARY = [
  // —— 点火候选（15 · 高能 120+ BPM）——
  { id: 'f01', title: '孤勇者', artist: '陈奕迅', bpm: 128, dur: 265, energy: 'ignite' },
  { id: 'f02', title: '海阔天空', artist: 'BEYOND', bpm: 126, dur: 326, energy: 'ignite' },
  { id: 'f03', title: '光辉岁月', artist: 'BEYOND', bpm: 127, dur: 304, energy: 'ignite' },
  { id: 'f04', title: '追梦赤子心', artist: 'GALA', bpm: 134, dur: 317, energy: 'ignite' },
  { id: 'f05', title: '倔强', artist: '五月天', bpm: 129, dur: 267, energy: 'ignite' },
  { id: 'f06', title: '离开地球表面', artist: '五月天', bpm: 140, dur: 236, energy: 'ignite' },
  { id: 'f07', title: '怒放的生命', artist: '汪峰', bpm: 130, dur: 245, energy: 'ignite' },
  { id: 'f08', title: '飞得更高', artist: '汪峰', bpm: 128, dur: 278, energy: 'ignite' },
  { id: 'f09', title: 'Believer', artist: 'Imagine Dragons', bpm: 125, dur: 204, energy: 'ignite' },
  { id: 'f10', title: 'Faint', artist: 'Linkin Park', bpm: 132, dur: 161, energy: 'ignite' },
  { id: 'f11', title: 'Butter-Fly', artist: '和田光司', bpm: 128, dur: 233, energy: 'ignite' },
  { id: 'f12', title: '君が好きだと叫びたい', artist: 'BAAD', bpm: 131, dur: 240, energy: 'ignite' },
  { id: 'f13', title: '直到世界尽头', artist: '上杉升', bpm: 127, dur: 262, energy: 'ignite' },
  { id: 'f14', title: '铁血丹心', artist: '甄妮 / 罗文', bpm: 128, dur: 196, energy: 'ignite' },
  { id: 'f15', title: '燃烧我的卡路里', artist: '火箭少女101', bpm: 128, dur: 225, energy: 'ignite' },

  // —— 滑入候选（35 · 中低能量）——
  { id: 'g01', title: '稻香', artist: '周杰伦', bpm: 80, dur: 223, energy: 'glide' },
  { id: 'g02', title: '晴天', artist: '周杰伦', bpm: 75, dur: 269, energy: 'glide' },
  { id: 'g03', title: '七里香', artist: '周杰伦', bpm: 74, dur: 299, energy: 'glide' },
  { id: 'g04', title: '说好不哭', artist: '周杰伦', bpm: 72, dur: 246, energy: 'glide' },
  { id: 'g05', title: '星晴', artist: '周杰伦', bpm: 73, dur: 267, energy: 'glide' },
  { id: 'g06', title: '安静', artist: '周杰伦', bpm: 66, dur: 334, energy: 'glide' },
  { id: 'g07', title: '消愁', artist: '毛不易', bpm: 65, dur: 244, energy: 'glide' },
  { id: 'g08', title: '像我这样的人', artist: '毛不易', bpm: 68, dur: 224, energy: 'glide' },
  { id: 'g09', title: '成都', artist: '赵雷', bpm: 76, dur: 336, energy: 'glide' },
  { id: 'g10', title: '南山南', artist: '马頔', bpm: 70, dur: 286, energy: 'glide' },
  { id: 'g11', title: '理想三旬', artist: '陈鸿宇', bpm: 66, dur: 279, energy: 'glide' },
  { id: 'g12', title: '斑马，斑马', artist: '宋冬野', bpm: 69, dur: 267, energy: 'glide' },
  { id: 'g13', title: '平凡之路', artist: '朴树', bpm: 88, dur: 286, energy: 'glide' },
  { id: 'g14', title: '那些年', artist: '胡夏', bpm: 78, dur: 379, energy: 'glide' },
  { id: 'g15', title: '小幸运', artist: '田馥甄', bpm: 82, dur: 293, energy: 'glide' },
  { id: 'g16', title: '后来的我们', artist: '五月天', bpm: 71, dur: 261, energy: 'glide' },
  { id: 'g17', title: '突然好想你', artist: '五月天', bpm: 76, dur: 297, energy: 'glide' },
  { id: 'g18', title: '温柔', artist: '五月天', bpm: 73, dur: 289, energy: 'glide' },
  { id: 'g19', title: '拥抱', artist: '五月天', bpm: 70, dur: 274, energy: 'glide' },
  { id: 'g20', title: '红豆', artist: '王菲', bpm: 66, dur: 261, energy: 'glide' },
  { id: 'g21', title: '传奇', artist: '王菲', bpm: 72, dur: 268, energy: 'glide' },
  { id: 'g22', title: '遇见', artist: '孙燕姿', bpm: 73, dur: 254, energy: 'glide' },
  { id: 'g23', title: '开始懂了', artist: '孙燕姿', bpm: 70, dur: 262, energy: 'glide' },
  { id: 'g24', title: '阴天', artist: '莫文蔚', bpm: 69, dur: 271, energy: 'glide' },
  { id: 'g25', title: '盛夏的果实', artist: '莫文蔚', bpm: 68, dur: 316, energy: 'glide' },
  { id: 'g26', title: '情歌', artist: '梁静茹', bpm: 71, dur: 285, energy: 'glide' },
  { id: 'g27', title: '暖暖', artist: '梁静茹', bpm: 84, dur: 252, energy: 'glide' },
  { id: 'g28', title: '童话', artist: '光良', bpm: 72, dur: 244, energy: 'glide' },
  { id: 'g29', title: '后来', artist: '刘若英', bpm: 68, dur: 301, energy: 'glide' },
  { id: 'g30', title: '很爱很爱你', artist: '刘若英', bpm: 70, dur: 294, energy: 'glide' },
  { id: 'g31', title: 'My Love', artist: 'Westlife', bpm: 66, dur: 231, energy: 'glide' },
  { id: 'g32', title: 'Yellow', artist: 'Coldplay', bpm: 87, dur: 269, energy: 'glide' },
  { id: 'g33', title: 'Fix You', artist: 'Coldplay', bpm: 68, dur: 296, energy: 'glide' },
  { id: 'g34', title: 'The Scientist', artist: 'Coldplay', bpm: 73, dur: 302, energy: 'glide' },
  { id: 'g35', title: 'Yesterday Once More', artist: 'Carpenters', bpm: 68, dur: 238, energy: 'glide' },
]

// 按阶段取候选（选歌层的音乐导演：列表已按能量预筛）
export const candidates = energy => LIBRARY.filter(s => s.energy === energy)

// 秒 → "m:ss"
export const fmtDur = sec => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
