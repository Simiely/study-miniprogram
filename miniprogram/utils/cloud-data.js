/**
 * utils/cloud-data.js - 数据读取（先本地，后云存储）
 *
 * 【当前】从项目 sample-data/*.js 读取本地数据（require 方式）
 * 【后续】开启云存储：
 *   1. 在 app.js 中填入正确 envId
 *   2. 将下方 CLOUD_ENABLED 改为 true
 *   3. 将 sample-data/*.json 上传到云存储根目录
 */

const CLOUD_ENABLED = false;

/* ========== 本地读取（require 项目内 JS 模块）========== */

function getBoardsLocal() {
  return require('../sample-data/boards.js');
}

function getCardsLocal(boardId) {
  try {
    return require(`../sample-data/cards-${boardId}.js`);
  } catch (e) {
    console.error(`本地卡片数据不存在: cards-${boardId}.js`, e);
    return { cards: [] };
  }
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
  if (CLOUD_ENABLED) return fetchJSONCloud(`cards-${boardId}.json`);
  return Promise.resolve(getCardsLocal(boardId));
}

module.exports = { getBoards, getCards };
