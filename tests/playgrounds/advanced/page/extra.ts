import '@tests/utils/mock-page'
import { connectPage } from '@/connect-page'
import { TodoProps, arrayStore } from '@tests/stores/todo.store'

connectPage({
  store: {
    arr: arrayStore
  },
  methods: {
    addTodo(props: TodoProps) {
      this.store.arr.addTodo(props)
    },
    markFinish(title: string) {
      this.store.arr.markFinish(title)
    }
  }
})
