import { connectComponent } from '@tencent/mobx-miniprogram-lite'
import todoStore, { Type } from '../todo-store'

const store = {
  todo1: todoStore
}

connectComponent({
  store,
  methods: {
    showAll() {
      this.store.todo1.filter(Type.all)
    },

    showActive() {
      this.store.todo1.filter(Type.active)
    },

    showDone() {
      this.store.todo1.filter(Type.done)
    },

    clearDone() {
      wx.showModal({
        title: '提示',
        content: '确定清空已完成任务？',
        success: (res) => {
          if (res.confirm) {
            this.store.todo1.clearDone()
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },

    toggleAll() {
      wx.showModal({
        title: '提示',
        content: '确定完成所有未完成任务？',
        success: (res) => {
          if (res.confirm) {
            this.store.todo1.todo.toggleAll(true)
            this.showAll()
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  }
})
