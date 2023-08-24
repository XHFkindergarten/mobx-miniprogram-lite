import { IReactionDisposer, configure } from 'mobx'
import { enableObservable } from './mobx-utils'
import { traverseModel } from './traverse'
import { StoreListener, shimStoreMap } from './shim-store-map'

/**
 * @doc https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/js-support.html#%E6%97%A0%E6%B3%95%E8%A2%AB-Polyfill-%E7%9A%84-API
 */
configure({
  useProxies: 'never'
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

  const listenerMap: Record<string, StoreListener> = {}

  // create listeners
  const replaceOnLoad = function (this: Instance) {
    let formatedData: Record<string, any> = {}
    Object.entries(store).forEach(([alias, model]: [string, any]) => {
      enableObservable(model)
      const reaction = shimStoreMap.createReaction(model, `store.${alias}.`)
      const listener: StoreListener = ((value: any) => {
        wx.nextTick(() => {
          this.setData(value as Partial<TData>)
        })
      }).bind(this)

      listenerMap[alias] = listener

      shimStoreMap.setListener(model, listener)

      if (reaction.state) formatedData[alias] = reaction.state
    })
    this.setData({
      store: formatedData
    } as Partial<TData>)
  }

  // @override onLoad
  function onLoad(this: Instance, ...args: any[]) {
    replaceOnLoad.call(this)
    _onLoad?.apply(this, args as [Record<string, string | undefined>])
  }

  // @override onUnload
  function onUnload(this: Instance, ...args: any[]) {
    Object.entries(store as NonNullable<typeof store>).forEach(
      ([alias, model]) => {
        shimStoreMap.unregisterListener(model, listenerMap[alias])
      }
    )
    _onUnload?.call(this)
  }

  return Page({
    ...options,
    onLoad,
    onUnload
  })
}
