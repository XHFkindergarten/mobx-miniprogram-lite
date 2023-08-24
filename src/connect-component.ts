import { IReactionDisposer, reaction, configure } from 'mobx'
import { traverseModel } from '@/traverse'
import { enableObservable } from './mobx-utils'
import { StoreListener, shimStoreMap } from './shim-store-map'

/**
 * @doc https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/js-support.html#%E6%97%A0%E6%B3%95%E8%A2%AB-Polyfill-%E7%9A%84-API
 */
configure({
  useProxies: 'never'
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

  const listenerMap: Record<string, StoreListener> = {}

  // create listeners
  const replaceAttached = function (this: Instance) {
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

  // @override attached
  function attached(this: Instance) {
    replaceAttached.call(this)
    _attached?.call(this)
  }

  // @override detached
  function detached(this: Instance) {
    Object.entries(store as NonNullable<typeof store>).forEach(
      ([alias, model]) => {
        shimStoreMap.unregisterListener(model, listenerMap[alias])
      }
    )
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
