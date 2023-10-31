import { makeAutoObservable } from 'mobx-miniprogram-lite'

export interface TodoType {
  id: number
  title: string
  done: boolean
}

interface TodoProps {
  title: string
  done: boolean
}

export class Todo {
  constructor(props: TodoProps) {
    this.title = props.title
    this.done = props.done
    this.id = Todo.genId()
    makeAutoObservable(this)
  }

  static genId = (() => {
    let id = 0
    return () => id++
  })()

  id: number

  title: string

  done: boolean

  toggle() {
    this.done = !this.done
  }
}
