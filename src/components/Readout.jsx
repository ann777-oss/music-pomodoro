// C4 Readout 数据行：标签 mono、数值 Doto；INTERRUPT>0 触发信号红（唯一前景红）
export default function Readout({ bpm, vol, interrupt = 0 }) {
  return (
    <div className="ro-row">
      <div className="ro-item"><span className="ro-k">BPM</span><span className="ro-v">{bpm}</span></div>
      <div className="ro-item"><span className="ro-k">VOL</span><span className="ro-v">{vol}</span><span className="ro-u">%</span></div>
      <div className="ro-item">
        <span className="ro-k">INTERRUPT</span>
        <span className={`ro-v${interrupt > 0 ? ' signal' : ''}`}>{interrupt}</span>
      </div>
    </div>
  )
}
