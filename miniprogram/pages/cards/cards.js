const { getCards } = require('../../utils/cloud-data');
const { recordCardView } = require('../../utils/stats');
const { isTablet } = require('../../utils/device');

Page({
  data: {
    title: '',
    cards: [],
    index: 0,
    loading: true,
    isTablet: false,
    // 浏览模式 / 卡片模式切换
    mode: 'browse',  // 'browse' | 'card'
    // 弹出层
    popup: false,
    popupCard: null,
    // 已看过卡片 ID 集合
    visited: {},
  },

  onLoad(options) {
    this.setData({ isTablet: isTablet() });
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
    if (mode === 'card') {
      this.setData({ mode: 'card', popup: false });
    } else {
      this.setData({ mode: 'browse', popup: false });
    }
  },

  /* ---- 浏览模式 ---- */
  onTapTile(e) {
    const id = e.currentTarget.dataset.id;
    const card = this.data.cards.find(c => c.id === id);
    if (!card) return;
    // 标记为已看
    const visited = { ...this.data.visited, [id]: true };
    recordCardView(card.id, card.zh || card.front);
    this.setData({ popup: true, popupCard: card, visited });
  },

  closePopup() {
    this.setData({ popup: false, popupCard: null });
  },

  /* ---- 卡片模式 ---- */
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
    const card = this.data.cards[i];
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
    // 预留：接入 TTS 或播放音频 URL
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

  goStats() { wx.navigateTo({ url: '/pages/stats/stats' }); },
  goBoards() { wx.navigateBack({ delta: 1 }); },
});
