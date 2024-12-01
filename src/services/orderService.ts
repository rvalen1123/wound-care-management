import { supabase } from '@/lib/supabaseClient'
import type { Order, OrderCalculations, Product } from '@/types/models'

export const orderService = {
  calculateUnits(size: string): number {
    const [width, height] = size.split('x').map(Number)
    if (isNaN(width) || isNaN(height)) {
      throw new Error('Invalid size format. Expected format: widthxheight')
    }
    return width * height
  },

  calculateInvoiceAmount(product: Product): number {
    if (!product.national_asp) {
      throw new Error('Product ASP is required')
    }
    return product.national_asp * 0.6
  },

  calculateExpectedCollectionDate(dateOfService: string): string {
    const date = new Date(dateOfService)
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format')
    }
    date.setDate(date.getDate() + 60)
    return date.toISOString()
  },

  calculateMscCommission(invoiceAmount: number, product: Product): number {
    if (!product.default_commission_rate) {
      throw new Error('Product default commission rate is required')
    }
    return invoiceAmount * (product.default_commission_rate / 100)
  },

  async calculateOrderValues(
    productId: string,
    size: string,
    dateOfService: string
  ): Promise<OrderCalculations> {
    const { data: productData, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (error || !productData) {
      throw new Error('Failed to fetch product details')
    }

    const product: Product = {
      id: productData.id,
      name: productData.name,
      manufacturer: productData.manufacturer,
      national_asp: productData.national_asp,
      sizes: productData.sizes,
      default_commission_rate: productData.default_commission_rate,
      created_at: productData.created_at,
      updated_at: productData.updated_at
    }

    const units = this.calculateUnits(size)
    const invoiceAmount = this.calculateInvoiceAmount(product)
    const expectedCollectionDate = this.calculateExpectedCollectionDate(dateOfService)
    const mscCommission = this.calculateMscCommission(invoiceAmount, product)

    return {
      units,
      invoiceAmount,
      expectedCollectionDate,
      mscCommission,
      product
    }
  },

  async getOrders(filters: Partial<Order> = {}): Promise<Order[]> {
    let query = supabase.from('orders').select('*')

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value)
      }
    })

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`)
    }

    return data || []
  },

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to create order: ${error?.message}`)
    }

    return data
  },

  async updateOrder(
    id: number,
    updates: Partial<Order>
  ): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to update order: ${error?.message}`)
    }

    return data
  },

  async deleteOrder(id: number): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete order: ${error.message}`)
    }
  },

  async approveOrder(id: number, userId: string): Promise<Order> {
    const updates = {
      status: 'approved',
      approved_by: userId,
      approved_at: new Date().toISOString()
    }

    return this.updateOrder(id, updates)
  }
}
