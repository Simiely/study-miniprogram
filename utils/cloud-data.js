// utils/cloud-data.js
// 读取云存储里的 JSON 数据文件，带本地缓存（避免每次打开都重新下载）。
//
// 云存储文件组织（在云开发控制台手动上传到云存储根目录）：
//   boards.json          板块列表
//   cards-{boardId}.json  某个板块的卡片，如 cards-english.json
//
// fileID 拼接规则：cloud://<envId 整段>/<path>
//   envId 取 app.js 中 globalData.envId（cloud:// 与第一个 / 之间的整段）

function getEnv() {
  return getApp().globalData.envId;
}

// 从云存储下载并解析一个 JSON 文件
function downloadJSON(fileID) {
  return new Promise((resolve, reject) => {
    wx.cloud.downloadFile({ fileID })
      .then((res) => {
        const fs = wx.getFileSystemManager();
        const text = fs.readFileSync(res.tempFilePath, 'utf-8');
        try {
          resolve(JSON.parse(text));
        } catch (e) {
          reject(new Error('JSON 解析失败: ' + fileID));
        }
      })
      .catch(reject);
  });
}

// 读取板块列表（带本地缓存）
async function getBoards() {
  const cacheKey = 'cache_boards';
  const cached = wx.getStorageSync(cacheKey);
  if (cached) return cached;
  const data = await downloadJSON(`cloud://${getEnv()}/boards.json`);
  wx.setStorageSync(cacheKey, data);
  return data;
}

// 读取某板块的卡片（带本地缓存）
async function getCards(boardId) {
  const cacheKey = `cache_cards_${boardId}`;
  const cached = wx.getStorageSync(cacheKey);
  if (cached) return cached;
  const data = await downloadJSON(`cloud://${getEnv()}/cards-${boardId}.json`);
  wx.setStorageSync(cacheKey, data);
  return data;
}

// 清掉本地数据缓存（调试或内容大更新后用）
function clearDataCache() {
  wx.removeStorageSync('cache_boards');
  Object.keys(wx.getStorageInfoSync().keys)
    .filter((k) => k.startsWith('cache_cards_'))
    .forEach((k) => wx.removeStorageSync(k));
}

module.exports = { getBoards, getCards, clearDataCache };
