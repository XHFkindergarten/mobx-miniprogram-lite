# <img style="width:40px;" alt="MOBX" src="https://mobx.js.org/assets/mobx.png"> mobx-miniprogram-lite

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/XHFkindergarten/mobx-miniprogram-lite/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/mobx-miniprogram-lite.svg?style=flat)](https://www.npmjs.com/package/mobx-miniprogram-lite) [![test coverage](https://img.shields.io/badge/coverage-95.68%25-green)]()

<p style="text-align:center;">
  <span>简体中文</span> |
  <a href="./README_en_US.md">English</a> |
  <a href="https://developers.weixin.qq.com/s/CgLK0Pmq7hKv">Example</a>
</p>

## 为什么推荐使用 mobx-miniprogram-lite

mobx-miniprogram-lite 基于 mobx 实现，支持用户独立于组件之外编写数据层，并通过发布订阅模式实现小程序视图的响应式更新。开发者可以通过纯 JavaScript 编写逻辑，当数据发生改变时，触发视图的自动更新。基于这种模式，编写出更加简明、清晰的代码。

这个库是零侵入式的，你不必为项目引入任何框架，也无需对代码进行任何大规模重构。你可以在项目中逐渐引入它，即使每次只作用于一个数据字段。

对于高级开发者，推荐使用 JS 原生的 class 语法来编写数据层逻辑，结合领域驱动编程，能够轻松编写出高耦合、低内聚的代码。

## 安装

```
npm install mobx-miniprogram-lite
```

## 快速开始

### 1.定义可观测的数据

```typescript
import { observable } from 'mobx-miniprogram-lite'

export const countStore = observable({
  // 被观测的数据
  value: 0,
  // 计算属性
  get double() {
    return this.value * 2
  },
  // 修改数据的方法
  addValue() {
    this.value++
  }
})
```

### 2.将数据与 `Page/Component` 绑定

- Page 页面实例

```typescript
import { connectPage } from 'mobx-miniprogram-lite'
import { countStore } from './count'

connectPage({
  store: {
    count: countStore
  }
})
```

- Component 组件实例

```typescript
import { connectComponent } from 'mobx-miniprogram-lite'
import { countStore } from './count'

connectComponent({
  store: {
    count: countStore
  }
})
```

### 3.渲染和交互

- 在组件方法中调用数据方法

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

- 在 WXML 中绑定数据和交互事件

```html
<view> value: {{count.value}} </view>
<view> value * 2: {{count.doubleValue}} </view>
<view bindtap="bindTapAdd"> click me to add value </view>
```

这样就完成了一个数字累加器的简单实现。

## 灵感来源

- [Westore - 小程序项目分层架构](https://github.com/Tencent/westore)

## 代码案例

https://developers.weixin.qq.com/s/7U4VcFmN7pKx

## 核心概念

- observable
  - 被观测的数据，只有修改的数据是可观测状态时，mobx 才能触发自动响应。
- action
  - 数据的修改动作需要在 action 函数中完成。
- computed
  - 从被观测的数据中派生计算出来的数据，会随着被观测数据的改变而自动更新。

## 文档

### 创建可观测的数据

#### [observable](https://mobx.js.org/observable-state.html#observable)：使一个数据结构变为可观测的。

其中的数据及其深层数据均会变为可观测的，其中的 getter 函数将会变为 computed 数据，其中的函数属性将会变为 action 函数。

```typescript
import { observable } from 'mobx-miniprogram-lite'

// 可观测数组
const todos = observable([
  { title: 'Spoil tea', completed: true },
  { title: 'Make coffee', completed: false }
])

// 可观测对象
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

和 observable 的作用一致，但是作用于 class 数据。第一个参数为类的实例，第二个参数用于对类的属性进行类型断言。

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

// 对于继承场景，只能使用 makeObservable API
class SubClass extends Doubler {
  constructor(value) {
    super(value)
    makeObservable(this, {
      triple: computed
    })
  }

  // 使用父类中的值
  get triple() {
    return this.value * 3
  }
}
```

#### [makeAutoObservable](https://mobx.js.org/observable-state.html#makeautoobservable)

makeAutoObservable 是 makeObservable 的自动推导模式，根据属性的类型自动推断为 `observable`、`action`、`computed` 等类型。但是相对来说有一定限制，例如不能用于子类。

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

### 更新数据

对于被 `observable`、`makeObservable`、`makeAutoObservable` 包裹的 **同步**函数和 **迭代器**函数，开发者不需要额外关心，因为他们已经被 mobx 处理为了 action 函数。但是对于以下情况，需要开发者手动声明 action。

#### 非 action 函数更新被观测数据

```typescript
import { observable, action } from 'mobx-miniprogram-lite'

const counter = observable({
  value: 0
})

let updateValue = () => {
  counter.value++
}

// 调用 action API 将函数转换为 action 函数
updateValue = action(updateValue)
```

#### 异步更新（async / Promise）

```typescript
import { observable, action, runInAction } from 'mobx-miniprogram-lite'
const counter = observable({
  value: 0
})

fetch('/new/counter').then(
  // 使用 action 包裹异步 callback
  action((res) => {
    counter.value = res.value
  })
)

const updateAsync = async () => {
  const { value } = await fetch('/new/counter')
  // 在 runInAction 中更新数据
  runInAction(() => {
    counter.value = value
  })
}
```

### 绑定到小程序组件

由于 Page 和 Component 的生命周期存在差异，因此 mobx-miniprogram-lite 通过两个不同的 API 来绑定数据和组件。它们的区别仅仅是函数名称的不同，函数参数和类型是完全一致的。

开发者要做的就是将小程序原生 API 替换为 mobx-miniprogram-lite 导出的 API：

- `Page({})` → `connectPage({})`
- `Component({})` → `connectComponent({})`

并且通过 store 属性完成数据源的注入即可。

#### Page

```typescript
import { connectPage } from 'mobx-miniprogram-lite'
import counterStore from './stores/counter'
import todoStore from './stores/todo'

connectPage({
  // 通过 store 属性注入观测数据
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
  // 通过 store 属性注入观测数据
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

#### 模板渲染

store 中的数据源，会被 mobx-miniprogram-lite 自动映射到 data 中，例如：

- `this.store.todo.length` → `this.data.todo.length`

因此，可以直接在 wxml 中通过 store 属性中的属性名访问到对应数据：

```html
<view>length: {{todo.length}}</view>
```

#### 调用数据层方法

mobx-miniprogram-lite 并没有将 store 中的函数自动绑定到小程序组件中，而是推荐开发者手动进行调用：

```typescript
connectPage({
  store: {
    todo: todoStore
  },
  toggleTodo(e: WechatMiniprogram.TouchEvent) {
    const index = e.target.dataset.index
    this.store.todo.toggleTodo(index)
  }
})
```

在小程序事件处理函数中往往需要处理交互事件，这部分逻辑属于视图层，如果和数据层逻辑写在一起会造成耦合与污染，因此更推荐开发者将视图层逻辑和数据层逻辑拆分。
