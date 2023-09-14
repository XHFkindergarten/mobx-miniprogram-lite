import '@tests/utils/mock-page'
import { connectComponent } from '@/connect-component'
import { TodoProps, arrayStore } from '@tests/stores/todo.store'

connectComponent({
  store: {
    arr: arrayStore
  },
  methods: {
    addTodo(props: TodoProps) {
      this.store.arr.addTodo(props)
    },
    markFinish(title: string) {
      this.store.arr.markFinish(title)
    },
    async addTodoAsync(props: TodoProps) {
      return this.store.arr.addTodoAsync(props)
    },
    async doNothing() {
      return this.store.arr.doNothing()
    },
    addNote() {
      return this.store.arr.addNote()
    },
    forceUpdateNote() {
      return this.store.arr.forceUpdateNote()
    },
    revertNote() {
      return this.store.arr.revertNote()
    },
    removeTodo() {
      return this.store.arr.removeTodo()
    },
    removeNote() {
      return this.store.arr.removeNote()
    },
    updateInnerProps() {
      return this.store.arr.updateInnerProps()
    },
    revertInnerProps() {
      return this.store.arr.revertInnerProps()
    }
  }
})
