import { reaction, type IReactionDisposer } from 'mobx'
import { traverseModel } from './traverse'
import { diffData } from './diff'

type Store = any

export interface StoreListener {
  (s: Store): void
}

interface ReactionItem {
  state: any
  expose: IReactionDisposer | null
}

class ShimStoreMap {
  stores: Store[] = []

  storeListeners: StoreListener[][] = []

  reactions: ReactionItem[] = []

  getStoreIndex(store: Store, create = false): number {
    let index = this.stores.indexOf(store)
    if (index === -1) {
      if (create) {
        this.stores.push(store)
        this.storeListeners.push([])
        this.reactions.push({
          state: null,
          expose: null
        })
        index = this.stores.length - 1
      } else {
        return index
      }
    }
    return index
  }

  setListener(store: Store, listener: StoreListener) {
    const index = this.getStoreIndex(store, true)
    this.storeListeners[index].push(listener)
  }

  getListeners(store: Store): StoreListener[] | undefined {
    const index = this.getStoreIndex(store)
    return this.storeListeners[index]
  }

  createReaction(store: Store, prefix: string) {
    const index = this.getStoreIndex(store, true)

    const reactionItem = this.reactions[index]

    const listeners = this.storeListeners[index]

    let formatedStore
    if (!reactionItem.expose) {
      reactionItem.expose = reaction(
        () => {
          formatedStore = traverseModel(store)
          return formatedStore
        },
        (value, oldValue) => {
          const diff = diffData(value, oldValue)
          const diffWithPrefix = Object.entries(diff).reduce<
            Record<string, any>
          >((prev, [key, value]) => {
            prev[prefix + key] = value
            return prev
          }, {})
          listeners.forEach((listener) => listener(diffWithPrefix))
        }
      )
    }
    if (formatedStore) reactionItem.state = formatedStore
    return reactionItem
  }

  getReaction = (store: Store): ReactionItem | undefined => {
    const index = this.getStoreIndex(store)
    if (index === -1) return undefined
    return this.reactions[index]
  }

  unregisterListener = (store: Store, listener: StoreListener) => {
    if (!store || !listener) return
    const reaction = this.getReaction(store)
    const listeners = this.getListeners(store)
    if (!listeners?.length) return
    const targetListenerIndex = listeners.indexOf(listener)
    if (targetListenerIndex < 0) return
    listeners.splice(targetListenerIndex, 1)
    if (listeners.length === 0 && reaction) {
      reaction.expose?.()
      reaction.expose = null
      reaction.state = null
    }
  }
}

export const shimStoreMap = new ShimStoreMap()
