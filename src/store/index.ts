import { createStore } from 'vuex'
import type { InjectionKey } from 'vue'
import type { Store } from 'vuex'
import type { User, Order, Customer } from '@/types'

interface FinancialMetrics {
  totalRevenue: number
  pendingPayments: number
  commissionsPaid: number
}

interface State {
  user: User | null
  orders: Order[]
  customers: Customer[]
  financialMetrics: FinancialMetrics
}

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
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
    setUser(state, user: User | null) {
      state.user = user
    },
    addOrder(state, order: Order) {
      state.orders.push(order)
    },
    updateOrderStatus(state, { orderId, status }: { orderId: number; status: string }) {
      const order = state.orders.find(o => o.id === orderId)
      if (order) {
        order.status = status
      }
    },
    addCustomer(state, customer: Customer) {
      state.customers.push(customer)
    },
    updateFinancialMetrics(state, metrics: Partial<FinancialMetrics>) {
      state.financialMetrics = { ...state.financialMetrics, ...metrics }
    }
  },
  actions: {
    async fetchOrders({ commit }) {
      try {
        const response = await fetch('/api/orders')
        const orders = await response.json()
        orders.forEach((order: Order) => commit('addOrder', order))
      } catch (error) {
        console.error('Error fetching orders:', error)
      }
    },
    async createOrder({ commit }, orderData: Partial<Order>) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        })
        const order = await response.json()
        commit('addOrder', order)
        return order
      } catch (error) {
        console.error('Error creating order:', error)
        throw error
      }
    },
    async updateOrderStatus({ commit }, payload: { orderId: number; status: string }) {
      try {
        const response = await fetch(`/api/orders/${payload.orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: payload.status })
        })
        const updatedOrder = await response.json()
        commit('updateOrderStatus', { 
          orderId: updatedOrder.id, 
          status: updatedOrder.status 
        })
        return updatedOrder
      } catch (error) {
        console.error('Error updating order status:', error)
        throw error
      }
    }
  },
  getters: {
    getPendingOrders: (state): Order[] => {
      return state.orders.filter(order => order.status === 'pending')
    },
    getOrderById: (state) => (id: number): Order | undefined => {
      return state.orders.find(order => order.id === id)
    },
    getTotalRevenue: (state): number => {
      return state.financialMetrics.totalRevenue
    }
  }
})

export function useStore(): Store<State> {
  return store
}
