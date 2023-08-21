import { action, isAction, isObservable, makeAutoObservable } from 'mobx'
import { isFunction } from '@/utils'

const CONSTRUCTOR = 'constructor'

export const enableObservable = (model: Record<string, any>) => {
  const ownKeys = Object.getOwnPropertyNames(model)

  for (const key of ownKeys) {
    if (isFunction(model[key]) && !isAction(model[key])) {
      model[key] = action(model[key])
    }
  }

  const prototype = Object.getPrototypeOf(model)

  const protoDescriptors = Object.getOwnPropertyDescriptors(prototype)

  for (const key in protoDescriptors) {
    if (key === CONSTRUCTOR) continue
    const item = protoDescriptors[key]
    if (item.value && isFunction(item.value) && !isAction(item.value)) {
      prototype[key] = action(prototype[key])
    }
  }

  if (!isObservable(model)) {
    makeAutoObservable(model)
  }
}

export { runInAction } from 'mobx'
