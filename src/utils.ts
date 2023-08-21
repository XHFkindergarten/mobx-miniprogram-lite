import { FUN_TYPE } from './const'

export const getType = (item: object) => {
  try {
    return Object.prototype.toString.call(item)
  } catch {
    return ''
  }
}

export function isFunction(item: object): item is Function {
  return getType(item) === FUN_TYPE
}

export function isObject(item: unknown): item is Record<string, any> {
  return typeof item === 'object'
}
