# <img style="width:40px;" alt="MOBX" src="https://mobx.js.org/assets/mobx.png"> mobx-miniprogram-lite

<p style="text-align:center;">
  <span>简体中文</span> |
  <a href="./README.md">English</a> |
  <a href="https://developers.weixin.qq.com/s/CgLK0Pmq7hKv">Example</a>
</p>

## 为什么推荐使用 mobx-miniprogram-lite

mobx-miniprogram-lite 是一个基于 mobx 的，通过发布订阅模式实现微信小程序的响应式视图。开发者可以通过纯 JavaScript 编写逻辑，当数据发生改变时，触发视图的自动更新。基于这种模式，编写出更加简明、清晰的代码。

对于高级开发者，基于领域驱动思想，能够编写出高耦合、低内聚的代码。

## 安装

```
npm install mobx-miniprogram-lite
```

## 快速开始

### connect

- 定义数据和方法

```typescript
// 使用类定义
import { makeAutoObservable } from 'mobx-miniprogram-lite'

class Count {
  constructor() {
    // 非常重要，让这个类的实例变为被观测的，这样我们才能实现响应式视图
    makeAutoObservable(this)
  }

  value = 0

  addValue = () => {
    this.value += 1
  }
}

export const countStore = new Count()

// 或直接使用对象定义
import { observable } from 'mobx-miniprogram-lite'

export const countStore = observable({
  value: 0,
  addValue() {
    this.value += 1
  }
})
```

- 使用 connectPage 和 connectComponent 替代 Page 和 Component 实例方法，将数据实体注入 data.store 属性中，库会自动完成两者的绑定。

Page 页面实例

```typescript
import { connectPage } from 'mobx-miniprogram-lite'
import { countStore } from './count'

connectPage({
  store: {
    count: countStore
  }
})
```

Component 组件实例

```typescript
import { connectComponent } from 'mobx-miniprogram-lite'
import { countStore } from './count'

connectComponent({
  store: {
    count: countStore
  }
})
```

### render and update

- 在组件实例中定义交互函数

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
<view> {{store.count.value}} </view>
<view bindtap="bindTapAdd"> click me to add value </view>
```

这样就完成了一个数字累加器的简单实现。

## 高级

- 在互联网上有许多领域驱动编程的文章，在 mobx-miniprogram-lite 中推荐将页面或组件拆分成以下三层：
  - model：对业务实体的合理抽象。
  - store：一个业务领域，实现业务功能的抽象。
  - view：index.wxml 和 index.{js,ts}

## 灵感来源

- [Westore - 小程序项目分层架构](https://github.com/Tencent/westore)

## 代码案例

https://developers.weixin.qq.com/s/7U4VcFmN7pKx
