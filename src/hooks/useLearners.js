import { useEffect, useState } from 'react'

// 在学人数（demo 模拟数据）：作息曲线（5 点谷底、21 点峰值）+ 每 30s 轻微随机游走。
// roadmap：接入真实同侪在线数据（答辩口径明确标注 demo 为模拟）。
function baseCount() {
  const h = new Date().getHours() + new Date().getMinutes() / 60
  const wave = (1 + Math.sin(2 * Math.PI * (h - 14) / 24)) / 2   // 5 点最低，21 点峰值
  return Math.round(380 + wave * 1500)
}

export function useLearners() {
  const [n, setN] = useState(baseCount)
  useEffect(() => {
    const t = setInterval(() => {
      setN(prev => Math.max(300, Math.min(2200, prev + Math.round((Math.random() - 0.48) * 24))))
    }, 30000)
    return () => clearInterval(t)
  }, [])
  return n
}
