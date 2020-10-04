import React, { useState, useEffect } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import xyLoadable from '../../utils/xyLoadable';
import { IRouterConfig } from '../../declaration/global-declaration';

// 扁平化路由配置
const mapDataGetList = (routerData: IRouterConfig[]): IRouterConfig[] => {
  const returnList = [];
  function mapData(data, list) {
    if (data?.length > 0) {
      data.forEach((item) => {
        list.push(item);
        const itemChildren = item.children;
        if (itemChildren?.length > 0) {
          mapData(itemChildren, list);
        }
        return;
      });
    }
  }
  mapData(routerData, returnList);

  return returnList;
};

interface IProps {
  config: IRouterConfig[];
}

const RouteRender = (props: IProps) => {
  const { config } = props;
  const [routerList, setRouterList] = useState<IRouterConfig[]>([]);

  useEffect(() => {
    setRouterList(mapDataGetList(config));
  }, [config]);

  return routerList instanceof Array && routerList.length > 0 ? (
    <Switch>
      {routerList.map((item, index) => {
        if (item.redirect) {
          // 重定向路由
          // @ts-ignore
          return <Redirect {...item.props} key={item.path || index} />;
        }
        if (!item.component) {
          // 无路由组件
          return null;
        }
        if (item.path instanceof Array) {
          return item.path.map((pathItem) => (
            <Route
              path={pathItem}
              exact={item.exact}
              component={xyLoadable(item.component, {
                model: item.model,
                loadingType: item.loadingType || 'page',
                props: item.props,
              })}
              key={pathItem}
            />
          ));
        } else if (typeof item.path === 'string') {
          return (
            <Route
              path={item.path}
              exact={item.exact}
              component={xyLoadable(item.component, {
                model: item.model,
                loadingType: item.loadingType || 'page',
                props: item.props,
              })}
              key={item.path}
            />
          );
        }
        return null;
      })}
    </Switch>
  ) : null;
};

export default RouteRender;
