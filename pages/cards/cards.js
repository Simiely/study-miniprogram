// pages/cards/cards.js - 卡片浏览页（翻面学习）
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

  // 点击卡片翻面：第一次翻到背面（揭示答案）记一次「看了」
  onTapCard() {
    if (!this.data.cards.length) return;
    if (!this.data.flipped) {
      const card = this.data.cards[this.data.index];
      recordCardView(card.id, card.front || card.title);
    }
    this.setData({ flipped: !this.data.flipped });
  },

  next() {
    const n = this.data.cards.length;
    if (!n) return;
    let i = this.data.index + 1;
    if (i >= n) i = 0; // 循环回第一张
    this.setData({ index: i, flipped: false, progress: `${i + 1} / ${n}` });
  },

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
