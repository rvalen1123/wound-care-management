import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

// Import PrimeVue styles
import 'primevue/resources/themes/lara-light-indigo/theme.css'
import 'primevue/resources/primevue.min.css'     // core css
import 'primeicons/primeicons.css'               // icons
import 'primeflex/primeflex.css'                 // flex css

import './index.css'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

// Create the Vue application
const app = createApp(App)

// Initialize Pinia
const pinia = createPinia()
app.use(pinia)

// Use Vue Router
app.use(router)

// Use PrimeVue
app.use(PrimeVue, {
    ripple: true,
    inputStyle: 'outlined'
})

// Register PrimeVue components
app.component('Card', Card)
app.component('DataTable', DataTable)
app.component('Column', Column)
app.component('Button', Button)
app.component('Tag', Tag)

// Mount the app
app.mount('#app')
