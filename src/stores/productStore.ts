import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '@/types/models'
import { supabase } from '../utils/supabase';

export const useProductStore = defineStore('products', () => {
  // State
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentProduct = ref<Product | null>(null)

  // Getters
  const getProductById = computed(() => {
    return (id: string) => products.value.find(product => product.id === id)
  })

  const productsByManufacturer = computed(() => {
    const grouped = products.value.reduce((acc, product) => {
      if (!acc[product.manufacturer]) {
        acc[product.manufacturer] = []
      }
      acc[product.manufacturer].push(product)
      return acc
    }, {} as Record<string, Product[]>)

    // Sort products within each manufacturer
    Object.keys(grouped).forEach(manufacturer => {
      grouped[manufacturer].sort((a, b) => a.name.localeCompare(b.name))
    })

    return grouped
  })

  const sortedProducts = computed(() => {
    return [...products.value].sort((a, b) => {
      // First sort by manufacturer
      const mfgCompare = a.manufacturer.localeCompare(b.manufacturer)
      if (mfgCompare !== 0) return mfgCompare
      // Then by product name
      return a.name.localeCompare(b.name)
    })
  })

  // Actions
  async function fetchProducts() {
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('products')
        .select('*')
        .order('manufacturer')
        .order('name')

      if (err) throw err

      products.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch products'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function createProduct(productData: Partial<Product>) {
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single()

      if (err) throw err

      products.value.push(data)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create product'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function updateProduct(id: string, updates: Partial<Product>) {
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      const index = products.value.findIndex(product => product.id === id)
      if (index !== -1) {
        products.value[index] = { ...products.value[index], ...data }
      }
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update product'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function deleteProduct(id: string) {
    try {
      loading.value = true
      const { error: err } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (err) throw err

      products.value = products.value.filter(product => product.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete product'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function updateProductPricing(id: string, newAsp: number) {
    try {
      loading.value = true
      // First, create a pricing history record
      const { error: historyErr } = await supabase
        .from('pricing_history')
        .insert([{
          product_id: id,
          quarter: getCurrentQuarter(),
          national_asp: products.value.find(p => p.id === id)?.national_asp
        }])

      if (historyErr) throw historyErr

      // Then update the product's current ASP
      return await updateProduct(id, { national_asp: newAsp })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update product pricing'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  // Helper function to get current quarter
  function getCurrentQuarter(): string {
    const date = new Date()
    const quarter = Math.floor(date.getMonth() / 3) + 1
    return `Q${quarter} ${date.getFullYear()}`
  }

  return {
    // State
    products,
    loading,
    error,
    currentProduct,
    
    // Getters
    getProductById,
    productsByManufacturer,
    sortedProducts,
    
    // Actions
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductPricing
  }
})
