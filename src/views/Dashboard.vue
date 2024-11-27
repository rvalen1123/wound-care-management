<template>
  <div class="dashboard">
    <h1 class="text-2xl font-bold mb-6 text-green-700">Wound Care Management Dashboard</h1>
    
    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div v-for="stat in statsList" :key="stat.title" class="bg-white shadow-md rounded-lg p-6">
        <h3 class="text-lg font-semibold mb-2">{{ stat.title }}</h3>
        <p :class="['text-3xl font-bold', stat.colorClass]">
          {{ stat.prefix }}{{ formatNumber(stat.value, stat.isMonetary) }}
        </p>
        <p class="text-sm text-gray-500 mt-2">{{ stat.subtitle }}</p>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="bg-white shadow-md rounded-lg p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">Recent Orders</h2>
        <router-link 
          to="/graft-orders" 
          class="text-green-600 hover:text-green-700"
        >
          View All Orders
        </router-link>
      </div>
      
      <DataTable :value="recentOrders" :paginator="true" :rows="5" 
                 class="p-datatable-sm p-datatable-gridlines" 
                 responsiveLayout="scroll"
                 :rowHover="true"
                 stripedRows>
        <Column field="id" header="Order ID" class="text-lg">
          <template #body="slotProps">
            <span class="text-lg font-medium">#{{ slotProps.data.id }}</span>
          </template>
        </Column>
        <Column field="customerName" header="Customer">
          <template #body="slotProps">
            <span class="text-lg">{{ slotProps.data.customerName }}</span>
          </template>
        </Column>
        <Column field="product" header="Product">
          <template #body="slotProps">
            <span class="text-lg">{{ slotProps.data.product }}</span>
          </template>
        </Column>
        <Column field="amount" header="Amount">
          <template #body="slotProps">
            <span class="text-lg font-medium">${{ formatNumber(slotProps.data.amount, true) }}</span>
          </template>
        </Column>
        <Column field="status" header="Status">
          <template #body="slotProps">
            <Tag :value="slotProps.data.status" 
                 :severity="getStatusSeverity(slotProps.data.status)"
                 class="text-lg">
            </Tag>
          </template>
        </Column>
        <Column header="Actions">
          <template #body="slotProps">
            <Button icon="pi pi-eye" 
                    class="p-button-text p-button-lg" 
                    @click="viewOrder(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardView',
  data() {
    return {
      statsList: [
        {
          title: 'Total Orders',
          value: 156,
          prefix: '',
          colorClass: 'text-green-600',
          subtitle: 'Last 30 days',
          isMonetary: false
        },
        {
          title: 'Active Orders',
          value: 23,
          prefix: '',
          colorClass: 'text-blue-600',
          subtitle: 'In progress',
          isMonetary: false
        },
        {
          title: 'Total Revenue',
          value: 125000,
          prefix: '$',
          colorClass: 'text-green-600',
          subtitle: 'This month',
          isMonetary: true
        },
        {
          title: 'Pending Payments',
          value: 45000,
          prefix: '$',
          colorClass: 'text-yellow-600',
          subtitle: '15 orders',
          isMonetary: true
        }
      ],
      recentOrders: [
        {
          id: '1001',
          customerName: 'City Hospital',
          product: 'Palingen X Plus',
          amount: 4122.00,
          status: 'invoice paid'
        },
        {
          id: '1002',
          customerName: 'Medical Center',
          product: 'Dermacyte',
          amount: 21267.84,
          status: 'invoice sent'
        },
        {
          id: '1003',
          customerName: 'Regional Clinic',
          product: 'Amnio Tri-Core',
          amount: 13674.00,
          status: 'delinquent'
        },
        {
          id: '1004',
          customerName: 'Valley Hospital',
          product: 'Complete AA',
          amount: 20765.30,
          status: 'invoice sent'
        },
        {
          id: '1005',
          customerName: 'Wound Care Specialists',
          product: 'XWrap',
          amount: 17935.20,
          status: 'invoice paid'
        }
      ]
    }
  },
  methods: {
    formatNumber(value, isMonetary = true) {
      return value.toLocaleString('en-US', {
        minimumFractionDigits: isMonetary ? 2 : 0,
        maximumFractionDigits: isMonetary ? 2 : 0
      })
    },
    getStatusSeverity(status) {
      const severities = {
        'invoice paid': 'success',
        'invoice sent': 'warning',
        'delinquent': 'danger'
      }
      return severities[status] || 'info'
    },
    viewOrder(order) {
      this.$router.push(`/graft-orders/${order.id}`)
    }
  }
}
</script>

<style>
.dashboard {
  background-color: #f4f7f6;
  padding: 2rem;
}

/* PrimeVue DataTable customizations */
:deep(.p-datatable) {
  border-radius: 0.5rem;
  font-size: 1.125rem;
}

:deep(.p-datatable .p-datatable-header) {
  background: transparent;
  border: none;
  padding: 1.5rem;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f8fafc;
  border-width: 0 0 2px 0;
  border-color: #e2e8f0;
  color: #1e293b;
  font-weight: 600;
  font-size: 1.25rem;
  padding: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

:deep(.p-datatable .p-datatable-tbody > tr) {
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s ease;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
  background-color: #f8fafc;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  border: none;
  padding: 1.5rem;
  line-height: 1.75;
  vertical-align: middle;
}

:deep(.p-datatable.p-datatable-gridlines .p-datatable-tbody > tr > td) {
  border: 1px solid #f1f5f9;
}

:deep(.p-datatable.p-datatable-striped .p-datatable-tbody > tr:nth-child(even)) {
  background: #f8fafc;
}

:deep(.p-tag) {
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
  font-weight: 500;
}

:deep(.p-button.p-button-lg) {
  padding: 0.75rem;
  font-size: 1.25rem;
}

:deep(.p-button.p-button-lg .p-button-icon) {
  font-size: 1.5rem;
}

:deep(.p-paginator) {
  padding: 1.5rem;
  font-size: 1.125rem;
  border-top: 2px solid #e2e8f0;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  min-width: 3rem;
  height: 3rem;
  font-size: 1.125rem;
}

:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-prev),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-last) {
  min-width: 3rem;
  height: 3rem;
}

:deep(.p-paginator .p-paginator-current) {
  margin: 0 1rem;
  font-size: 1.125rem;
}
</style>
