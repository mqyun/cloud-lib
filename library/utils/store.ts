import { RematchDispatch } from '@rematch/core';

interface IRematchModel {
  name: string;
  state: {
    [key: string]: any;
  };
  reducers?: any;
  effects?: any;
  [other: string]: any;
}

/**
 * @description rematch 模块初始化
 */
export function createModel<T extends IRematchModel>(
  modelInfo: T,
): T & {
  reducers: {
    RESET_STATE: RematchDispatch;
  };
} {
  type IState = typeof modelInfo.state;
  return {
    ...modelInfo,
    reducers: {
      ...(modelInfo.reducers || {}),
      RESET_STATE(state: IState) {
        state = modelInfo.state;
        return state;
      },
    },
  };
}
