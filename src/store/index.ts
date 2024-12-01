import { createStore } from 'vuex'
import type { InjectionKey } from 'vue'
import type { Store } from 'vuex'
import type { User, Order, OrderStatus } from '@/types'

interface FinancialMetrics {
  totalRevenue: number
  pendingPayments: number
  commissionsPaid: number
}

interface State {
  user: User | null
  orders: Order[]
  financialMetrics: FinancialMetrics
}

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state: {
    user: null,
    orders: [],
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
    updateOrderStatus(state, { orderId, status }: { orderId: string; status: OrderStatus }) {
      const order = state.orders.find(o => o.id === orderId)
      if (order) {
        order.status = status
      }
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
        commit('setOrders', orders)
      } catch (error) {
        console.error('Error fetching orders:', error)
        throw error
      }
    },
    async updateOrderStatus({ commit }, payload: { orderId: string; status: OrderStatus }) {
      try {
        const response = await fetch(`/api/orders/${payload.orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: payload.status })
        })
        
        if (!response.ok) throw new Error('Failed to update order status')
        
        commit('updateOrderStatus', payload)
      } catch (error) {
        console.error('Error updating order status:', error)
        throw error
      }
    }
  },
  getters: {
    getPendingOrders: (state) => state.orders.filter(order => order.status === 'pending'),
    getOrderById: (state) => (id: string) => state.orders.find(order => order.id === id),
    getTotalRevenue: (state) => state.financialMetrics.totalRevenue
  }
})

export function useStore() {
  return store as Store<State>
}
