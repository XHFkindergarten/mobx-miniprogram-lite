import { connectComponent } from 'mobx-miniprogram-lite'
import todoStore, { Type } from '../todo-store'

connectComponent({
  store: {
    todo: todoStore
  },
  methods: {
    showAll() {
      this.store.todo.filter(Type.all)
    },

    showActive() {
      this.store.todo.filter(Type.active)
    },

    showDone() {
      this.store.todo.filter(Type.done)
    },

    clearDone() {
      wx.showModal({
        title: '提示',
        content: '确定清空已完成任务？',
        success: (res) => {
          if (res.confirm) {
            this.store.todo.clearDone()
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
            this.store.todo.toggleAll(true)
            this.showAll()
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  }
})
