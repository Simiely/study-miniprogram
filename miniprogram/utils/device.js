/**
 * utils/device.js - 平板设备检测
 *
 * 微信小程序在 iPad 上 wx.getWindowInfo().windowWidth 被钳制为
 * 手机比例的「绘制宽度」，导致 @media(min-width: 768px) 永远不命中。
 *
 * 解决方案：用 screenWidth（物理像素）进行判断：
 *   iPad 竖屏 768 / 横屏 1024，iPad Pro 12.9" 均在此区间
 *   手机宽度通常 ≤ 430
 */

/**
 * 判断当前设备是否为平板
 * @returns {boolean} true=平板（iPad 级别）
 */
function isTablet() {
  try {
    const info = wx.getWindowInfo();
    return info.screenWidth >= 768;
  } catch (e) {
    // 兼容旧版基础库
    const sys = wx.getSystemInfoSync();
    return sys.screenWidth >= 768;
  }
}

module.exports = { isTablet };
