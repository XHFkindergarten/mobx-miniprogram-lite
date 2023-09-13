import { connectComponent } from '@/connect-component'
import { countStore } from '../stores/count.store'

connectComponent({
  store: {
    count: countStore
  },
  methods: {
    addValue() {
      this.store.count.addValue()
    }
  }
})
