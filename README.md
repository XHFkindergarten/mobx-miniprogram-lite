# <img style="width:40px;" alt="MOBX" src="https://mobx.js.org/assets/mobx.png"> mobx-miniprogram-lite

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/XHFkindergarten/mobx-miniprogram-lite/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/mobx-miniprogram-lite.svg?style=flat)](https://www.npmjs.com/package/mobx-miniprogram-lite) [![test coverage](https://img.shields.io/badge/coverage-95.68%25-green)]()

<p style="text-align:center;">
  <span>简体中文</span> |
  <a href="./README_en_US.md">English</a> |
  <a href="https://developers.weixin.qq.com/s/GNZlomm87hM3">Example</a>
</p>

- 基于 [mobx](https://zh.mobx.js.org/README.html) 实现数据的深度监听，响应式更新视图。
- 支持 [computed](https://mobx.js.org/computeds.html) 派生计算。
- 公共状态管理。
- 基于原生 JS 编写小程序逻辑层，获得更好的代码组织结构。

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

- [observable](https://mobx.js.org/observable-state.html#observable)：使一个数据结构变为可观测的。

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

- [makeObservable](https://mobx.js.org/observable-state.html#makeobservable)

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

- [makeAutoObservable](https://mobx.js.org/observable-state.html#makeautoobservable)

makeAutoObservable 是 makeObservable 的自动推导模式，根据属性的类型自动推断为 `observable`、`action`、`computed` 等类型。但是相对来说有一定限制，例如不能用于子类。

```typescript
import { makeAutoObservable } from 'mobx-miniprogram-lite'

class Doubler {
  value

  readonly description = '静态字段'

  constructor(value) {
    makeAutoObservable(
      this,
      // 和 makeObservable 一样，第二个参数 override 支持指定字段的类型
      {
        // 将 description 字段标记为无需观测
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

### 更新数据

> [Updating state using actions](https://mobx.js.org/actions.html)

当我们希望更新一个被 mobx 观测的数据时，应该通过 **`action`** 来完成这一操作（对于 mobx 来说，这不是必须的，但是强烈推荐这样做）。当你使用任意一个状态管理库时都能够看到类似的概念，这样做的好处是：

1. action 动作会在 mobx 的 _事务_ 中执行，多个 action 动作同时触发时它们将会被批处理，中间态不会对外暴露，避免导致一些 bug。
2. 通过显式地声明 action 能够帮助开发者更好的组织代码，在定位问题时明确数据更新是如何触发的。

相比其他状态管理库，mobx 有其特殊性——不依赖特定的 API 语法，通过原生 JS 赋值即可触发状态的更新。这在给开发者带来极大便利的同时，也带来了一定的风险，试想在一个大型项目中存在 N 处对数据的直接更改，开发者在定位问题时很难定位到哪一处更改导致了最终的结果。

mobx 默认开启了 `enforceActions: true`，运行时如果不通过 action 而是直接修改数据，控制台将会抛出 warning：_[MobX] Since strict-mode is enabled, changing (observed) observable values without using an action is not allowed. Tried to modify: XXStore@XXProperty._

- observable

```typescript
import { observable, action } from 'mobx-miniprogram-lite'

// ✅
const counter = observable({
  value: 0,
  // 被 observable 包裹的【非异步】函数自动成为 action
  updateValue() {
    this.value++
  }
})

// ❌
const counter = observable({
  value: 0
})
const updateValue = () => {
  // 非 action
  counter.value++
}
// ✅
const counter = observable({
  value: 0
})
// 使用 action 包裹，使函数成为 action 函数
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

  // 和 observable 相同，makeAutoObservable 会自动识别对象中的函数并包装为 action。
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
      // 手动声明 updateValue 是一个 action
      updateValue: action
    })
  }

  value = 0

  updateValue() {
    this.value++
  }
}
```

- 异步更新

由于 mobx 的事务是同步的，因此异步数据更新无法被事务捕获，异步函数也无法被包装成 action。

```typescript
import { observable, runInAction } from 'mobx-miniprogram-lite'

// ❌
const counter = observable({
  value: 0,
  async updateValueAsync() {
    // do something
    await fetchData()

    // update
    this.value++ // 仍会抛出 warning
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

    // 由于 updateValue 是一个 action，因此数据是在事务中完成的更新
    this.updateValue()
  }
})

// ✅
const counter = observable({
  value: 0,
  async updateValueAsync() {
    // do something
    await fetchData()

    // runInAction 是 action 函数的立即执行版本，被 runInAction 包裹的函数会立即在事务中执行
    runInAction(() => {
      this.value++
    })
  }
})


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

## 性能

由于 mobx-miniprogram-lite 的底层对可观测对象进行了深度遍历，随着数据量的增大，性能损耗也将会线性增长，如果你的业务数据量十分庞大，请谨慎使用。

以下为数据条数大约带来的额外计算时长（相比原生 setData）：

| 数据条数 | 耗时（毫秒） |
| -------- | ------------ |
| 100      | 1            |
| 1000     | 3            |
| 10000    | 30           |

### 优化手段

mobx-miniprogram-lite 为每一个 store 的子属性单独创建观测实例，因此不要将多个数据字段存放在一起，以此达到最优的性能。

```typescript
import { connectPage, observable } from 'mobx-miniprogram-lite'

// ❌
const listStore = observable({
  // states-observer
  // loading 更新时，也会触发 list 的重新计算
  states = {
    list: [...], // 长达 5000 条数据
    loading: false,
  }
})

// ✅
const listStore = observable({
  // list-observer
  list: [...], // 长达 5000 条数据
  // loading-observer
  // 当 loading 的值发生改变时，仅重新计算 loading
  loading: false,
})

connectPage({
  store: {
    list: listStore
  }
})
```
