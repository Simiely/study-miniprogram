// utils/device.js - 设备形态检测
// 关键约束（来自历史约定）：iPad 上 wx.getWindowInfo().windowWidth 被钳制为
// 手机比例的绘制宽度，导致 @media(min-width:768px) 永远不命中。
// 因此用「物理像素 screenWidth >= 768」判定平板（iPad 竖屏 768 / 横屏 1024），
// 命中后由页面在根节点挂 .tablet 类，平板样式一律用 px 写（不用 rpx）。

function getWindowInfoSafe() {
  try {
    if (typeof wx !== 'undefined' && wx.getWindowInfo) {
      return wx.getWindowInfo();
    }
    if (typeof wx !== 'undefined' && wx.getSystemInfoSync) {
      return wx.getSystemInfoSync();
    }
  } catch (e) {
    // 忽略错误，走默认
  }
  return {};
}

// 是否平板（iPad / 大屏）：screenWidth 物理像素 >= 768
function isTablet() {
  const info = getWindowInfoSafe();
  const sw = info.screenWidth || 0;
  return sw >= 768;
}

module.exports = { isTablet, getWindowInfoSafe };
