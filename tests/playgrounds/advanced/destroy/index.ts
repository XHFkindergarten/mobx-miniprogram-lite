import '@tests/utils/mock-page'
import { countStore } from './counter'

Page({
  data: {
    showMulti: true
  },
  toggleShowMulti() {
    this.setData({
      showMulti: !this.data.showMulti
    })
  },
  addValue() {
    countStore.addValue()
  }
})
