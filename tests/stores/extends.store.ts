import { action, computed, makeObservable, observable } from '@/index'

class HyperClass {
  constructor() {
    makeObservable(this, {
      hyperValue: observable,
      doubleHyperValue: computed,
      updateHyperValue: action
    })
  }

  hyperValue = 0

  get doubleHyperValue() {
    return this.hyperValue * 2
  }

  updateHyperValue() {
    this.hyperValue++
  }
}

class SuperClass extends HyperClass {
  constructor() {
    super()
    makeObservable(this, {
      superValue: observable,
      doubleSuperValue: computed,
      decHyperValue: computed,
      decDoubleHyperValue: computed,
      updateSuperValue: action
    })
  }

  superValue = 10

  get doubleSuperValue() {
    return this.superValue * 2
  }

  get decHyperValue() {
    return this.hyperValue + 1
  }

  get decDoubleHyperValue() {
    return this.doubleHyperValue + 1
  }

  updateSuperValue() {
    this.superValue++
  }
}

class SubClass extends SuperClass {
  constructor() {
    super()
    makeObservable(this, {
      value: observable,
      doubleValue: computed,
      updateValue: action
    })
  }

  value = 100

  get doubleValue() {
    return this.value * 2
  }

  updateValue() {
    this.value++
  }
}

export const extendsStore = new SubClass()
