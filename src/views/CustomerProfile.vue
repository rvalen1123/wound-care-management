<template>
  <div class="p-6">
    <!-- Customer Header -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold text-gray-800">
          <font-awesome-icon icon="user" class="mr-2" />
          Customer Profile
        </h1>
        <PrimeButton label="Edit Profile" icon="pi pi-pencil" class="p-button-secondary" />
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Basic Info -->
        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-gray-700">Basic Information</h3>
          <p><span class="font-medium">Company:</span> {{ customer.companyName }}</p>
          <p><span class="font-medium">Contact:</span> {{ customer.contactName }}</p>
          <p><span class="font-medium">Email:</span> {{ customer.email }}</p>
          <p><span class="font-medium">Phone:</span> {{ customer.phone }}</p>
        </div>
        
        <!-- Billing Info -->
        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-gray-700">Billing Information</h3>
          <p><span class="font-medium">Billing Address:</span> {{ customer.billingAddress }}</p>
          <p><span class="font-medium">Credit Terms:</span> {{ customer.creditTerms }}</p>
          <p><span class="font-medium">Payment Method:</span> {{ customer.paymentMethod }}</p>
        </div>
        
        <!-- Account Summary -->
        <div class="space-y-2">
          <h3 class="text-lg font-semibold text-gray-700">Account Summary</h3>
          <p><span class="font-medium">Total Orders:</span> {{ customer.totalOrders }}</p>
          <p><span class="font-medium">Active Orders:</span> {{ customer.activeOrders }}</p>
          <p><span class="font-medium">Outstanding Balance:</span> {{ formatNumber(customer.outstandingBalance, true) }}</p>
        </div>
      </div>
    </div>

    <!-- Financial Overview -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-bold text-gray-800 mb-4">
        <font-awesome-icon icon="chart-line" class="mr-2" />
        Financial Overview
      </h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Monthly Orders Chart -->
        <div class="h-80 relative">
          <BarChart
            v-if="monthlyOrdersData"
            :data="monthlyOrdersData"
            :options="chartOptions"
          />
        </div>
        <!-- Payment Status Chart -->
        <div class="h-80 relative">
          <PieChart
            v-if="paymentStatusData"
            :data="paymentStatusData"
            :options="pieChartOptions"
          />
        </div>
      </div>
    </div>

    <!-- Order History -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-800">
          <font-awesome-icon icon="clipboard-list" class="mr-2" />
          Order History
        </h2>
        <div class="flex gap-2">
          <span class="p-input-icon-left">
            <i class="pi pi-search" />
            <InputText v-model="searchTerm" placeholder="Search orders..." />
          </span>
          <PrimeButton label="Export to Excel" icon="pi pi-file-excel" class="p-button-success" />
        </div>
      </div>

      <DataTable
        :value="filteredOrders"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[10, 20, 50]"
        responsiveLayout="scroll"
        class="p-datatable-sm"
        v-model:filters="filters"
        filterDisplay="menu"
        :loading="loading"
      >
        <PrimeColumn field="orderId" header="Order ID" sortable>
          <template #body="slotProps">
            <router-link 
              :to="{ name: 'OrderDetails', params: { id: slotProps.data.orderId }}"
              class="text-blue-600 hover:text-blue-800"
            >
              #{{ slotProps.data.orderId }}
            </router-link>
          </template>
        </PrimeColumn>
        <PrimeColumn field="dateOfService" header="Date of Service" sortable />
        <PrimeColumn field="typeOfGraft" header="Type of Graft" sortable />
        <PrimeColumn field="units" header="Units" sortable />
        <PrimeColumn field="invoiceAmount" header="Invoice Amount" sortable>
          <template #body="slotProps">
            {{ formatNumber(slotProps.data.invoiceAmount, true) }}
          </template>
        </PrimeColumn>
        <PrimeColumn field="status" header="Status" sortable>
          <template #body="slotProps">
            <PrimeTag :severity="getStatusSeverity(slotProps.data.status)">
              {{ slotProps.data.status }}
            </PrimeTag>
          </template>
        </PrimeColumn>
      </DataTable>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { Bar, Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
)

const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

const defaultBarChartOptions = {
  ...defaultChartOptions,
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

export default {
  name: 'CustomerProfile',
  components: {
    BarChart: Bar,
    PieChart: Pie
  },
  setup() {
    const loading = ref(false)
    const searchTerm = ref('')
    const filters = ref({})
    const customer = ref({
      companyName: 'Medical Center Inc.',
      contactName: 'Dr. John Smith',
      email: 'john.smith@medcenter.com',
      phone: '(555) 123-4567',
      billingAddress: '123 Healthcare Ave, Medical District, MD 12345',
      creditTerms: 'Net 30',
      paymentMethod: 'ACH Direct Deposit',
      totalOrders: 156,
      activeOrders: 12,
      outstandingBalance: 45678.90
    })

    const orders = ref([
      {
        orderId: '1001',
        dateOfService: '2024-01-15',
        typeOfGraft: 'Dermal Matrix',
        units: 2,
        invoiceAmount: 2500.00,
        status: 'invoice paid'
      },
      {
        orderId: '1002',
        dateOfService: '2024-01-20',
        typeOfGraft: 'Amniotic Membrane',
        units: 1,
        invoiceAmount: 1800.00,
        status: 'invoice sent'
      },
      {
        orderId: '1003',
        dateOfService: '2024-01-25',
        typeOfGraft: 'Dermal Matrix',
        units: 3,
        invoiceAmount: 3750.00,
        status: 'delinquent'
      }
    ])

    const monthlyOrdersData = computed(() => ({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Monthly Orders',
        data: [12, 15, 18, 14, 16, 19],
        backgroundColor: '#4CAF50'
      }]
    }))

    const paymentStatusData = computed(() => ({
      labels: ['Paid', 'Pending', 'Delinquent'],
      datasets: [{
        data: [65, 25, 10],
        backgroundColor: ['#4CAF50', '#FFA726', '#EF5350']
      }]
    }))

    const chartOptions = computed(() => defaultBarChartOptions)
    const pieChartOptions = computed(() => defaultChartOptions)

    const formatNumber = (value, isCurrency = false) => {
      const formatter = new Intl.NumberFormat('en-US', {
        style: isCurrency ? 'currency' : 'decimal',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
      return formatter.format(value)
    }

    const getStatusSeverity = (status) => {
      const statusMap = {
        'invoice paid': 'success',
        'invoice sent': 'warning',
        'delinquent': 'danger'
      }
      return statusMap[status.toLowerCase()] || 'info'
    }

    const filteredOrders = computed(() => {
      if (!searchTerm.value) return orders.value
      const search = searchTerm.value.toLowerCase()
      return orders.value.filter(order => 
        order.orderId.toLowerCase().includes(search) ||
        order.typeOfGraft.toLowerCase().includes(search) ||
        order.status.toLowerCase().includes(search)
      )
    })

    return {
      loading,
      searchTerm,
      filters,
      customer,
      orders,
      monthlyOrdersData,
      paymentStatusData,
      chartOptions,
      pieChartOptions,
      formatNumber,
      getStatusSeverity,
      filteredOrders
    }
  }
}
</script>

<style scoped>
.p-datatable ::v-deep(.p-datatable-header) {
  background-color: #f8f9fa;
}

.p-datatable ::v-deep(.p-datatable-thead > tr > th) {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
}

.p-datatable ::v-deep(.p-datatable-tbody > tr:nth-child(even)) {
  background-color: #f8f9fa;
}

.p-tag {
  padding: 0.25rem 0.5rem;
}
</style>
