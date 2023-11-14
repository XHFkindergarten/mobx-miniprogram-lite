import '@tests/utils/mock-page'
import { connectComponent } from '@/connect-component'
import { countStore } from './counter'

connectComponent({
  store: {
    count: countStore
  }
})
