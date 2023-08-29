import { StoreListener, shimStoreMap } from './shim-store-map'

export const connectPage = <
  TData extends { store: Record<any, any> } & WechatMiniprogram.Page.DataOption,
  TCustom extends WechatMiniprogram.Page.CustomOption
>(
  options: WechatMiniprogram.Page.Options<TData, TCustom>
) => {
  type Instance = WechatMiniprogram.Page.Instance<TData, TCustom>

  const _onLoad = options.onLoad
  const _onUnload = options.onUnload

  const store = options.store

  if (!store || !Object.keys(store)) return options

  const listenerMap: Record<string, StoreListener> = {}

  // create listeners
  const replaceOnLoad = function (this: Instance) {
    let formatedData: Record<string, any> = {}
    Object.entries(store).forEach(([alias, model]: [string, any]) => {
      const reaction = shimStoreMap.createReaction(model, `${alias}.`)
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
      ...formatedData
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

  // if store is passed as a property of options
  // miniprogram will modify store and make behavior unpredictable
  delete options.store

  return Page({
    ...options,
    onLoad,
    onUnload,
    data: {
      ...options.data,
      ...store
    }
  })
}
