const { getBoards } = require('../../utils/cloud-data');
const { isTablet, isLandscape } = require('../../utils/device');

Page({
  data: {
    boards: [],
    loading: true,
    isTablet: false,
    isLandscape: false,
  },

  async onLoad() {
    this.setData({ isTablet: isTablet(), isLandscape: isLandscape() });
    try {
      const data = await getBoards();
      this.setData({ boards: data.boards || [], loading: false });
    } catch (e) {
      wx.showToast({ title: '加载板块失败', icon: 'none' });
      this.setData({ loading: false });
    }
  },

  onTapBoard(e) {
    const { id, title } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/cards/cards?boardId=${id}&title=${encodeURIComponent(title)}`,
    });
  },

  goStats() {
    wx.navigateTo({ url: '/pages/stats/stats' });
  },
});
