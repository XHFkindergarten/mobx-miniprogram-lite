# <img style="width:40px;" alt="MOBX" src="https://mobx.js.org/assets/mobx.png"> mobx-miniprogram-lite

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/XHFkindergarten/mobx-miniprogram-lite/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/mobx-miniprogram-lite.svg?style=flat)](https://www.npmjs.com/package/mobx-miniprogram-lite) [![test coverage](https://img.shields.io/badge/coverage-95.68%25-green)]()

<p style="text-align:center;">
   <a href="./README.md">简体中文</a> |
   <span>English</span> |
   <a href="https://developers.weixin.qq.com/s/CgLK0Pmq7hKv">Example</a>
</p>

## Why is it recommended to use mobx-miniprogram-lite

mobx-miniprogram-lite is a responsive view based on mobx that implements WeChat mini programs through the publish and subscribe model. Developers can write logic through pure JavaScript to trigger automatic updates of views when data changes. Based on this pattern, write more concise and clear code.

This library is zero-intrusive, you don’t have to introduce any frameworks to your project, nor do you need to do any large-scale refactoring of your code. You can introduce it gradually in your project, even if it only affects one data field at a time.

For advanced developers, it is recommended to use JS’s native class syntax to write data layer logic, combined with domain-driven programming, to easily write highly coupled and low cohesion code.

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

#### [observable](https://mobx.js.org/observable-state.html#observable): Make a data structure observable.

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

#### [makeObservable](https://mobx.js.org/observable-state.html#makeobservable)

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

#### [makeAutoObservable](https://mobx.js.org/observable-state.html#makeautoobservable)

makeAutoObservable is the automatic inference mode of makeObservable, which automatically infers `observable`, `action`, `computed` and other types according to the type of the attribute. But relatively speaking, there are certain restrictions, such as it cannot be used in subclasses.

```typescript
import { makeAutoObservable } from 'mobx-miniprogram-lite'

class Doubler {
  value

  constructor(value) {
    makeAutoObservable(this)
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

Developers do not need to pay extra attention to the **synchronization** functions and **iterator** functions wrapped by `observable`, `makeObservable`, and `makeAutoObservable`, because they have been processed by mobx as action functions. However, for the following situations, developers need to declare actions manually.

#### Non-action functions update observed data

```typescript
import { observable, action } from 'mobx-miniprogram-lite'

const counter = observable({
  value: 0
})

let updateValue = () => {
  counter.value++
}

// Call the action API to convert the function into an action function
updateValue = action(updateValue)
```

#### Asynchronous update (async/Promise)

```typescript
import { observable, action, runInAction } from 'mobx-miniprogram-lite'
const counter = observable({
  value: 0
})

fetch('/new/counter').then(
  // Use action to wrap asynchronous callback
  action((res) => {
    counter.value = res.value
  })
)

const updateAsync = async () => {
  const { value } = await fetch('/new/counter')
  //Update data in runInAction
  runInAction(() => {
    counter.value = value
  })
}
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
