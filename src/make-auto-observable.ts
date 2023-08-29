import {
  AnnotationsMap,
  CreateObservableOptions,
  makeAutoObservable as _makeAutoObservable,
  action
} from 'mobx'
import { isFunction } from './utils'

type NoInfer<T> = [T][T extends any ? 0 : never]
type MakeObservableOptions = Omit<CreateObservableOptions, 'proxy'>

const CONSTRUCTOR = 'constructor'

export function makeAutoObservable<
  T extends object,
  AdditionalKeys extends PropertyKey = never
>(
  target: T,
  overrides?: AnnotationsMap<T, NoInfer<AdditionalKeys>>,
  options?: MakeObservableOptions
): T {
  type Descriptors = {
    [x: string]: PropertyDescriptor
  }

  // wrap actions
  const ownDescriptors = Object.getOwnPropertyDescriptors(target)

  function traverseDescriptor(descriptors: Descriptors) {
    for (const key of Object.keys(descriptors)) {
      if (key === CONSTRUCTOR) continue
      if (descriptors[key].value && isFunction(descriptors[key].value)) {
        Object.defineProperty(target, key, {
          ...descriptors[key],
          value: action(descriptors[key].value)
        })
      }
    }
  }

  traverseDescriptor(ownDescriptors)

  const proto = Object.getPrototypeOf(target)

  if (proto?.constructor !== Object) {
    const protoDescriptors = Object.getOwnPropertyDescriptors(proto)
    traverseDescriptor(protoDescriptors)
  }

  _makeAutoObservable(target, overrides, options)

  return target
}
