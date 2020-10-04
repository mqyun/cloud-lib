const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const cloudWebpackConfig = {
  antdLessModifyVars: {
    // Ant Design 的样式变量，以下指示常用变量，所有变量：https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
    'primary-color': '#1890FF', // 全局主色
    // 'link-color': '#1890ff', // 链接色
    // 'success-color': '#52c41a', // 成功色
    // 'warning-color': '#faad14', // 警告色
    // 'error-color': '#f5222d', // 错误色
    // 'font-size-base': '14px', // 主字号
    // 'heading-color': 'rgba(0, 0, 0, 0.85)', // 标题色
    // 'text-color': 'rgba(0, 0, 0, 0.65)', // 主文本色
    // 'text-color-secondary': 'rgba(0, 0, 0, .45)', // 次文本色
    // 'disabled-color': 'rgba(0, 0, 0, .25)', // 失效色
    // 'border-radius-base': '4px', // 组件/浮层圆角
    // 'border-color-base': '#d9d9d9', // 边框色
    // 'box-shadow-base': '0 2px 8px rgba(0, 0, 0, 0.15)', // 浮层阴影
    hd: '2px',
  },
  cloudXyScssModifyVars: {
    // cloud-xinyi 的样式变量
    'xy-primary-color': '#1890FF', // 全局主色
  },
  alias: {
    '@src': resolveApp('src'),
    '@components': resolveApp('src/components'),
    '@store': resolveApp('src/store'),
    '@services': resolveApp('src/services'),
    '@utils': resolveApp('src/utils'),
    '@cloud-library': resolveApp('@cloud-lib/library'),
  },
};

module.exports = {
  cloudWebpackConfig,
  resolveApp,
};
