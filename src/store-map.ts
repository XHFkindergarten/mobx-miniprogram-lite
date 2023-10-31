/**
 * @file This file exports a function that creates a new instance of a Store class for a given model.
 * @packageDocumentation
 */

import { IReactionDisposer, reaction } from 'mobx'
import { getSerializableKeys, traverseModel } from '@/traverse'
import { diffData } from '@/diff'
import { logger } from './log'

/**
 * Represents a model.
 */
export type Model = any

/**
 * Represents a data object.
 */
export type Data = Record<string, any>

/**
 * Represents a listener function for a store.
 */
export interface StoreListener {
  (s: Model): void
}

/**
 * Returns a function that creates a new instance of a Store class for a given model.
 * @returns A function that takes a model and returns a new instance of the Store class.
 */
export const getStoreInstance = (() => {
  // There is no need to consider clearing the storeList & storeInstList
  // because the life cycle of observable data runs throughout the entire application
  const storeList: unknown[] = []
  const storeInstList: Store[] = []

  /**
   * get a unique id of store
   * @param store an observable object
   * @return number
   */
  return (model: unknown): Store => {
    if (typeof model !== 'object') {
      // log error better than app broken.
      console.error(
        '[mobx-miniprogram-lite] store is supposed to be an object, some error may occur!'
      )
      console.error('store: ' + model)
    }
    for (let i = 0; i < storeList.length; i++) {
      if (storeList[i] === model) {
        return storeInstList[i]
      }
    }
    storeList.push(model)
    const id = storeList.length - 1
    const storeInst = new Store({ id, model })
    storeInstList.push(storeInst)
    return storeInst
  }
})()

/**
 * Represents a store class.
 */
class Store {
  /**
   * Creates a new instance of the Store class.
   * @param props An object containing the id and model properties.
   */
  constructor(props: { id: number; model: Model }) {
    this.id = props.id
    this.model = props.model
    this.active()
  }

  /**
   * The id of the store.
   */
  id: number

  /**
   * The model of the store.
   */
  model: Model

  /**
   * An array of listeners for the store.
   */
  listeners: StoreListener[] = []

  /**
   * A function that exposes the store.
   */
  expose: (() => void) | null = null

  /**
   * The latest data of the store.
   */
  latestData: Data = {}

  /**
   * Binds a listener to the store.
   * @param listener The listener function to bind.
   */
  bindListener = (listener: StoreListener) => {
    this.listeners.push(listener)
    // re-active
    if (listener.length === 1 && !this.expose) {
      this.active()
    }
  }

  /**
   * Unbinds a listener from the store.
   * @param listener The listener function to unbind.
   */
  unbindListener = (listener: StoreListener) => {
    this.listeners = this.listeners.filter((_) => _ !== listener)
    // all components that depend on this store are uninstalled
    if (this.listeners.length === 0) {
      this.inactive()
    }
  }

  /**
   * Creates a reaction for the store.
   * @param model The model to create the reaction for.
   * @returns A function that disposes the reaction.
   */
  createReaction(model: Model) {
    // values that can be set into component's data
    const serializableKeys = getSerializableKeys(model)

    const exposeFns: IReactionDisposer[] = []

    /**
     * here we create a listener for each property of the model.
     * the advantage of this is that when the amount of data in a certain property is too large,
     * it will not slow down the calculation time of other data.
     *
     */
    serializableKeys.forEach((key) => {
      const exposeFn = reaction(
        () => {
          // deep walk entire object
          // let mobx collect dependencies by executing in reaciton
          const formated = traverseModel(model[key])
          // collect latest data in case of conditional mount component
          this.latestData[key] = formated

          return formated
        },
        (newValue, oldValue) => {
          const _diff = diffData(newValue, oldValue)
          const diff = Object.entries(_diff).reduce<Data>(
            (prev, [prop, value]) => {
              // append data-path prefix
              const sep = prop.startsWith('[') || !prop ? '' : '.'
              prev[key + sep + prop] = value
              return prev
            },
            {}
          )

          logger.log({
            name: 'diff',
            color: 'orange',
            value: diff
          })

          this.listeners.forEach((listener) => listener.call(null, diff))
        }
      )

      exposeFns.push(exposeFn)
    })

    return () => {
      exposeFns.forEach((fn) => fn?.call(null))
    }
  }

  /**
   * Activates the store.
   */
  active() {
    this.expose = this.createReaction(this.model)
  }

  /**
   * Deactivates the store.
   */
  inactive() {
    this.expose?.()
    this.expose = null
  }
}
