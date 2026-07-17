const { getDailySnapshot, clearStats } = require('../../utils/stats');
const { isTablet, isLandscape } = require('../../utils/device');

Page({
  data: {
    date: '', totalViews: 0, distinctCards: 0, list: [],
    isTablet: false, isLandscape: false,
  },

  onShow() {
    this.setData({ isTablet: isTablet(), isLandscape: isLandscape() });
    this.refresh();
  },

  refresh() {
    const snap = getDailySnapshot();
    this.setData({
      date: snap.date,
      totalViews: snap.totalViews,
      distinctCards: snap.distinctCards,
      list: snap.list,
    });
  },

  onClear() {
    wx.showModal({
      title: '清空统计',
      content: '确定要清空所有看卡统计吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          clearStats();
          this.refresh();
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      },
    });
  },
});
