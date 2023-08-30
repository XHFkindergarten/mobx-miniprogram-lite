import { FUN_TYPE } from './const'

export const getType = (item: object) => Object.prototype.toString.call(item)

export function isFunction(item: object): item is Function {
  if (!item) return false
  return getType(item) === FUN_TYPE
}

export function isObject(item: unknown): item is Record<string, any> {
  return Boolean(item && typeof item === 'object')
}
