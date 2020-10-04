import { ModelConfig, ModelEffects } from '@rematch/core';

type ExtractRematchDispatchersFromEffectsObjectAsBoolean<
  effects extends ModelEffects<any>
> = {
  [effectKey in keyof effects]: boolean;
};

type ExtractRematchDispatchersFromEffects<
  effects extends ModelConfig['effects']
> = effects extends (...args: any[]) => infer R
  ? R extends ModelEffects<any>
    ? ExtractRematchDispatchersFromEffectsObjectAsBoolean<R>
    : {}
  : effects extends ModelEffects<any>
  ? ExtractRematchDispatchersFromEffectsObjectAsBoolean<effects>
  : {};

type IRematchEffects<
  M extends ModelConfig
> = ExtractRematchDispatchersFromEffects<M['effects']>;

type ILoading<M> = {
  [modelKey in keyof M]: M[modelKey] extends ModelConfig
    ? IRematchEffects<M[modelKey]>
    : never;
};

/**
 * @description rematch loading 类型声明
 */
export type IPluginLoading<M> = {
  loading: {
    global: boolean;
    models: {
      [key in keyof M]: boolean;
    };
    effects: ILoading<M>;
  };
};
