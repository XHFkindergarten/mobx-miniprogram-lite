import '@tests/utils/mock-page'
import { connectComponent } from '@/connect-component'
import { extendsStore } from '@tests/stores/extends.store'

connectComponent({
  store: {
    extends: extendsStore
  },
  methods: {
    updateHyperValue() {
      this.store.extends.updateHyperValue()
    },
    updateSuperValue() {
      this.store.extends.updateSuperValue()
    },
    updateValue() {
      this.store.extends.updateValue()
    }
  }
})
