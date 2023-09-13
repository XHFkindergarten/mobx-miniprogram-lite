;(global as any).Page = (options: any) => {
  const newOptions = Object.entries(options).reduce(
    (prev, [key, value]) => {
      if (typeof value === 'function') {
        if (key === 'onLoad') {
          prev.lifetimes['attached'] = value
        } else if (key === 'onUnload') {
          prev.lifetimes['detached'] = value
        } else {
          prev.methods[key] = value
        }
      } else {
        prev[key] = value
      }
      return prev
    },
    {
      methods: {},
      lifetimes: {}
    } as Record<any, any>
  )

  // Object.keys(options).forEach((key) => {
  //   if (key == 'methods') return

  //   var value = options[key]
  //   //  要排除生命周期
  //   if (typeof value === 'function') {
  //     options.methods[key] = value
  //   } else {
  //     extraData[key] = value
  //   }
  // })
  // // 通过ready方法挂载this数据
  // const oldReady = options.ready ? options.ready : () => {}
  // options.ready = function () {
  //   Object.keys(extraData).forEach((key) => {
  //     this[key] = extraData[key]
  //   })
  //   oldReady()
  // }
  ;(global as any).Component(newOptions)
}
