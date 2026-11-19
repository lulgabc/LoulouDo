/**
 * Expo 动态配置：本地开发不设置 baseUrl；
 * GitHub Pages 构建时通过 EXPO_BASE_URL=/LoulouDo 注入子路径。
 */
module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...(config.experiments ?? {}),
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
