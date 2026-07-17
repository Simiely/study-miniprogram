# 学习卡片小程序骨架（云存储 JSON + 本地看卡统计）

## 架构
- **纯云存储 JSON 路线**：零数据库、零云函数、免域名白名单。
- 数据托管在云存储根目录：`boards.json` + `cards-{boardId}.json`，小程序用 `wx.cloud.downloadFile` 按需读取。
- **看卡统计全本地**：走 `wx.Storage`，不消耗任何云资源。

## 目录结构
```
app.js / app.json / app.wxss        云环境初始化 + 全局配置
project.config.json / sitemap.json  项目配置
utils/stats.js                      本地统计：实时累计 + 每日0点快照 + 清空
utils/cloud-data.js                 云存储 JSON 读取 + 本地缓存
pages/index/                        板块列表（读 boards.json）
pages/cards/                        翻面学习（点卡片翻到背面记一次「看了」）
pages/stats/                        统计页（每日快照 + 清空按钮）
sample-data/                        示例数据，供上传云存储参考
```

## 统计功能（满足需求）
- `recordCardView(cardId, title)`：每次翻面看到答案时实时 +1（真实累计，始终准确）。
- `getDailySnapshot()`：每天**首次打开统计页**时基于累计生成快照并冻结当天；当天内重进返回同一份 → **非实时刷新、24 点刷新一次**。跨日自动重新生成。
- `clearStats()`：一键清空。
- 统计页展示：`累计观看次数`、`看过卡片种类`、`各卡片观看次数排行`（降序）。

## 你需要做的 3 步
1. 把 `app.js` 里的 `envId: 'your-cloud-env-id'` 换成你的云开发环境 ID。
2. 把 `sample-data/` 下的 `boards.json`、`cards-english.json`、`cards-history.json` 上传到**云存储根目录**（文件名保持一致）。
3. 微信开发者工具导入本项目目录运行即可。

## 备注
- 卡片「看了」定义为：翻面看到答案的那一下。若想改成「卡片展示即计数」，改 `pages/cards/cards.js` 的 `onTapCard` 即可。
- 快照在「当天首次打开统计页」生成并冻结，非严格 0:00 触发；如需严格 0:00 刷新，可改用定时/启动比对方案（见 utils/stats.js 注释）。
- 用户进度/收藏/错题后期要存，再加云数据库（按 `_openid` 自动隔离），与云存储不冲突。
