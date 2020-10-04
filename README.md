# cloud-lib

> webpack 配置，通用工具组件等

## 结构

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
├── README.md
```

## 预定义 webpack alias

- @src: src
- @components: src/components
- @store: src/store
- @services: src/services
- @utils: src/utils
- @cloud-library: @cloud-lib/library

## 项目自定义配置

### 在项目根目录新建 cloud.config.js

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

## 路由配置文件

| 属性      | 说明                                                                                 | 类型               | 默认值 | 示例                                                                           |
| --------- | ------------------------------------------------------------------------------------ | ------------------ | ------ | ------------------------------------------------------------------------------ |
| path      | 路由地址                                                                             | string \| array    | -      | '/login'                                                                       |
| title     | 标题（一般用于面包屑）                                                               | string \| array    | -      | '登录'                                                                         |
| exact     | 是否完全匹配                                                                         | boolean            | -      | true                                                                           |
| component | 路由根组件                                                                           | () => import       | -      | <code>() => import(/\* webpackChunkName: "login" \*/'@src/views/Login')</code> |
| model     | 动态加载的<code>rematch model</code>                                                 | () => import \| [] | -      | <code>() => import(/\* webpackChunkName: "login" \*/'@src/store/login')</code> |
| props     | 当不是重定向路由时为组件的 <code>props</code>，否则为重定向路由的 <code>props</code> | object             | -      | -                                                                              |
| redirect  | 是否是重定向路由                                                                     | boolean            | -      | true                                                                           |

## 路由配置

- 子路由的 <code>path</code> 需要在上级路由的 <code>path</code> 后增加相对路径。例如用户列表和新建用户的路由 <code>path</code> 需要配置为：<code>/user/list</code> 和 <code>/user/list/add</code>。
- 当 <code>path</code> 配置为 <code>array</code> 类型时，可以把 <code>title</code> 同样配置为 <code>array</code> 类型，此时面包屑在读取配置时，不同的路径下会有不同的面包屑标题显示。
- <code>model</code> 可以配置为 <code>array</code> 类型，应用场景主要为该路由依赖多个 <code>rematch model</code> 。

## 配置示例

```js
export default [
  {
    path: '/login',
    title: '登录',
    exact: true,
    component: () => import(/* webpackChunkName: "login" */ '@src/views/Login'),
    model: () => import(/* webpackChunkName: "login" */ '@src/store/login'),
  },
  {
    redirect: true,
    props: {
      from: '/',
      to: '/login',
      exact: true,
    },
  },
];
```

## 渲染路由

```js
import topRouter from '@src/config/router/top.router';
import { RouteRender } from '@cloud-library/components';

<RouteRender config={topRouter} />;
```
