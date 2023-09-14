import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction
} from '@/index'

export interface TodoProps {
  title: string
  done: boolean
}

// model
class Todo {
  constructor(props: TodoProps) {
    this.title = props.title
    this.done = props.done
    makeObservable(this, {
      title: observable,
      done: observable,
      notes: observable,
      innerProps: observable
    })
  }

  title: string

  done: boolean

  notes: string[] = []

  innerProps: Record<string, string> = {}
}

class ArrayStore {
  constructor() {
    makeObservable(this, {
      todos: observable,
      length: computed,
      addTodo: action,
      markFinish: action,
      addTodoAsync: action,
      doNothing: action,
      addNote: action,
      forceUpdateNote: action,
      revertNote: action,
      removeNote: action,
      removeTodo: action,
      updateInnerProps: action,
      revertInnerProps: action
    })
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

  doNothing = () => {
    const first = this.todos[0]
    this.todos[0] = new Todo({
      title: first.title,
      done: first.done
    })
  }

  addNote = () => {
    const last = this.todos[this.length - 1]
    last.notes.push('hello~')
  }

  forceUpdateNote = () => {
    const last = this.todos[this.length - 1]
    // @ts-ignore
    last.notes = 'hello~'
  }

  revertNote = () => {
    const last = this.todos[this.length - 1]
    last.notes = ['hello~']
  }

  removeNote = () => {
    const last = this.todos[this.length - 1]
    last.notes = []
  }

  removeTodo = () => {
    this.todos = this.todos.slice(0, this.length - 1)
  }

  updateInnerProps = () => {
    const last = this.todos[this.length - 1]
    last.innerProps = {
      name: 'bye'
    }
  }

  revertInnerProps() {
    const last = this.todos[this.length - 1]
    last.innerProps = {}
  }
}

export const arrayStore = new ArrayStore()
