/**
 * utils/cloud-data.js - 数据读取（先本地，后云存储）
 *
 * 【当前】从项目 sample-data/ 目录读取本地 JSON 文件
 * 【后续】填好 app.js 中的 envId 后，开启云存储模式：
 *   将下面 CLOUD_ENABLED 改为 true 即可
 *
 * 本地 JSON 文件位置：
 *   sample-data/boards.json              → 板块列表
 *   sample-data/cards-<boardId>.json     → 某板块下所有卡片
 */

const CLOUD_ENABLED = false;

/* ========== 本地读取 ========== */

function readLocalJSON(filename) {
  try {
    const fm = wx.getFileSystemManager();
    const raw = fm.readFileSync(`sample-data/${filename}`, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('本地 JSON 读取失败', filename, e);
    return null;
  }
}

function getBoardsLocal() {
  return readLocalJSON('boards.json');
}

function getCardsLocal(boardId) {
  return readLocalJSON(`cards-${boardId}.json`);
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
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data;
  }
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
  if (CLOUD_ENABLED) return fetchJSONCloud(`cards-${boardId}.json`);
  return Promise.resolve(getCardsLocal(boardId));
}

module.exports = { getBoards, getCards };
