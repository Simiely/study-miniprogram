# 学习卡片小程序 🃏

儿童双语学习卡片微信小程序，参考 [word-cards](https://simiely.github.io/word-cards/) 的视觉风格设计。

## 仓库结构

```
study-miniprogram/
├── miniprogram/       ← 微信小程序源码（DevTools 直接打开运行）
│   ├── app.js        # 小程序入口 + 云开发初始化
│   ├── pages/        # 首页 / 学习页 / 统计页
│   ├── utils/        # 云数据读取 / 设备检测 / 本地统计
│   └── sample-data/  # 示例 JSON 数据（上传云存储）
│
├── design-docs/       ← 设计稿与文档
│   ├── design/ui-mockup.html  # 双布局 UI 示意（15 屏）
│   ├── DUAL_UI_DESIGN.md      # 手机+iPad 双布局设计规范
│   └── INTERACTION_LOGIC.md   # 完整交互逻辑文档
│
└── README.md          ← 本文件
```

## 快速开始

1. 用**微信开发者工具**打开 `miniprogram/` 目录
2. 在 `app.js` 中填入你的**云开发环境 ID**
3. 将 `sample-data/` 下的三个 JSON 文件上传到云存储根目录
4. 即可预览运行

## 功能特性

- **双模式**：浏览模式（方阵网格 + 弹出详情）/ 卡片模式（大图 + 发音 + 翻页）
- **双布局**：手机竖屏 + iPad 12.9″（竖屏/横屏），自动适配
- **发音交互**：中文名 / 英文名 / 科普说明文，三段横幅整条可点
- **本地统计**：浏览次数累加 → 每日 0:00 快照 → 排行榜
- **6 个学习板块**：动物（已上线）/ 水果 / 交通工具 / 颜色形状 / 数字 / 身体部位

## 设计参考

配色与视觉语言来自 [word-cards](https://simiely.github.io/word-cards/)：
- 奶油底 `#f5f0e8`
- 主绿 `#4a7c59`
- 暖桃 `#e8a87c`
- 全文 `#3c3c3c`
