import { Model, StoreListener, getStoreInstance } from '@/store-map'

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
  > & {
    store: TStore
  }
) => {
  type Instance = WechatMiniprogram.Component.Instance<
    TData,
    TProperty,
    TMethod,
    TCustomInstanceProperty & {
      store: TStore
    },
    TIsPage
  >

  const _attached = options.lifetimes?.attached
  const _detached = options.lifetimes?.detached
  const _created = options.lifetimes?.created

  const store = options.store

  function listenerFactory(this: Instance, prefix: string, _value: any) {
    // nothing changed
    if (!Object.keys(_value).length) return
    const value = Object.entries(_value).reduce<Model>((prev, [key, value]) => {
      prev[prefix + key] = value
      return prev
    }, {})
    wx.nextTick(() => {
      this.setData(value as Partial<TData>)
    })
  }

  const listeners: StoreListener[] = []

  // create listeners
  const replaceAttached = function (this: Instance) {
    let formatedData: Record<string, any> = {}

    Object.entries(store as {}).forEach(([name, model]: [string, any]) => {
      const listener = listenerFactory.bind(this, name + '.')
      const storeInst = getStoreInstance(model)
      storeInst.bindListener(listener)
      listeners.push(listener)
      formatedData[name] = storeInst.latestData
    })

    // initial setData
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
      ([name, model]) => {
        const storeInst = getStoreInstance(model)
        listeners.forEach((listener) => storeInst.unbindListener(listener))
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
