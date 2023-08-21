import { IReactionDisposer, reaction } from 'mobx'
import { traverseModel } from '@/core'

export const connectComponent = <
  TData extends WechatMiniprogram.Component.DataOption,
  TProperty extends WechatMiniprogram.Component.PropertyOption,
  TMethod extends WechatMiniprogram.Component.MethodOption,
  TCustomInstanceProperty extends Record<string, any> = {},
  TIsPage extends boolean = false
>(
  store: Record<string, any>,
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

  const attached = options.lifetimes?.attached
  const detached = options.lifetimes?.detached

  const exposeFuncs: IReactionDisposer[] = []

  const replaceAttached = function (this: Instance) {
    Object.entries(store).forEach(([alias, model]) => {
      const expose = reaction(
        () => {
          const item = traverseModel(model)
          // @ts-ignore
          this.setData({
            // @TODO: 兼容 model 类型
            [alias]: item
          })
        },
        () => {}
      )
      exposeFuncs.push(expose)
    })
  }

  options.lifetimes = {
    ...options.lifetimes,
    attached() {
      attached?.call(this)
      // @ts-ignore
      replaceAttached.call(this)
    },
    detached() {
      detached?.call(this)
      exposeFuncs.forEach((fun) => fun.call(null))
    }
  }

  return Component({
    ...options
  })
}
