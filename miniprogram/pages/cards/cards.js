/**
 * pages/cards/cards.js - 卡片学习页（浏览模式 / 卡片模式双模式）
 *
 * 数据流：
 *   onLoad → 从云存储读取 cards-<boardId>.json → 渲染到页面
 *   onTapCard → 翻到背面时调用 recordCardView() 记录一次「看过」
 *   next/prev → 翻页，循环到开头/末尾
 *
 * 双模式（由 WXML 中的条件渲染控制，本文件提供逻辑）：
 *   浏览模式：格子方阵 → 点击弹出详情
 *   卡片模式：大图 + 发音横幅 + 翻页导航
 *
 * 双布局（由 isTablet + .tablet 类控制）：
 *   手机：自适应 rpx
 *   平板（iPad 12.9"）：px 单位，组件不缩放，仅重排间距
 */
const { getCards } = require('../../utils/cloud-data');
const { recordCardView } = require('../../utils/stats');
const { isTablet } = require('../../utils/device');

Page({
  data: {
    title: '',
    cards: [],
    index: 0,
    flipped: false,
    loading: true,
    progress: '',
    isTablet: false,
  },

  onLoad(options) {
    this.setData({ isTablet: isTablet() });
    const boardId = options.boardId;
    const title = decodeURIComponent(options.title || '');
    wx.setNavigationBarTitle({ title: title || '卡片' });
    this.setData({ title });
    this.loadCards(boardId);
  },

  async loadCards(boardId) {
    try {
      const data = await getCards(boardId);
      const cards = data.cards || [];
      this.setData({
        cards,
        loading: false,
        index: 0,
        flipped: false,
        progress: cards.length ? `1 / ${cards.length}` : '',
      });
    } catch (e) {
      wx.showToast({ title: '加载卡片失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  /** 点击卡片 → 翻到背面时计一次「已看」，再次点击翻回正面 */
  onTapCard() {
    if (!this.data.cards.length) return;
    if (!this.data.flipped) {
      const card = this.data.cards[this.data.index];
      recordCardView(card.id, card.front || card.title);
    }
    this.setData({ flipped: !this.data.flipped });
  },

  /** 下一张（循环） */
  next() {
    const n = this.data.cards.length;
    if (!n) return;
    let i = this.data.index + 1;
    if (i >= n) i = 0;
    this.setData({ index: i, flipped: false, progress: `${i + 1} / ${n}` });
  },

  /** 上一张（循环） */
  prev() {
    const n = this.data.cards.length;
    if (!n) return;
    let i = this.data.index - 1;
    if (i < 0) i = n - 1;
    this.setData({ index: i, flipped: false, progress: `${i + 1} / ${n}` });
  },

  goStats() {
    wx.navigateTo({ url: '/pages/stats/stats' });
  },

  goBoards() {
    wx.navigateBack({ delta: 1 });
  },
});
