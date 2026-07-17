/**
 * utils/cloud-data.js - 数据读取（先本地，后云存储）
 *
 * 注意：微信小程序打包器静态分析 require()，不接受动态变量路径。
 * 本地模式用静态 Map 映射 boardId → 对应数据模块。
 */

const CLOUD_ENABLED = false;

/* ========== 本地读取（静态 require，不做动态拼接）========== */

/* 所有板块数据 */
const BOARDS = require('../sample-data/boards.js');

/* 按 boardId 映射卡片数据 —— 使用静态 require，不拼接字符串 */
const CARDS_MAP = {
  animal:   require('../sample-data/cards-animal.js'),
  english:  require('../sample-data/cards-english.js'),
  history:  require('../sample-data/cards-history.js'),
};

function getBoardsLocal() {
  return BOARDS;
}

function getCardsLocal(boardId) {
  const mod = CARDS_MAP[boardId];
  if (mod) return mod;
  console.error('本地卡片数据不存在: boardId=' + boardId);
  return { cards: [] };
}

/* ========== 云存储读取（后续启用）========== */

const CACHE_PREFIX = 'cloud_cache_';
const CACHE_TTL = 30 * 60 * 1000;

function getFileURL(filename) {
  const app = getApp();
  return `cloud://${app.globalData.envId}/${filename}`;
}

async function fetchJSONCloud(filename) {
  const cacheKey = CACHE_PREFIX + filename;
  const cached = wx.getStorageSync(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const { fileID } = await wx.cloud.downloadFile({ fileID: getFileURL(filename) });
    const resp = await fetch(fileID);
    const json = await resp.json();
    wx.setStorageSync(cacheKey, { data: json, ts: Date.now() });
    return json;
  } catch (e) {
    console.error('云存储读取失败', filename, e);
    if (cached) return cached.data;
    throw e;
  }
}

/* ========== 统一导出 ========== */

function getBoards() {
  if (CLOUD_ENABLED) return fetchJSONCloud('boards.json');
  return Promise.resolve(getBoardsLocal());
}

function getCards(boardId) {
  if (CLOUD_ENABLED) return fetchJSONCloud('cards-' + boardId + '.json');
  return Promise.resolve(getCardsLocal(boardId));
}

module.exports = { getBoards, getCards };
