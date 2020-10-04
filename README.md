# cloud-lib

> webpack 配置，通用工具组件等

### 结构

```md
@cloud-lib
├── config
│ ├── babel.config.js # babel 配置，项目引入
│ ├── cloud.config.js # 一些自定义配置
│ ├── eslintrc.config.js # eslint 配置，项目引入
│ ├── webpack.config.js # webpack 配置
├── library
│ ├── components # 通用组件
│ │ ├── RouteRender # 通过路由配置渲染生成路由组建  
│ │ ├── index.ts # 组件导出文件
│ ├── utils # 工具包
│ │ ├── store.ts # 一些 rematch store 的方法
│ │ ├── xyLoadable.js # 动态加载路由组件和 rematch model 的方法
├── build.sh # 构建脚本
├── README.md
```

### 预定义 webpack alias

- @src: src
- @components: src/components
- @store: src/store
- @services: src/services
- @utils: src/utils
- @cloud-library: @cloud-lib/library

### 项目自定义配置

#### 在项目根目录新建 cloud.config.js

```js
module.exports = {
  // 端口号
  port: 3000,

  // antd的暗黑模式和紧凑模式配置
  antd: {
    // dark: true, // 开启暗黑模式
    // compact: true, // 开启紧凑模式
  }

  // antd主题样式配置
  antdLessModifyVars: {},

  // cloud-xinyi主题样式配置
  cloudXyScssModifyVars: {},

  // 代理配置，webpack-dev-server proxy
  proxy: {},

  // webpack别名配置
  alias: {},

  // 是否需要px转rem，默认false
  px2rem: false,

  // webpack自定义配置
  webpackConfig: {},
};
```
