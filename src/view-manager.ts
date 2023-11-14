import type { StoreListener } from './store-map'

/**
 * An object representing the listeners of a view instance.
 */
export interface InstanceMeta {
  listeners: StoreListener[]
}

/**
 * An object representing the map of view instances.
 */
export interface InstanceMetaMap {
  [key: string]: InstanceMeta
}

/**
 * Creates an empty view instance map.
 * @returns An empty view instance map.
 */
function createViewInstanceMap() {
  return {} as InstanceMetaMap
}

/**
 * Creates a new view instance with the given view ID and adds it to the view instance map.
 * @param map - The view instance map.
 * @param viewId - The ID of the new view instance.
 * @returns The newly created view instance.
 */
function createViewInstance(map: InstanceMetaMap, viewId: string) {
  const meta: InstanceMeta = { listeners: [] }
  map[viewId] = meta
  return meta
}

/**
 * A function that generates a unique view ID.
 * @returns A unique view ID.
 */
export const createViewId = (() => {
  let id = 0
  return () => id++ + ''
})()

export default {
  createViewInstanceMap,
  createViewInstance,
  createViewId
}
