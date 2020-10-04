import React from 'react';
import Loadable from 'react-loadable';

import store from '@store';
import { Spin } from 'antd';

const pageLoading = ({ error }) => {
  if (error) {
    console.log('xy loadable error：');
    console.log(error);
  }
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Spin />
    </div>
  );
};

const fullpageLoading = ({ error }) => {
  if (error) {
    console.log('xy loadable error：');
    console.log(error);
  }
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Spin />
    </div>
  );
};

const noLoading = ({ error }) => {
  if (error) {
    console.log('xy loadable error：');
    console.log(error);
  }
  return <div />;
};

/**
 * @description react-loadable异步加载组件，redux model动态注入
 * @param {String} importComponent 组件的路径，基于src的路径，例： 'views/Login/Login'
 * @param {JSON} param2 其他参数
 * @param {String|Array} param2.model redux model路径，基于src的路径，例：'store/login'
 * @param {String} param2.loadingType loading类型，full(全屏)|page(单页)，默认full
 */
const xyLoadable = (
  importComponent,
  { model, loadingType = 'page', props } = {},
) => {
  let loading = null;
  switch (loadingType) {
    case 'page':
      loading = pageLoading;
      break;
    case 'full':
      loading = fullpageLoading;
      break;
    default:
      loading = noLoading;
  }
  let loaderModels = {};
  if (model) {
    let models = model;
    // redux model 传入类型只能是 function 或 array
    if (typeof model !== 'function' && !(model instanceof Array)) {
      console.error('model传入类型错误');
    }
    if (typeof model === 'function') {
      models = [model];
    }
    models.forEach(async (modelItem, index) => {
      loaderModels[index] = modelItem;
    });
  }
  const componentProps = props || {};
  return Loadable.Map({
    loader: {
      Component: importComponent,
      ...loaderModels,
    },
    render(loaded, props) {
      for (let [key] of Object.entries(loaderModels)) {
        const { default: modelModule } = loaded[key];
        if (modelModule instanceof Array) {
          modelModule.forEach((storeModel) => store.model(storeModel));
        } else {
          store.model(modelModule);
        }
      }
      const {
        Component: { default: component },
      } = loaded;
      let Component = component;
      return <Component {...componentProps} {...props} />;
    },
    loading,
  });
};

export default xyLoadable;
