# 学习卡片微信小程序 · 交接文档

## 📋 项目概览

| 项目 | 内容 |
|------|------|
| 仓库 | https://github.com/Simiely/study-miniprogram |
| 本地开发路径 | `C:\Users\2504\Documents\xiaochengxu\study-miniprogram` |
| 微信开发者工具导入路径 | 同上 |
| 技术栈 | 原生微信小程序（WXML / WXSS / JS），无 npm 构建 |
| 数据模式 | 本地 require JS 模块（sample-data/*.js） |

---

## 📁 仓库结构

```
study-miniprogram/
├── README.md                    ← 仓库说明
├── HANDOFF.md                   ← 本文档
├── miniprogram/                 ← 小程序源码（DevTools 可运行）
│   ├── app.js / app.json / app.wxss
│   ├── pages/index/             ← 首页：板块列表
│   ├── pages/cards/             ← 学习页：浏览模式 + 卡片模式
│   ├── pages/stats/             ← 统计页：今日数据
│   ├── utils/
│   │   ├── cloud-data.js        ← 数据读取（本地/云存储切换）
│   │   ├── device.js            ← isTablet() / isLandscape()
│   │   └── stats.js             ← 本地统计（累加/快照/清空）
│   └── sample-data/             ← 示例数据
│       ├── boards.js            ← 6 个学习板块
│       ├── cards-animal.js      ← 动物板块 5 张示例卡片
│       ├── cards-english.js
│       └── cards-history.js
└── design-docs/                 ← 设计稿与文档
    ├── design/ui-mockup.html    ← UI 示意稿（真实分辨率）
    ├── DUAL_UI_DESIGN.md        ← 双布局设计规范
    └── INTERACTION_LOGIC.md     ← 交互逻辑文档
```

---

## 🔧 当前状态

### 已完成
- ✅ 三个页面骨架（首页 / 学习页 / 统计页）
- ✅ 双布局适配（手机 rpx + iPad px）
- ✅ 浏览模式（方阵 + 弹出卡片详情）
- ✅ 卡片模式（大图 + 三段发音横幅 + 翻页导航）
- ✅ 6 个学习板块（动物已上线，其余即将推出灰色）
- ✅ 本地统计（累加观看次数 → 快照 → Top5）
- ✅ `"resizable": true` 启用（iPad 正确分辨率）
- ✅ `page { height: 100% }` 设置
- ✅ 数据读取用静态 require 映射（解决动态模板字符串打包遗漏）
- ✅ 本地和云端模式切换（CLOUD_ENABLED 开关）

### 待完成 / 已知问题

#### ⚠️ iPad 卡片模式布局「挤中间」
- 问题：iPad 上下卡片模式的 flex 高度链始终无法正确传递
- 已尝试方案：
  1. ~~height:100vh~~ → 小程序 vh 单位不准
  2. ~~flex:1 继承~~ → 高度链断裂
  3. ~~position:fixed;inset:0~~ → 疑似不支持
  4. ~~transform:scale~~ → 布局盒不变
  5. ⏳ **JS winHeight inline style** → 最新方案，待验证
- 当前方案：在 `cards.js` 的 `onLoad` 中获取 `wx.getWindowInfo().windowHeight`，通过 `setData({ winHeight })` 写到 `<view class="ipad-card" style="height:{{winHeight}}px">`，配合 `display:flex; flex-direction:column` 让 `lc-image` 的 `flex:1` 正确分配高度
- 排查要点：
  - 开发者工具模拟器需选择 **iPad Pro 12.9"**（不是默认的 iPhone）
  - 改 `app.json` 的 `resizable:true` 后需**重启模拟器**
  - 用 WXML 面板选中 `.ipad-card` 查看 Computed height 值
  - AppData 面板查看 `winHeight` 字段值

#### 📝 其他待做
- ⬜ 接入 TTS 发音（当前 playSound 仅 console.log + Toast）
- ⬜ 云存储 JSON 数据（CLOUD_ENABLED = true + 填 envId）
- ⬜ 更多动物卡片（目前 5 张示例）
- ⬜ 图片替换（lc-image 的渐变背景→真实动物照片）
- ⬜ 浏览模式「再来一次」功能
- ⬜ 统计页字体尺寸还没按 ÷3 重写 iPad px 值

---

## 🏗️ 架构要点

### 平板检测（utils/device.js）
```javascript
// screenWidth 是物理分辨率，iPad 竖屏 768+ / 横屏 1024+
function isTablet() { return screenWidth >= 768; }
function isLandscape() { return windowWidth > windowHeight; }
```

### 双布局机制
```html
<view class="page-root {{isTablet ? 'tablet' : ''}}">
  <block wx:if="{{!isTablet}}"><!-- 手机 WXML --></block>
  <block wx:else><!-- iPad WXML（完全独立的节点树） --></block>
</view>
```
- 手机端：mockup px × 0.568 = rpx
- iPad 端：独立 px 值，「直接用 mockup 原值」还是「÷3」待定

### CSS 要点
- 所有 iPad 平板样式写在**各页面的 wxss** 中（不在全局 app.wxss）
- 用 `.tablet .xxx` 后代选择器，不用 `@media`
- 手机默认样式不受 `.tablet` 影响

### 数据流
```
app.js onLaunch → pages/index → 选板块 → pages/cards?boardId=xxx
                                              ↓
                                  getCards(boardId) → cards-{boardId}.js
                                              ↓
                                  双模式渲染（浏览/卡片）
                                              ↓
                                  recordCardView → utils/stats.js → Storage
                                              ↓
                                  pages/stats → getDailySnapshot() → 展示
```

---

## 🚀 快速开始

1. 微信开发者工具 → 导入项目 → 选 `C:\Users\2504\Documents\xiaochengxu\study-miniprogram`
2. 模拟器顶部下拉选 **iPad Pro 12.9"**（看 iPad 布局）或 iPhone（看手机布局）
3. 点「编译」
4. 首页 → 点「动物」板块 → 进学习页
5. 点「卡片模式」切换到大图模式

---

## 🔐 安全备注
- GitHub PAT 已在对话中暴露，建议到 github.com/settings/tokens 轮换
- `app.json` 中的 `appid` 已保留真实值，请勿公开提交
