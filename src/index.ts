import 'es6-symbol'

import { configure } from 'mobx'

export { connectComponent } from './connect-component'
export { connectPage } from './connect-page'

/**
 * @doc https://developers.weixin.qq.com/miniprogram/dev/framework/runtime/js-support.html#%E6%97%A0%E6%B3%95%E8%A2%AB-Polyfill-%E7%9A%84-API
 */
configure({
  // In order to make the development performance consistent with the online performance
  // none-use-of-proxies is better now
  useProxies: 'never'
})

export * from 'mobx'

export { configureLog, ConfigureLogOptions } from './log'
