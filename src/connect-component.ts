import { getStoreInstance } from '@/store-map'
import viewManager from '@/view-manager'

import type { Model } from '@/store-map'

/**
 * Connects a MobX store to a WeChat MiniProgram component.
 * @template TData - The type of the component data.
 * @template TProperty - The type of the component properties.
 * @template TMethod - The type of the component methods.
 * @template TCustomInstanceProperty - The type of the custom instance properties.
 * @template TIsPage - A boolean indicating whether the component is a page.
 * @template TStore - The type of the MobX store.
 * @param {WechatMiniprogram.Component.Options<TData, TProperty, TMethod, TCustomInstanceProperty & { store: TStore }, TIsPage> & { store: TStore }} options - The options for the component.
 * @returns {WechatMiniprogram.Component.TrivialInstance} - The connected component.
 */
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
      __VIEW_ID__: string
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

  const instanceMap = viewManager.createViewInstanceMap()

  // create listeners
  const replaceAttached = function (this: Instance) {
    // uniq view id
    const viewId = viewManager.createViewId()

    const viewInstanceMeta = viewManager.createViewInstance(instanceMap, viewId)

    this.__VIEW_ID__ = viewId

    let formatedData: Record<string, any> = {}

    Object.entries(store as {}).forEach(([name, model]: [string, any]) => {
      const listener = listenerFactory.bind(this, name + '.')
      const storeInst = getStoreInstance(model)
      storeInst.bindListener(listener)
      viewInstanceMeta.listeners.push(listener)
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
    const viewId = this.__VIEW_ID__
    const listeners = instanceMap[viewId]?.listeners ?? []
    if (listeners.length) {
      Object.entries(store as NonNullable<typeof store>).forEach(
        ([name, model]) => {
          const storeInst = getStoreInstance(model)
          listeners.forEach((listener) => storeInst.unbindListener(listener))
        }
      )
    }
    // viewId will never be reused
    if (instanceMap[viewId]) delete instanceMap[viewId]
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
