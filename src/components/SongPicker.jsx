import { useMemo, useState } from 'react'
import { candidates, fmtDur } from '../data/mockLibrary'

// SongPicker 歌单面板（改动 6）：定向选歌入口——搜索 + 阶段预筛列表。
// "我喜欢的歌"（TME 生态命名）+ 角落来源标注"从QQ音乐导入"（demo mock，答辩口径：
// 元数据演示、接入 TME 曲库 API 即真实）。90s 限时继续走（选歌压力是特性）。
export default function SongPicker({ mode, onPick, onClose }) {
  const [q, setQ] = useState('')
  const list = useMemo(() => candidates(mode), [mode])
  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase()
    if (!kw) return list
    return list.filter(s =>
      s.title.toLowerCase().includes(kw) || s.artist.toLowerCase().includes(kw))
  }, [q, list])

  const title = mode === 'ignite' ? '我喜欢的歌 · 点火候选' : '我喜欢的歌 · 滑入候选'

  return (
    <div className="sp-overlay" onClick={onClose}>
      <div className="sp-panel" onClick={e => e.stopPropagation()}>
        <div className="sp-head">
          <span className="sp-title">{title}（{list.length}）</span>
          <button className="sp-close" onClick={onClose} aria-label="关闭">✕</button>
        </div>
        <input
          className="sp-search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="搜索歌名 / 歌手"
          aria-label="搜索歌名或歌手"
        />
        <div className="sp-list">
          {filtered.map(s => (
            <button key={s.id} className="sp-row" onClick={() => onPick(s)}>
              <span className="sp-name">{s.title}</span>
              <span className="sp-artist">{s.artist}</span>
              <span className="sp-meta">{s.bpm} BPM · {fmtDur(s.dur)}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="sp-empty">曲库中未找到 · 共 {list.length} 首</p>
          )}
        </div>
        <p className="sp-src">来源：从QQ音乐导入</p>
      </div>
    </div>
  )
}
