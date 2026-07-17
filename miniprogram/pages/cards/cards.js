const { getCards } = require('../../utils/cloud-data');
const { recordCardView } = require('../../utils/stats');
const { isTablet, isLandscape } = require('../../utils/device');

Page({
  data: {
    title: '',
    cards: [],
    index: 0,
    loading: true,
    isTablet: false,
    isLandscape: false,
    /* 浏览模式 / 卡片模式 */
    mode: 'browse',
    /* 弹出层 */
    popup: false,
    popupCard: null,
    /* 已看过卡片集合 */
    visited: {},
  },

  onLoad(options) {
    const isTab = isTablet();
    const info = wx.getWindowInfo();
    const isLand = isLandscape();
    let winHeight = info.windowHeight;
    this.setData({ isTablet: isTab, isLandscape: isLand, winHeight });
    const boardId = options.boardId;
    const title = decodeURIComponent(options.title || '');
    wx.setNavigationBarTitle({ title: title || '卡片' });
    this.setData({ title, boardId });
    this.loadCards(boardId);
  },

  async loadCards(boardId) {
    try {
      const data = await getCards(boardId);
      const cards = data.cards || [];
      this.setData({ cards, loading: false, index: 0, progress: cards.length ? `1 / ${cards.length}` : '' });
    } catch (e) {
      wx.showToast({ title: '加载卡片失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  /* ---- 模式切换 ---- */
  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ mode: mode, popup: false });
  },

  /* ---- 浏览模式：点方格弹出详情 ---- */
  onTapTile(e) {
    const id = e.currentTarget.dataset.id;
    const card = this.data.cards.find(c => c.id === id);
    if (!card) return;
    const visited = { ...this.data.visited, [id]: true };
    recordCardView(card.id, card.zh || card.front);
    this.setData({ popup: true, popupCard: card, visited });
  },

  closePopup() {
    this.setData({ popup: false, popupCard: null });
  },

  /* ---- 卡片模式：翻页 / 随机 ---- */
  next() {
    const n = this.data.cards.length;
    if (!n) return;
    let i = this.data.index + 1;
    if (i >= n) i = 0;
    const card = this.data.cards[i];
    recordCardView(card.id, card.zh || card.front);
    this.setData({ index: i, progress: `${i + 1} / ${n}` });
  },

  prev() {
    const n = this.data.cards.length;
    if (!n) return;
    let i = this.data.index - 1;
    if (i < 0) i = n - 1;
    this.setData({ index: i, progress: `${i + 1} / ${n}` });
  },

  random() {
    const n = this.data.cards.length;
    if (!n) return;
    const i = Math.floor(Math.random() * n);
    const card = this.data.cards[i];
    recordCardView(card.id, card.zh || card.front);
    this.setData({ index: i, progress: `${i + 1} / ${n}` });
  },

  /* ---- 发音 ---- */
  playSound(e) {
    const type = e.currentTarget.dataset.type;
    const card = this.data.cards[this.data.index];
    if (!card) return;
    const text = card[type] || '';
    console.log('播放发音:', type, text);
    wx.showToast({ title: `🔊 ${text}`, icon: 'none', duration: 1500 });
  },

  playSoundPopup(e) {
    const type = e.currentTarget.dataset.type;
    const card = this.data.popupCard;
    if (!card) return;
    const text = card[type] || '';
    console.log('播放发音(弹出):', type, text);
    wx.showToast({ title: `🔊 ${text}`, icon: 'none', duration: 1500 });
  },

  /* ---- 页面跳转 ---- */
  goStats() { wx.navigateTo({ url: '/pages/stats/stats' }); },
  goBoards() { wx.navigateBack({ delta: 1 }); },
});
