/**
 * utils/stats.js - 本地统计管理
 *
 * 统计策略：
 *   1. 每次「卡片翻到背面」时累加（recordCardView），数据存 wx.Storage
 *   2. 每日 0:00 自动拍一次快照（snapshot），统计页只读快照
 *   3. 提供清空功能（clearStats）
 *
 * 为什么用本地存储而不实时请求云端？
 *   - 零云资源消耗，离线可用
 *   - 每日快照防止数据实时跳动（用户感知更稳定）
 *   - 清空只影响当天
 */

const STATS_KEY = 'study_stats';
const SNAPSHOT_KEY = 'study_snapshot';

/** 获取当天日期字符串 YYYY-MM-DD */
function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * 记录一张卡片的浏览
 * @param {string} cardId - 卡片唯一 ID
 * @param {string} cardName - 卡片名称（用于排行显示）
 */
function recordCardView(cardId, cardName) {
  const date = today();
  const key = `${STATS_KEY}_${date}`;
  let data = wx.getStorageSync(key) || { views: {}, order: [] };

  if (!data.views[cardId]) {
    data.views[cardId] = { id: cardId, name: cardName, count: 0 };
    data.order.push(cardId);
  }
  data.views[cardId].count += 1;
  wx.setStorageSync(key, data);

  // 更新当日快照（用于统计页显示）
  updateSnapshot(date);
}

/**
 * 更新/生成当日快照
 */
function updateSnapshot(date) {
  const key = `${STATS_KEY}_${date}`;
  const data = wx.getStorageSync(key);
  if (!data || !data.views) return;

  const list = Object.values(data.views)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const snapshot = {
    date,
    totalViews: list.reduce((s, v) => s + v.count, 0),
    distinctCards: list.length,
    list,
  };
  wx.setStorageSync(SNAPSHOT_KEY, snapshot);
}

/**
 * 获取最近一次快照（统计页调用）
 * @returns {{ date: string, totalViews: number, distinctCards: number, list: Array }}
 */
function getDailySnapshot() {
  const snap = wx.getStorageSync(SNAPSHOT_KEY);
  if (snap && snap.date === today()) return snap;

  // 如果今天没有快照（首次访问），生成一个
  updateSnapshot(today());
  return wx.getStorageSync(SNAPSHOT_KEY) || { date: today(), totalViews: 0, distinctCards: 0, list: [] };
}

/**
 * 清空今日统计
 */
function clearStats() {
  const date = today();
  wx.removeStorageSync(`${STATS_KEY}_${date}`);
  wx.removeStorageSync(SNAPSHOT_KEY);
}

module.exports = { recordCardView, getDailySnapshot, clearStats };
