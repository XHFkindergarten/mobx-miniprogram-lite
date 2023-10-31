import { makeAutoObservable } from 'mobx-miniprogram-lite'
import { Todo } from './todo.model'

export enum Type {
  all = 'all',
  active = 'active',
  done = 'done'
}

export class TodoStore {
  constructor() {
    makeAutoObservable(this)
  }

  // enum
  public Type = Type

  todoTitle = ''

  type = this.Type.all

  todos: Todo[] = [
    new Todo({
      title: '吃饭',
      done: false
    }),
    new Todo({
      title: '喝水',
      done: true
    })
  ]

  get left() {
    return this.todos.filter((item) => !item.done).length
  }

  get done() {
    return this.todos.filter((item) => item.done).length
  }

  get list() {
    switch (this.type) {
      case Type.all:
        return this.todos
      case Type.active:
        return this.todos.filter((item) => !item.done)

      case Type.done:
        return this.todos.filter((item) => item.done)
    }
  }

  editTodo(value: string) {
    this.todoTitle = value
  }

  addTodo() {
    if (this.todoTitle.trim() === '') {
      wx.showToast({
        title: '内容不能为空',
        icon: 'none',
        duration: 2000
      })

      return
    }
    this.todos.push(
      new Todo({
        title: this.todoTitle,
        done: false
      })
    )
    this.todoTitle = ''
  }

  toggle(id) {
    const target = this.todos.find((todo) => todo.id === id)
    target?.toggle()
  }

  destroy(id) {
    this.todos = this.todos.filter((todo) => todo.id !== id)
  }

  clearDone() {
    this.todos = []
  }

  filter(type: Type) {
    this.type = type
  }

  toggleAll(value: boolean) {
    for (const item of this.todos) {
      item.done = value
    }
  }
}

const todoStore = new TodoStore()
export default todoStore
