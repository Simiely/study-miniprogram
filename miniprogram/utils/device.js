/**
 * utils/device.js - 设备检测
 *
 * 微信小程序在 iPad 上 wx.getWindowInfo().windowWidth 被钳制为
 * 手机比例的「绘制宽度」，导致 @media(min-width: 768px) 永远不命中。
 *
 * 解决方案：用 screenWidth（物理像素）进行判断：
 *   iPad 竖屏 768+ / 横屏 1024+，手机宽度通常 ≤ 430
 */

/**
 * 判断是否为平板设备
 * @returns {boolean}
 */
function isTablet() {
  try {
    const info = wx.getWindowInfo();
    return info.screenWidth >= 768;
  } catch (e) {
    const sys = wx.getSystemInfoSync();
    return sys.screenWidth >= 768;
  }
}

/**
 * 判断是否为横屏（用于 iPad 横竖屏不同布局）
 * @returns {boolean}
 */
function isLandscape() {
  try {
    const info = wx.getWindowInfo();
    return info.windowWidth > info.windowHeight;
  } catch (e) {
    const sys = wx.getSystemInfoSync();
    return sys.windowWidth > sys.windowHeight;
  }
}

module.exports = { isTablet, isLandscape };
