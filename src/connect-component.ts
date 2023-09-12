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
    TCustomInstanceProperty & { store: TStore },
    TIsPage
  > & { store: TStore }
) => {
  type Instance = WechatMiniprogram.Component.Instance<
    TData,
    TProperty,
    TMethod,
    TCustomInstanceProperty & { store: TStore },
    TIsPage
  >

  const _attached = options.lifetimes?.attached
  const _detached = options.lifetimes?.detached
  const _created = options.lifetimes?.created

  const store = options.store

  const listenerMap: Record<string, StoreListener> = {}

  // create listeners
  const replaceAttached = function (this: Instance) {
    let formatedData: Record<string, any> = {}
    Object.entries(store as Record<string, any>).forEach(
      ([alias, model]: [string, any]) => {
        const reaction = shimStoreMap.createReaction(model, `${alias}.`)
        const listener: StoreListener = ((value: any) => {
          // nothing changed
          if (!Object.keys(value).length) return
          wx.nextTick(() => {
            this.setData(value as Partial<TData>)
          })
        }).bind(this)
        listenerMap[alias] = listener
        shimStoreMap.setListener(model, listener)
        if (reaction.state) formatedData[alias] = reaction.state
      }
    )
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

  // override created
  function created(this: Instance) {
    this.store = store as TStore
    _created?.call(this)
  }

  options.lifetimes = {
    ...options.lifetimes,
    attached,
    detached,
    created
  }

  // @ts-ignore
  // miniprogram runtime will deep-clone option-properties, and make mobx's behavior unpredictable
  // mount store in lifetimes.created
  delete options.store

  return Component({
    ...options,
    data: {
      ...options.data,
      ...store
    }
  })
}
