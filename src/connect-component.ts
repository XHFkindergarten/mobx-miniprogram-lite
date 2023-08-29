import { IReactionDisposer, reaction, configure } from 'mobx'
import { traverseModel } from '@/traverse'
import { enableObservable } from './mobx-utils'
import { StoreListener, shimStoreMap } from './shim-store-map'

export const connectComponent = <
  TData extends WechatMiniprogram.Component.DataOption,
  TProperty extends WechatMiniprogram.Component.PropertyOption,
  TMethod extends WechatMiniprogram.Component.MethodOption,
  TCustomInstanceProperty extends Record<string, any> = {},
  TIsPage extends boolean = false,
  TStore = Record<string, any>
>(
  options: WechatMiniprogram.Component.Options<
    TData,
    TProperty,
    TMethod,
    TCustomInstanceProperty,
    TIsPage
  > & { store: TStore }
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

  const store = options.store

  if (!store || !Object.keys(store)) return options

  const listenerMap: Record<string, StoreListener> = {}

  // create listeners
  const replaceAttached = function (this: Instance) {
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

  // @ts-ignore
  // if store is passed as a property of options
  // miniprogram will modify store and make behavior unpredictable
  delete options.store

  return Component({
    ...options,
    data: {
      ...options.data,
      ...store
    }
  })
}
