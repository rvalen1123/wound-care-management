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
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Message from 'primevue/message';
import Panel from 'primevue/panel';
import ProgressBar from 'primevue/progressbar';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Tooltip from 'primevue/tooltip';
import Ripple from 'primevue/ripple';

// Import PrimeVue styles
import 'primevue/resources/themes/lara-light-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

// PrimeVue configuration type
interface PrimeVueConfiguration {
  ripple: boolean;
  inputStyle: 'outlined' | 'filled';
  zIndex: {
    modal: number;
    overlay: number;
    menu: number;
    tooltip: number;
  };
}

// Component registration map
const components = {
  Button,
  Calendar,
  Card,
  Column,
  ColumnGroup,
  ConfirmDialog,
  DataTable,
  Dialog,
  Dropdown,
  InputNumber,
  InputText,
  Message,
  Panel,
  ProgressBar,
  TabView,
  TabPanel,
  Textarea,
  Toast,
} as const;

// Directive registration map
const directives = {
  tooltip: Tooltip,
  ripple: Ripple,
} as const;

/**
 * Sets up PrimeVue and registers all components and directives globally
 * @param app Vue application instance
 */
export function setupPrimeVue(app: ReturnType<typeof createApp>): void {
  try {
    // Configure PrimeVue with default settings
    const config: PrimeVueConfiguration = {
      ripple: true,
      inputStyle: 'outlined',
      zIndex: {
        modal: 1100,
        overlay: 1000,
        menu: 1000,
        tooltip: 1100,
      },
    };

    app.use(PrimeVue, config);
    app.use(ToastService);
    app.use(ConfirmationService);

    // Register PrimeVue components globally with 'Prime' prefix
    Object.entries(components).forEach(([componentName, component]) => {
      try {
        app.component(`Prime${componentName}`, component);
      } catch (err) {
        console.error(`Failed to register PrimeVue component: ${componentName}`, err);
      }
    });

    // Register directives
    Object.entries(directives).forEach(([directiveName, directive]) => {
      try {
        app.directive(directiveName, directive);
      } catch (err) {
        console.error(`Failed to register PrimeVue directive: ${directiveName}`, err);
      }
    });
  } catch (err) {
    console.error('Failed to setup PrimeVue:', err);
    throw err; // Re-throw to let the app handle fatal setup errors
  }
}
