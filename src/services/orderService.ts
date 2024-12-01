import { supabase } from '@/lib/supabaseClient'
import type { Order, OrderCalculations, Product } from '@/types/models'

export const orderService = {
  calculateUnits(size: string): number {
    // Add logic to calculate units based on size
    // This is a placeholder implementation
    const [width, height] = size.split('x').map(Number)
    return width * height
  },

  calculateInvoiceAmount(product: Product): number {
    // Default doctor discount is 40% (they pay 60% of ASP)
    return product.national_asp * 0.6
  },

  calculateExpectedCollectionDate(dateOfService: string): string {
    const date = new Date(dateOfService)
    date.setDate(date.getDate() + 60) // Default net 60 terms
    return date.toISOString()
  },

  calculateMscCommission(invoiceAmount: number, product: Product): number {
    return invoiceAmount * (product.default_commission_rate / 100)
  },

  async calculateOrderValues(
    productId: string,
    size: string,
    dateOfService: string
  ): Promise<OrderCalculations | null> {
    try {
      // Get product details
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single()

      if (error || !product) {
        console.error('Error fetching product:', error)
        return null
      }

      const units = this.calculateUnits(size)
      const invoiceAmount = this.calculateInvoiceAmount(product)
      const expectedCollectionDate = this.calculateExpectedCollectionDate(dateOfService)
      const mscCommission = this.calculateMscCommission(invoiceAmount, product)

      // This would need to be expanded to calculate rep commissions
      // based on the rep hierarchy and their commission rates
      const repCommissions = []

      return {
        units,
        invoiceAmount,
        expectedCollectionDate,
        mscCommission,
        repCommissions
      }
    } catch (error) {
      console.error('Error calculating order values:', error)
      return null
    }
  },

  async createOrder(orderData: Partial<Order>): Promise<{ data: Order | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select('*, doctor(*), product(*)')
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async updateOrder(
    orderId: string,
    orderData: Partial<Order>
  ): Promise<{ data: Order | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update(orderData)
        .eq('id', orderId)
        .select('*, doctor(*), product(*)')
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async getOrderById(orderId: string): Promise<{ data: Order | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, doctor(*), product(*)')
        .eq('id', orderId)
        .single()

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  },

  async getOrders(filters: any = {}): Promise<{ data: Order[] | null; error: any }> {
    try {
      let query = supabase
        .from('orders')
        .select('*, doctor(*), product(*)')

      // Apply filters
      if (filters.doctorId) {
        query = query.eq('doctor_id', filters.doctorId)
      }
      if (filters.productId) {
        query = query.eq('product_id', filters.productId)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.dateFrom) {
        query = query.gte('date_of_service', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('date_of_service', filters.dateTo)
      }

      const { data, error } = await query

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }
}
