// utils/stats.js
// 本地用户统计模块（零后端、零数据库，全部走 wx.Storage）
//
// 需求：
//   1. 每张卡片看了多少次           → stats_card_views[id].count
//   2. 一共看了多少张卡片（种类数） → 去重卡片数 distinctCards
//   3. 总观看次数                   → totalViews
//   4. 清空统计                     → clearStats()
//   5. 显示不是实时的，每天 0 点刷新一次 → 每日快照 daily_snapshot
//
// 设计说明：
//   - recordCardView() 每次看卡时实时 +1（写入真实累计，始终准确）
//   - getDailySnapshot() 负责「显示用的快照」：每天 0 点后首次调用才重新生成，
//     当天内重复调用返回同一份快照 → 满足「不是实时刷新，24 点刷新一次」
//   - 想要「当日新增」而非「累计」时，把 recordCardView 改成写每日计数即可（见文件末尾注释）

const KEY_VIEWS = 'stats_card_views';        // { [cardId]: { count, title } } 实时累计
const KEY_SNAPSHOT = 'stats_daily_snapshot';  // { date, list, totalViews, distinctCards }

function todayStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// 实时记录一次看卡（只更新真实累计，不影响显示快照）
function recordCardView(cardId, title) {
  if (!cardId) return;
  const views = wx.getStorageSync(KEY_VIEWS) || {};
  if (!views[cardId]) views[cardId] = { count: 0, title: title || cardId };
  views[cardId].count += 1;
  if (title) views[cardId].title = title;
  wx.setStorageSync(KEY_VIEWS, views);
}

// 生成 / 获取当日快照（每天 0 点后首次调用时重新生成）
function getDailySnapshot() {
  const today = todayStr();
  const snap = wx.getStorageSync(KEY_SNAPSHOT);
  if (snap && snap.date === today) {
    return snap; // 当天已生成 → 直接返回（即「24 点刷新一次」）
  }
  // 跨日或首次 → 基于实时累计重新生成快照
  const views = wx.getStorageSync(KEY_VIEWS) || {};
  const list = Object.keys(views)
    .map((id) => ({ id, title: views[id].title, count: views[id].count }))
    .sort((a, b) => b.count - a.count); // 按观看次数降序
  const totalViews = list.reduce((sum, x) => sum + x.count, 0);
  const distinctCards = list.length;
  const newSnap = { date: today, list, totalViews, distinctCards };
  wx.setStorageSync(KEY_SNAPSHOT, newSnap);
  return newSnap;
}

// 清空所有统计
function clearStats() {
  wx.removeStorageSync(KEY_VIEWS);
  wx.removeStorageSync(KEY_SNAPSHOT);
}

module.exports = { recordCardView, getDailySnapshot, clearStats };

/*
 * 若希望统计「当天新增」而非「累计」：
 *   1) 把 recordCardView 写入的 key 改成 `stats_card_views_${todayStr()}`；
 *   2) getDailySnapshot 读取对应日期的计数即可，跨日自动归零。
 * 当前实现为「累计快照」，更贴合「哪个卡片一共看了多少次」的语义。
 */
