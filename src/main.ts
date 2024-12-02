import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { setupPrimeVue } from './plugins/primevue';
import router from './router';
import App from './App.vue';

// Import global styles
import './index.css';

// Create Vue app instance
const app = createApp(App);

// Setup Pinia store
const pinia = createPinia();
app.use(pinia);

// Setup PrimeVue
setupPrimeVue(app);

// Setup Router
app.use(router);

// Error handler
interface ErrorInfo {
  message: string;
  stack?: string;
}

app.config.errorHandler = (
  err: unknown,
  instance: unknown,
  info: string
) => {
  const error = err as Error | ErrorInfo;
  console.error('Global error:', error.message);
  console.error('Stack trace:', error.stack);
  console.error('Vue instance:', instance);
  console.error('Error info:', info);
};

// Mount app
app.mount('#app');
