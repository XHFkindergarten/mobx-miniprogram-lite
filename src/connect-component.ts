import { IReactionDisposer, reaction, configure } from 'mobx'
import { traverseModel } from '@/core'
import { enableObservable } from './mobx-utils'

/**
 * @doc https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/js-support.html#%E6%97%A0%E6%B3%95%E8%A2%AB-Polyfill-%E7%9A%84-API
 */
configure({
  useProxies: 'ifavailable'
})

export const connectComponent = <
  TData extends {
    store: Record<any, any>
  } & WechatMiniprogram.Component.DataOption,
  TProperty extends WechatMiniprogram.Component.PropertyOption,
  TMethod extends WechatMiniprogram.Component.MethodOption,
  TCustomInstanceProperty extends Record<string, any> = {},
  TIsPage extends boolean = false
>(
  options: WechatMiniprogram.Component.Options<
    TData,
    TProperty,
    TMethod,
    TCustomInstanceProperty,
    TIsPage
  >
) => {
  type Instance = WechatMiniprogram.Component.Instance<
    TData,
    TProperty,
    TMethod,
    TCustomInstanceProperty,
    TIsPage
  >

  const _attached = options.lifetimes?.attached
  const _detached = options.lifetimes?.detached

  const store = options.data?.store
  if (!store || !Object.keys(store)) return options

  const exposeFuncs: IReactionDisposer[] = []

  const replaceAttached = function (this: Instance) {
    Object.entries(store).forEach(([alias, model]: [string, any]) => {
      enableObservable(model)
      const expose = reaction(
        () => {
          const item = traverseModel(model)
          this.setData({
            store: {
              [alias]: item
            }
          } as Partial<TData>)
        },
        () => {}
      )
      exposeFuncs.push(expose)
    })
  }

  // @override attached
  function attached(this: Instance) {
    replaceAttached.call(this)
    _attached?.call(this)
  }

  // @override detached
  function detached(this: Instance) {
    exposeFuncs.forEach((fun) => fun.call(null))
    _detached?.call(this)
  }

  options.lifetimes = {
    ...options.lifetimes,
    attached,
    detached
  }

  return Component({
    ...options
  })
}
