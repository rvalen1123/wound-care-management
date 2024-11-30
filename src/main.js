import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import store from './store'
import PrimeVue from 'primevue/config'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Timeline from 'primevue/timeline'
import Chart from 'primevue/chart'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog'
import Calendar from 'primevue/calendar'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import ConfirmDialog from 'primevue/confirmdialog'
import ConfirmationService from 'primevue/confirmationservice'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faUser, 
  faChartLine, 
  faMoneyBill, 
  faHospital,
  faClipboardList,
  faPencil,
  faTrash,
  faTimes,
  faCheck
} from '@fortawesome/free-solid-svg-icons'

// Add icons to the library
library.add(
  faUser, 
  faChartLine, 
  faMoneyBill, 
  faHospital, 
  faClipboardList,
  faPencil,
  faTrash,
  faTimes,
  faCheck
)

// Tailwind CSS
import './index.css'

// PrimeVue CSS
import 'primevue/resources/themes/lara-light-green/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'

// Create the Vue application
const app = createApp(App)

// Initialize Pinia
const pinia = createPinia()
app.use(pinia)

// Use plugins
app.use(router)
app.use(store)
app.use(PrimeVue, {
  ripple: true,
  inputStyle: 'filled'
})
app.use(ConfirmationService)

// Register PrimeVue components globally
app.component('DataTable', DataTable)
app.component('PrimeColumn', Column)
app.component('PrimeButton', Button)
app.component('PrimeTag', Tag)
app.component('PrimeTimeline', Timeline)
app.component('PrimeChart', Chart)
app.component('InputText', InputText)
app.component('PrimeDialog', Dialog)
app.component('PrimeCalendar', Calendar)
app.component('PrimeDropdown', Dropdown)
app.component('InputNumber', InputNumber)
app.component('ConfirmDialog', ConfirmDialog)

// Register FontAwesome component globally
app.component('font-awesome-icon', FontAwesomeIcon)

// Mount the application
app.mount('#app')
