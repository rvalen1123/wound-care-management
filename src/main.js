import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import PrimeVue from 'primevue/config'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faUser, 
  faChartLine, 
  faMoneyBill, 
  faHospital,
  faClipboardList
} from '@fortawesome/free-solid-svg-icons'

// Add icons to the library
library.add(faUser, faChartLine, faMoneyBill, faHospital, faClipboardList)

// Tailwind CSS
import './index.css'

// PrimeVue CSS
import 'primevue/resources/themes/lara-light-green/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

// Create the Vue application
const app = createApp(App)

// Use plugins
app.use(router)
app.use(store)
app.use(PrimeVue, {
  ripple: true,
  inputStyle: 'filled'
})

// Register PrimeVue components globally
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Button', Button)
app.component('Tag', Tag)

// Register FontAwesome component globally
app.component('font-awesome-icon', FontAwesomeIcon)

// Mount the application
app.mount('#app')
