import { getType, isObject } from '@/utils'
import { DATE_TYPE, FUN_TYPE, REG_TYPE } from '@/const'
import { isObservableArray } from 'mobx'

export function traverseModel<T>(model: T, seen = new Set<unknown>()): T {
  // 0, '', undefined, null
  if (!model) return model

  if (
    typeof model === 'string' ||
    typeof model === 'boolean' ||
    typeof model === 'number'
  )
    return model

  if (seen.has(model)) return model

  seen.add(model)

  const type = getType(model)

  // regexp, function, date
  if ([REG_TYPE, FUN_TYPE, DATE_TYPE].includes(type)) return model

  // array
  // observable array is actually an object(in mobx's none-proxy mode)
  if (Array.isArray(model) || isObservableArray(model)) {
    const arr = [] as typeof model
    for (let i = 0; i < model.length; i++) {
      arr.push(traverseModel(model[i], seen))
    }
    return arr
  }

  if (!isObject(model)) return model
  const result: Record<any, any> = {}

  // dfs serializable properties
  getSerializableKeys(model).forEach((key) => {
    result[key] = traverseModel((model as Record<string, any>)[key], seen)
  })

  return result
}

// get keys that can be set into a mp component's data
export function getSerializableKeys(model: Record<string, any>) {
  // function/action prop
  const excludeKeys: string[] = []

  // own prop
  const propKeys: string[] = []

  // computed prop
  const computedKeys: string[] = []

  const ownDescriptors = Object.getOwnPropertyDescriptors(model)

  for (const key in ownDescriptors) {
    if (typeof model[key] === 'function') {
      excludeKeys.push(key)
    } else if (ownDescriptors[key].get) {
      computedKeys.push(key)
    } else {
      propKeys.push(key)
    }
  }

  return computedKeys.concat(propKeys)
}
