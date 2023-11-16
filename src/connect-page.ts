import { getStoreInstance } from '@/store-map'
import viewManager from '@/view-manager'

import type { Data, Model } from '@/store-map'

/**
 * Connects a WeChat Mini Program page component to a MobX store.
 *
 * @template TData - The type of the page component's data object.
 * @template TStore - The type of the MobX store.
 * @template TCustom - The type of the page component's custom options object.
 *
 * @param options - The options object for the page component.
 * @param options.store - The MobX store to connect to the page component.
 * @param options.onLoad - The `onLoad` lifecycle method for the page component.
 * @param options.onUnload - The `onUnload` lifecycle method for the page component.
 *
 * @returns The connected page component.
 */
export const connectPage = <
  TData extends WechatMiniprogram.Page.DataOption,
  TStore extends Record<string, any>,
  TCustom extends WechatMiniprogram.Page.CustomOption & {
    store: TStore
  }
>(
  options: WechatMiniprogram.Page.Options<TData, TCustom>
) => {
  type Instance = WechatMiniprogram.Page.Instance<
    TData,
    TCustom & {
      __VIEW_ID__: string
    }
  >

  const _onLoad = options.onLoad
  const _onUnload = options.onUnload

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
  const replaceOnLoad = function (this: Instance) {
    // uniq view id
    const viewId = viewManager.createViewId()

    const viewInstanceMeta = viewManager.createViewInstance(instanceMap, viewId)

    this.__VIEW_ID__ = viewId

    let formatedData: Model = {}

    Object.entries(store).forEach(([name, model]: [string, Data]) => {
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

  // @override onLoad
  function onLoad(this: Instance, ...args: any[]) {
    this.store = store
    replaceOnLoad.call(this)
    _onLoad?.apply(this, args as [Record<string, string | undefined>])
  }

  // @override onUnload
  function onUnload(this: Instance, ...args: any[]) {
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
    _onUnload?.apply(this, args as [])
  }

  // miniprogram runtime will deep-clone option-properties, and make mobx's behavior unpredictable
  // mount store in onLoad
  // @ts-ignore
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
