export const getType = (item: object) => Object.prototype.toString.call(item)

export function isObject(item: unknown): item is Record<string, any> {
  return Boolean(item && typeof item === 'object')
}
