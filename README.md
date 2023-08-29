# <img style="width:40px;" alt="MOBX" src="https://mobx.js.org/assets/mobx.png"> mobx-miniprogram-lite

<p style="text-align:center;">
  <a href="./README_zh_CN.md">简体中文</a> |
  <span>English</span> |
  <a href="https://developers.weixin.qq.com/s/7U4VcFmN7pKx">Example</a>
</p>

## Why?

mobx-miniprogram-lite is a MobX-based library for creating responsive views in WeChat mini-programs using the publish-subscribe pattern. Developers can write logic in pure JavaScript to automatically update the view when the data changes. This approach allows for writing concise and clear code.

For advanced developers, following a domain-driven design approach, they can write code with high coupling and low cohesion.

## Installment

```
npm install mobx-miniprogram-lite
```

## Quick Start

### connect

- store definition

```typescript
// use class definition
import { makeAutoObservable } from 'mobx-miniprogram-lite'

class Count {
  constructor() {
    // important, make this object observable, then app view can be responsive.
    makeAutoObservable(this)
  }

  value = 0

  addValue = () => {
    this.value += 1
  }
}

export const countStore = new Count()

// or use object definition
import { observable } from 'mobx-miniprogram-lite'

export const countStore = observable({
  value: 0,
  addValue() {
    this.value += 1
  }
})
```

- Use connectPage and connectComponent to replace the Page and Component instance methods, inject the data entity into the `data.store` attribute, and the library will automatically complete the binding between the two.

Page Instance

```typescript
import { connectPage } from 'mobx-miniprogram-lite'
import { countStore } from './count'

connectPage({
  store: {
    count: countStore
  }
})
```

Component Instance

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

- Define the interaction function in the component instance

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

- Binding data and interaction events in WXML

```html
<view> {{count.value}} </view>
<view bindtap="bindTapAdd"> click me to add value </view>
```

This completes a simple implementation of a digital accumulator.

## Advanced

- There are many domain-driven programming articles on the Internet. In mobx-miniprogram-lite, it is recommended to split pages or components into the following three layers:
  - model: a reasonable abstraction of business entities.
  - store: a business domain that implements the abstraction of business functions.
  - view: index.wxml and index.{js,ts}

## Inspiration

- [Westore - 小程序项目分层架构](https://github.com/Tencent/westore)

## Example

https://developers.weixin.qq.com/s/7U4VcFmN7pKx
