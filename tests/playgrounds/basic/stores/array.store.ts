import { makeAutoObservable, runInAction } from '@/index'

export interface TodoProps {
  title: string
  done: boolean
}

// model
class Todo {
  constructor(props: TodoProps) {
    this.title = props.title
    this.done = props.done
    makeAutoObservable(this)
  }

  title: string

  done: boolean
}

class ArrayStore {
  constructor() {
    makeAutoObservable(this)
    const todos: Todo[] = []
    todos.push(
      new Todo({
        title: '吃饭',
        done: false
      })
    )
    todos.push(
      new Todo({
        title: '睡觉',
        done: true
      })
    )
    this.todos = todos
  }

  todos

  get length() {
    return this.todos.length
  }

  addTodo = (props: TodoProps) => {
    this.todos.push(new Todo(props))
  }

  markFinish = (title: string) => {
    const item = this.todos.find((todo) => todo.title === title)
    if (item) item.done = true
  }

  addTodoAsync = async (props: TodoProps) => {
    await new Promise((res) => setTimeout(res, 50))
    runInAction(() => {
      this.todos.push(new Todo(props))
    })
  }
}

export const arrayStore = new ArrayStore()
