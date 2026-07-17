/**
 * utils/cloud-data.js - 云存储 JSON 数据读取
 *
 * 所有卡片数据存储在微信云存储的 JSON 文件中，无需数据库。
 * 文件结构：
 *   boards.json              → 板块列表 [{ id, title, emoji, cardCount }]
 *   cards-<boardId>.json     → 某板块下所有卡片
 *
 * 使用 wx.cloud.downloadFile 下载后 JSON.parse，
 * 小程序端做了缓存（Storage），避免频繁下载。
 */

/** 缓存键前缀 */
const CACHE_PREFIX = 'cloud_cache_';
/** 缓存有效期（毫秒） */
const CACHE_TTL = 30 * 60 * 1000; // 30 分钟

/**
 * 获取云存储文件的完整 cloud:// URL
 * @param {string} filename 文件名（含扩展名）
 * @returns {string} 云文件 ID
 */
function getFileURL(filename) {
  const app = getApp();
  const envId = app.globalData.envId;
  return `cloud://${envId}/${filename}`;
}

/**
 * 从云存储下载 JSON 文件，带本地缓存
 * @param {string} filename - 如 "boards.json"
 * @returns {Promise<object>} 解析后的 JSON 数据
 */
async function fetchJSON(filename) {
  const cacheKey = CACHE_PREFIX + filename;
  const cached = wx.getStorageSync(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }

  try {
    const { fileID } = await wx.cloud.downloadFile({ fileID: getFileURL(filename) });
    const { data } = await wx.cloud.callFunction({
      name: 'readJSON',
      data: { fileID },
    });
    // 也可以直接用云函数读取；简化方案：downloadFile 后 wx.getFileSystemManager().readFile
    // 但最简方案是在小程序云函数中处理，此处用 downloadFile + http 方式
    const resp = await fetch(fileID);
    const json = await resp.json();

    // 写入缓存
    wx.setStorageSync(cacheKey, { data: json, ts: Date.now() });
    return json;
  } catch (e) {
    console.error('云存储读取失败', filename, e);
    // 降级：有缓存就用过期缓存
    if (cached) return cached.data;
    throw e;
  }
}

/**
 * 读取板块列表
 * @returns {Promise<{boards: Array}>}
 */
function getBoards() {
  return fetchJSON('boards.json');
}

/**
 * 读取某板块的卡片
 * @param {string} boardId - 板块 ID
 * @returns {Promise<{cards: Array}>}
 */
function getCards(boardId) {
  return fetchJSON(`cards-${boardId}.json`);
}

module.exports = { getBoards, getCards };
