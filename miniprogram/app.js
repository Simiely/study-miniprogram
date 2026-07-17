// app.js - 小程序入口，初始化云开发环境
App({
  globalData: {
    // ↓↓↓ 替换成你自己的云开发环境 ID ↓↓↓
    // 获取方式：微信开发者工具 → 云开发 → 顶部环境名称旁复制「环境 ID」
    // 注意：fileID 中 cloud:// 和第一个 / 之间的整段都要算进来（可能形如 my-env-1a2b3c 或带后缀）
    envId: 'your-cloud-env-id',
  },

  onLaunch() {
    const envId = this.globalData.envId;
    if (!envId || envId === 'your-cloud-env-id') {
      console.log('云开发未配置，使用本地数据模式');
      return;
    }
    if (!wx.cloud) {
      console.error('当前基础库版本过低，请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    wx.cloud.init({ env: envId, traceUser: true });
  },
});
