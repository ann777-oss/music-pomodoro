# MUSIC POMODORO · 音乐番茄钟

> Every pomodoro, a performance we conduct.

一个 45 分钟的音乐番茄钟：**点火 → 滑入 → 心流**，休息 10 分钟——音乐全程自动导演，为深度学习场景而设计。考研/大学生番茄工作法的音乐化重做。

## 机制：三阶段音乐导演

| 阶段 | 时长 | 音乐 | 音量 |
|---|---|---|---|
| Ⅰ 点火 | 5 min | 你选的高能歌 · 单曲循环 | 100% |
| Ⅱ 滑入 | 10 min | 熟悉老歌 · 能量递减 | 渐降至 80% |
| Ⅲ 心流 | 30 min | 你选的声场（钢琴/Lo-fi + 白噪音 8 类） | 60% 稳态 |
| 休息 | 10 min | 心流声场延续 | — |

- 每天只选两首歌 + 一个声场（90 秒限时，超时自动继承）
- 三阶段 crossfade 无缝切换（10s），音乐变化不构成注意力事件
- 阶段边界 ±15s 灵活容差：尊重歌曲完整性，总时长锚定不漂移
- 番茄中无切歌入口、无歌词页、无推送——番茄里唯一的音乐操作是"没有操作"
- 阶段时长可调（0-15 / 0-20 / 5-60 min）：静心能力因人而异

## 在线体验

**链接：** （部署后回填）

本地运行：

```bash
npm install
npm run dev
```

## 技术栈

React + Vite · Web Audio API（双轨 crossfade / 灵活边界 / 音量曲线） · 显式状态机（TDD） · localStorage 持久化

## 音频素材署名

demo 音乐来自 [Kevin MacLeod (incompetech.com)](https://incompetech.com)，授权 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)：

《Ready Aim Fire》《Wholesome》《Bittersweet》《Fireflies and Stardust》《Relaxing Piano Music》《Chill Wave》

白噪音声场（雨声/海浪/图书馆/风声/咖啡馆/夜晚虫鸣）为本仓库脚本自产合成（`scripts/gen-audio.mjs`），零外部素材。
