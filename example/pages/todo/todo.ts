import { connectPage } from "mobx-miniprogram-lite";
import todoStore from "./todo-store";

connectPage({
  store: {
    todo: todoStore
  },

  onLoad() {
  },

  editTodo(e) {
    this.store.todo.editTodo(e.detail.value)
  },

  addTodo() {
    this.store.todo.addTodo();
  },

  destroy(evt) {
    this.store.todo.destroy(evt.currentTarget.dataset.id);
  },

  toggle(evt) {
    this.store.todo.toggle(evt.currentTarget.dataset.id);
  },

  back() {
    wx.navigateBack()
  }
});
