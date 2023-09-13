import { makeAutoObservable, observable } from "mobx-miniprogram-lite";
import { Todo } from "./todo.model";

export enum Type {
  all = 'all',
  active = 'active',
  done = 'done'
}

export class TodoStore {

  constructor() {
    this.todo = (new Todo())
    makeAutoObservable(this)
  }

  todo: Todo

  // enum
  public Type = Type

  todoTitle = ""

  get left() {
    return this.todos.filter(item => !item.done).length
  }

  get done () {
    return this.todos.filter(item => item.done).length
  }

  type = this.Type.all

  get todos () {
    switch(this.type) {
      case Type.all:
        return this.todo.todos
      case Type.active:
        return this.todo.todos.filter(item => !item.done)

      case Type.done:
        return this.todo.todos.filter(item => item.done)
    }
  }


  editTodo(value: string) {
    this.todoTitle = value
  }

  addTodo() {
    if (this.todoTitle.trim() === "") {
      wx.showToast({
        title: "内容不能为空",
        icon: "none",
        duration: 2000,
      });

      return;
    }
    this.todo.addTodo(this.todoTitle);
    this.todoTitle = "";
  }

  toggle(id) {
    this.todo.toggle(id);
  }

  destroy(id) {
    this.todo.destroy(id);
  }

  clearDone() {
    this.todo.clearDone();
  }

  filter(type: Type) {
    this.type = type;
  }
}

const todoStore = new TodoStore();
export default todoStore;
