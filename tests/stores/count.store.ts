import { makeAutoObservable } from '@/index'

export class CountStore {
  constructor() {
    makeAutoObservable(this)
  }

  value = 0

  get doubleValue() {
    return this.value * 2
  }

  addValue() {
    this.value += 1
  }
}

export const countStore = new CountStore()
