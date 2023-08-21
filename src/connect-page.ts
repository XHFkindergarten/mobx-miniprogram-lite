import { IReactionDisposer, reaction, configure } from 'mobx'
import { enableObservable } from './mobx-utils'
import { traverseModel } from './core'

/**
 * @doc https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/js-support.html#%E6%97%A0%E6%B3%95%E8%A2%AB-Polyfill-%E7%9A%84-API
 */
configure({
  useProxies: 'ifavailable'
})

export const connectPage = <
  TData extends { store: Record<any, any> } & WechatMiniprogram.Page.DataOption,
  TCustom extends WechatMiniprogram.Page.CustomOption
>(
  options: WechatMiniprogram.Page.Options<TData, TCustom>
) => {
  type Instance = WechatMiniprogram.Page.Instance<TData, TCustom>

  const _onLoad = options.onLoad
  const _onUnload = options.onUnload

  const store = options.data?.store

  if (!store || !Object.keys(store)) return options

  const exposeFuncs: IReactionDisposer[] = []

  const replaceOnLoad = function (this: Instance) {
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

  // @override onLoad
  function onLoad(this: Instance, ...args: any[]) {
    replaceOnLoad.call(this)
    _onLoad?.apply(this, args as [Record<string, string | undefined>])
  }

  // @override onUnload
  function onUnload(this: Instance, ...args: any[]) {
    exposeFuncs.forEach((fun) => fun.call(null))
    _onUnload?.apply(this)
  }

  return Page({
    ...options,
    onLoad,
    onUnload
  })
}
