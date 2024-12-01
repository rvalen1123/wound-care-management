import { supabase } from '@/lib/supabaseClient'
import type { Order } from '@/types'

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string
    borderWidth?: number
  }[]
}

export const chartDataService = {
  async getOrdersByMonth(): Promise<ChartData> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('date_of_service')

    if (error) throw error

    const orders = data as Order[]
    const monthlyData = new Map<string, number>()

    orders.forEach(order => {
      const month = new Date(order.date_of_service).toLocaleString('default', { month: 'short' })
      monthlyData.set(month, (monthlyData.get(month) || 0) + order.invoice_to_doc)
    })

    return {
      labels: Array.from(monthlyData.keys()),
      datasets: [{
        label: 'Monthly Orders',
        data: Array.from(monthlyData.values()),
        backgroundColor: '#4F46E5',
        borderColor: '#4338CA',
        borderWidth: 1
      }]
    }
  },

  async getOrdersByProduct(): Promise<ChartData> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        product:product_id(name)
      `)

    if (error) throw error

    const orders = data as (Order & { product: { name: string } })[]
    const productData = new Map<string, number>()

    orders.forEach(order => {
      const productName = order.product?.name || 'Unknown'
      productData.set(productName, (productData.get(productName) || 0) + order.invoice_to_doc)
    })

    return {
      labels: Array.from(productData.keys()),
      datasets: [{
        label: 'Orders by Product',
        data: Array.from(productData.values()),
        backgroundColor: [
          '#4F46E5',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6'
        ],
        borderWidth: 1
      }]
    }
  },

  async getCommissionsByRep(): Promise<ChartData> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        rep:rep_id(name)
      `)
      .eq('status', 'approved')

    if (error) throw error

    const orders = data as (Order & { rep: { name: string } })[]
    const repData = new Map<string, number>()

    orders.forEach(order => {
      const repName = order.rep?.name || 'Unknown'
      repData.set(repName, (repData.get(repName) || 0) + order.msc_commission)
    })

    return {
      labels: Array.from(repData.keys()),
      datasets: [{
        label: 'Commissions by Rep',
        data: Array.from(repData.values()),
        backgroundColor: [
          '#4F46E5',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6'
        ],
        borderWidth: 1
      }]
    }
  }
}
