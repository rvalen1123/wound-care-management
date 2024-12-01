import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Button from 'primevue/button';
import Calendar from 'primevue/calendar';
import Card from 'primevue/card';
import Dropdown from 'primevue/dropdown';
import InputNumber from 'primevue/inputnumber';
import Dialog from 'primevue/dialog';
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import ConfirmDialog from 'primevue/confirmdialog';
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip';
import Ripple from 'primevue/ripple';

// Import PrimeVue styles
import 'primevue/resources/themes/lara-light-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

export function setupPrimeVue(app: ReturnType<typeof createApp>): void {
  app.use(PrimeVue, { ripple: true });
  app.use(ToastService);
  app.use(ConfirmationService);

  // Register PrimeVue components globally with 'Prime' prefix
  app.component('PrimeButton', Button);
  app.component('PrimeCalendar', Calendar);
  app.component('PrimeCard', Card);
  app.component('PrimeDropdown', Dropdown);
  app.component('PrimeInputNumber', InputNumber);
  app.component('PrimeDialog', Dialog);
  app.component('PrimeToast', Toast);
  app.component('PrimeConfirmDialog', ConfirmDialog);

  // Register directives
  app.directive('tooltip', Tooltip);
  app.directive('ripple', Ripple);
}
