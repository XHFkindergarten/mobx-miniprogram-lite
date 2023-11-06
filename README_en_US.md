# <img style="width:40px;" alt="MOBX" src="https://mobx.js.org/assets/mobx.png"> mobx-miniprogram-lite

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/XHFkindergarten/mobx-miniprogram-lite/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/mobx-miniprogram-lite.svg?style=flat)](https://www.npmjs.com/package/mobx-miniprogram-lite) [![test coverage](https://img.shields.io/badge/coverage-95.68%25-green)]()

<p style="text-align:center;">
   <a href="./README.md">简体中文</a> |
   <span>English</span> |
   <a href="https://developers.weixin.qq.com/s/GNZlomm87hM3">Example</a>
</p>

- Based on [mobx](https://zh.mobx.js.org/README.html) to implement in-depth data monitoring and responsive update of views.
- Support [computed](https://mobx.js.org/computeds.html) derived calculations.
- Public status management.
- Write the logic layer of the mini program based on native JS to obtain a better code organization structure.

## Install

```
npm install mobx-miniprogram-lite
```

## Quick Start

### 1. Define observable data

```typescript
import { observable } from 'mobx-miniprogram-lite'

export const countStore = observable({
  // Observed data
  value: 0,
  // computed properties
  get double() {
    return this.value * 2
  },
  // Method to modify data
  addValue() {
    this.value++
  }
})
```

### 2. Bind data to `Page/Component`

- Page page instance

```typescript
import { connectPage } from 'mobx-miniprogram-lite'
import { countStore } from './count'

connectPage({
  store: {
    count: countStore
  }
})
```

- Component component instance

```typescript
import { connectComponent } from 'mobx-miniprogram-lite'
import { countStore } from './count'

connectComponent({
  store: {
    count: countStore
  }
})
```

### 3. Rendering and interaction

- Call data methods in component methods

```typescript
import { connectPage } from 'mobx-miniprogram-lite'
import { countStore } from './count'

connectPage({
  store: {
    count: countStore
  },
  bindTapAdd() {
    this.store.count.addValue()
  }
})
```

- Bind data and interaction events in WXML

```html
<view> value: {{count.value}} </view>
<view> value * 2: {{count.doubleValue}} </view>
<view bindtap="bindTapAdd"> click me to add value </view>
```

This completes a simple implementation of a digital accumulator.

## Source of inspiration

- [Westore - 小程序项目分层架构](https://github.com/Tencent/westore)

## Code example

https://developers.weixin.qq.com/s/7U4VcFmN7pKx

## Core idea

- observable
  - Observed data, mobx can trigger automatic response only when the modified data is in an observable state.
- action
  - Data modification needs to be completed in the action function.
- computed
  - Data calculated from the observed data will be automatically updated as the observed data changes.

## Documentation

### Create observable data

- [observable](https://mobx.js.org/observable-state.html#observable): Make a data structure observable.

The data and its deep data will become observable, the getter functions will become computed data, and the function attributes will become action functions.

```typescript
import { observable } from 'mobx-miniprogram-lite'

// observable array
const todos = observable([
  { title: 'Spoil tea', completed: true },
  { title: 'Make coffee', completed: false }
])

// observable object
const counter = observable({
  value: 0,
  get double() {
    return this.value * 2
  },
  addValue() {
    this.value++
  }
})
```

- [makeObservable](https://mobx.js.org/observable-state.html#makeobservable)

It has the same effect as observable, but works on class data. The first parameter is an instance of the class, and the second parameter is used to perform type assertions on the attributes of the class.

```typescript
import {
  makeObservable,
  observable,
  computed,
  action,
  flow
} from 'mobx-miniprogram-lite'

class Doubler {
  value

  constructor(value) {
    makeObservable(this, {
      value: observable,
      double: computed,
      increment: action
    })
    this.value = value
  }

  get double() {
    return this.value * 2
  }

  increment() {
    this.value++
  }
}

// For inheritance scenarios, only makeObservable API can be used
class SubClass extends Doubler {
  constructor(value) {
    super(value)
    makeObservable(this, {
      triple: computed
    })
  }

  // Use the value from the parent class
  get triple() {
    return this.value * 3
  }
}
```

- [makeAutoObservable](https://mobx.js.org/observable-state.html#makeautoobservable)

makeAutoObservable is the automatic inference mode of makeObservable, which automatically infers `observable`, `action`, `computed` and other types according to the type of the attribute. But relatively speaking, there are certain restrictions, such as it cannot be used in subclasses.

```typescript
import { makeAutoObservable } from 'mobx-miniprogram-lite'

class Doubler {
  value

  readonly description = '静态字段'

  constructor(value) {
    makeAutoObservable(
      this,
      // like makeObservable, the second parameter override supports specifying the field type
      {
        // mark the description field as unobservable
        description: false
      }
    )
    this.value = value
  }

  get double() {
    return this.value * 2
  }

  increment() {
    this.value++
  }

  async fetch() {
    const response = await fetch('/api/value')
    this.value = response.json()
  }
}
```

### update data

> [Updating state using actions](https://mobx.js.org/actions.html)

When we want to update a data observed by mobx, this operation should be done through **`action`** (this is not required for mobx, but it is highly recommended). You can see similar concepts when using any state management library. The benefits of this are:

1. Actions will be executed in the _transaction_ of mobx. When multiple actions are triggered at the same time, they will be batched. The intermediate state will not be exposed to the outside to avoid causing some bugs.
2. Explicitly declaring actions can help developers better organize their code and clarify how data updates are triggered when locating problems.

Compared with other state management libraries, mobx has its special features - it does not rely on specific API syntax and can trigger state updates through native JS assignment. While this brings great convenience to developers, it also brings certain risks. Imagine that there are N direct changes to data in a large project. It is difficult for developers to locate which change when locating the problem. led to the final result.

mobx has `enforceActions: true` turned on by default. If the data is modified directly without action during runtime, the console will throw a warning: _[MobX] Since strict-mode is enabled, changing (observed) observable values without using an action is not allowed. Tried to modify: XXStore@XXProperty._

- observable

```typescript
import { observable, action } from 'mobx-miniprogram-lite'

// ✅
const counter = observable({
  value: 0,
  // sync functions wrapped in observable automatically become actions
  updateValue() {
    this.value++
  }
})

// ❌
const counter = observable({
  value: 0
})
const updateValue = () => {
  // non-action
  counter.value++
}
// ✅
const counter = observable({
  value: 0
})
// Use the `action` wrapper to make the function an action function
const updateValue = action(() => {
  counter.value++
})
```

- makeAutoObservable

```typescript
import { makeAutoObservable } from 'mobx-miniprogram-lite'

class Store {
  constructor() {
    makeAutoObservable(this)
  }

  value = 0

  // Like observable, makeAutoObservable will automatically identify functions in the object and wrap them as actions.
  updateValue() {
    this.value++
  }
}
```

- makeObservable

```typescript
import { makeObservable, observable, action } from 'mobx-miniprogram-lite'

class Store {
  constructor() {
    makeObservable(this, {
      value: observable,
      // Manually declare updateValue to be an action
      updateValue: action
    })
  }

  value = 0

  updateValue() {
    this.value++
  }
}
```

- Asynchronous updates

Since mobx transactions are synchronous, asynchronous data updates cannot be captured by transactions, and asynchronous functions cannot be packaged into actions.

```typescript
import { observable, runInAction } from 'mobx-miniprogram-lite'

// ❌
const counter = observable({
  value: 0,
  async updateValueAsync() {
    // do something
    await fetchData()

    // update
    this.value++ // warning will still be thrown
  }
})

// ✅
const counter = observable({
  value: 0,
  updateValue() {
    this.value++
  }
  async updateValueAsync() {
    // do something
    await fetchData()

    // Since updateValue is an action, the data is updated within a transaction
    this.updateValue()
  }
})

// ✅
const counter = observable({
  value: 0,
  async updateValueAsync() {
    // do something
    await fetchData()

    // runInAction is the immediate execution version of the `action`. The function wrapped by runInAction will be executed immediately in the transaction
    runInAction(() => {
      this.value++
    })
  }
})


```

### Bind to mini program component

Due to the difference in the life cycle of Page and Component, mobx-miniprogram-lite binds data and components through two different APIs. The only difference between them is the function name, and the function parameters and types are completely consistent.

All the developer has to do is replace the native API of the mini program with the API exported by mobx-miniprogram-lite:

- `Page({})` → `connectPage({})`
- `Component({})` → `connectComponent({})`

And complete the injection of the data source through the store attribute.

#### Page

```typescript
import { connectPage } from 'mobx-miniprogram-lite'
import counterStore from './stores/counter'
import todoStore from './stores/todo'

connectPage({
  //Inject observation data through the store attribute
  store: {
    counter: counterStore,
    todo: todoStore
  },
  onLoad() {},
  onUnload() {},
  data: {}
})
```

#### Component

```typescript
import { connectComponent } from 'mobx-miniprogram-lite'
import counterStore from './stores/counter'
import todoStore from './stores/todo'

connectComponent({
  //Inject observation data through the store attribute
  store: {
    counter: counterStore,
    todo: todoStore
  },
  lifetimes: {
    attached() {},
    detached() {}
  },
  data: {}
})
```

#### Template rendering

The data source in the store will be automatically mapped to data by mobx-miniprogram-lite, for example:

- `this.store.todo.length` → `this.data.todo.length`

Therefore, the corresponding data can be accessed directly in wxml through the attribute name in the store attribute:

```html
<view>length: {{todo.length}}</view>
```

#### Call data layer method

mobx-miniprogram-lite does not automatically bind the functions in the store to the mini program components, but recommends developers to call them manually:

```typescript
connectPage({
  store: {
    todo: todoStore
  },
  toggleTodo(event) {
    const index = event.target.dataset.index
    this.store.todo.toggleTodo(index)
  }
})
```

Interactive events often need to be processed in mini program event processing functions. This part of the logic belongs to the view layer. If written together with the data layer logic, it will cause coupling and pollution. Therefore, it is recommended that developers separate the view layer logic and data layer logic.

## Performance

Since the bottom layer of mobx-miniprogram-lite deeply traverses observable objects, as the amount of data increases, the performance loss will also increase linearly. If the amount of your business data is very large, please use it with caution.

The following is the approximate additional calculation time caused by the number of data items (compared to native setData):

| Number of data items | Time consumption (milliseconds) |
| -------------------- | ------------------------------- |
| 100                  | 1                               |
| 1000                 | 3                               |
| 10000                | 30                              |

### Optimization

mobx-miniprogram-lite creates separate observation instances for each store sub-property, so do not store multiple data fields together to achieve optimal performance.

```typescript
import { connectPage, observable } from 'mobx-miniprogram-lite'

// ❌
const listStore = observable({
  // @states-observer
  // When loading is updated, recalculation of list will also be triggered.
  states = {
    list: [...], // Up to 5000 pieces of data
    loading: false,
  }
})

// ✅
const listStore = observable({
  // @list-observer
  list: [...], // Up to 5000 pieces of data
  // @loading-observer
  // When the value of loading changes, only loading is recalculated
  loading: false,
})

connectPage({
  store: {
    list: listStore
  }
})
```
