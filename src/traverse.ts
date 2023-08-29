import { getType, isFunction, isObject } from '@/utils'
import { DATE_TYPE, FUN_TYPE, REG_TYPE } from '@/const'
import { isObservableArray } from 'mobx'

export function traverseModel<T>(model: T): T {
  // 0, '', undefined, null
  if (!model) return model

  if (
    typeof model === 'string' ||
    typeof model === 'boolean' ||
    typeof model === 'number'
  )
    return model

  const type = getType(model)

  // regexp, function, date
  if ([REG_TYPE, FUN_TYPE, DATE_TYPE].includes(type)) return model

  // array
  // observable array is actually an object(in mobx's none-proxy mode)
  if (Array.isArray(model) || isObservableArray(model)) {
    const arr = [] as typeof model
    for (let i = 0; i < model.length; i++) {
      arr.push(traverseModel(model[i]))
    }
    return arr
  }

  if (!isObject(model)) return model
  const result: Record<any, any> = {}

  // object own properties
  const ownProperties = Object.keys(model)

  // exclude actions
  const stateProperties = ownProperties.filter(
    (_) => !isFunction((model as Record<string, any>)[_])
  )

  stateProperties.forEach((key) => {
    result[key] = traverseModel((model as Record<string, any>)[key])
  })

  const ownDescriptors = Object.getOwnPropertyDescriptors(model)

  const ownGetterKeys = Object.keys(ownDescriptors).filter(
    (key) => ownDescriptors[key].get
  )

  ownGetterKeys.forEach((key) => {
    result[key] = traverseModel((model as Record<string, any>)[key])
  })

  const proto = Object.getPrototypeOf(model)

  if (proto !== null) {
    const protoDescriptors = Object.getOwnPropertyDescriptors(proto)

    const protoGetterKeys = Object.keys(protoDescriptors).filter(
      (key) => !ownGetterKeys.includes(key) && protoDescriptors[key].get
    )

    protoGetterKeys.forEach((key) => {
      result[key] = traverseModel((model as Record<string, any>)[key])
    })
  }

  return result
}
