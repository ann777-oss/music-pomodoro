import { useEffect, useRef, useState } from 'react'

// 励志标语（可自行修改）：显示态 Newsreader 斜体（design.md 每页一句配额），
// 点击进入 inline 编辑，回车/失焦保存，Esc 取消，空值回默认。localStorage 持久化。
const DEFAULT = '沉下去，浮上来时已不同。'
const LS_KEY = 'mp-motto'

export default function Motto() {
  const [motto, setMotto] = useState(() => localStorage.getItem(LS_KEY) || DEFAULT)
  const [editing, setEditing] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const save = () => {
    const v = inputRef.current?.value.trim()
    if (v) {
      setMotto(v)
      try { localStorage.setItem(LS_KEY, v) } catch { /* 存储不可用时仅本会话生效 */ }
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="mo-input"
        defaultValue={motto}
        maxLength={40}
        onClick={e => e.stopPropagation()}   // 阻断番茄页"连点三下"监听
        onBlur={save}
        onKeyDown={e => {
          if (e.key === 'Enter') save()
          if (e.key === 'Escape') setEditing(false)
        }}
        aria-label="编辑励志标语"
      />
    )
  }

  return (
    <p
      className="mo-motto"
      onClick={e => { e.stopPropagation(); setEditing(true) }}
      title="点击修改标语"
    >
      {motto}
    </p>
  )
}
