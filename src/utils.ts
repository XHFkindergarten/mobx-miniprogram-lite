/**
 * Returns the type of the given item as a string.
 *
 * @param item - The item to get the type of.
 * @returns A string representing the type of the given item.
 */
export const getType = (item: object) => Object.prototype.toString.call(item)

/**
 * Determines whether the given item is an object.
 *
 * @param item - The item to check.
 * @returns `true` if the item is an object, otherwise `false`.
 */
export function isObject(item: unknown): item is Record<string, any> {
  return Boolean(item && typeof item === 'object')
}
