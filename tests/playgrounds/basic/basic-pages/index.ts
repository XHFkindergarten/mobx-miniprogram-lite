import { connectPage } from '@/connect-page'
import { countStore } from '../stores/count.store'

connectPage({
  store: {
    count: countStore
  },
  addValue() {
    this.store.count.addValue()
  }
})
