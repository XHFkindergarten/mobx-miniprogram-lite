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
    }
  }
})
