import { createStore } from 'vuex'

export default createStore({
  state: {
    user: null,
    orders: [],
    customers: [],
    financialMetrics: {
      totalRevenue: 0,
      pendingPayments: 0,
      commissionsPaid: 0
    }
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    addOrder(state, order) {
      state.orders.push(order)
    },
    updateOrderStatus(state, { orderId, status }) {
      const order = state.orders.find(o => o.id === orderId)
      if (order) order.status = status
    },
    addCustomer(state, customer) {
      state.customers.push(customer)
    },
    updateFinancialMetrics(state, metrics) {
      state.financialMetrics = { ...state.financialMetrics, ...metrics }
    }
  },
  actions: {
    async fetchOrders({ dispatch }) {
      // Placeholder for API call to fetch orders
    },
    async createOrder({ commit }, orderData) {
      // Placeholder for API call to create order
      commit('addOrder', orderData)
    },
    async updateOrderStatus({ commit }, payload) {
      // Placeholder for API call to update order status
      commit('updateOrderStatus', payload)
    }
  },
  getters: {
    getPendingOrders: state => {
      return state.orders.filter(order => order.status === 'pending')
    },
    getTotalRevenue: state => {
      return state.financialMetrics.totalRevenue
    }
  }
})
