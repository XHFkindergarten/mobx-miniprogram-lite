import { makeAutoObservable, runInAction } from '@tencent/mobx-miniprogram-lite'

export interface TodoType {
  id: number
  title: string
  done: boolean
}

export class Todo {
  constructor() {
    makeAutoObservable(this)
  }

  id = 1

  todos: TodoType[] = [
    {
      id: 0,
      title: '喝水',
      done: false
    },
    {
      id: 1,
      title: '吃饭',
      done: true
    }
  ]

  addTodo(title: string) {
    this.todos.push({
      id: ++this.id,
      title: title,
      done: false
    })
  }

  clearDone() {
    this.todos = this.todos.filter(function (todo) {
      return !todo.done
    })
  }

  destroy(id) {
    this.todos = this.todos.filter(function (candidate) {
      return candidate.id !== id
    })
  }

  async toggleAll(checked: boolean) {
    await new Promise((res) => setTimeout(res, 50))
    // async action
    runInAction(() => {
      this.todos.map(function (todo) {
        todo.done = checked
      })
    })
  }

  toggle(id: number) {
    const todoToToggle = this.todos.find((todo) => todo.id === id)
    if (todoToToggle) {
      todoToToggle.done = !todoToToggle.done
    }
  }
}
