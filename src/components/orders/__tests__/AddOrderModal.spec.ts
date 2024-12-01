import { describe, it, expect, beforeEach } from '@jest/globals';
import { mount } from '@vue/test-utils'
import AddOrderModal from '../AddOrderModal.vue'
import { supabase } from '@/lib/supabaseClient'

// Mock the supabase client
jest.mock('@/lib/supabaseClient')

describe('AddOrderModal', () => {
  let wrapper: any

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    // Mock successful database responses
    ;(supabase.from as jest.Mock).mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        data: [
          { id: 1, name: 'Test Doctor' },
          { id: 2, name: 'Test Product' }
        ],
        error: null
      })
    }))

    // Mount the component
    wrapper = mount(AddOrderModal, {
      global: {
        stubs: ['router-link']
      }
    })
  })

  it('renders properly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('h2').text()).toBe('Add New Order')
  })

  it('initializes with empty form data', () => {
    const formData = wrapper.vm.formData
    expect(formData.doctor_id).toBe('')
    expect(formData.product_id).toBe('')
    expect(formData.size).toBe('')
    expect(formData.units).toBe(1)
  })

  it('loads doctors and products on mount', async () => {
    await wrapper.vm.$nextTick()
    expect(supabase.from).toHaveBeenCalledWith('doctors')
    expect(supabase.from).toHaveBeenCalledWith('products')
  })

  it('calculates order details when units change', async () => {
    // Set up the product
    wrapper.vm.products = [{
      id: '1',
      name: 'Test Product',
      national_asp: 100
    }]
    
    // Set the form data
    await wrapper.setData({
      formData: {
        ...wrapper.vm.formData,
        product_id: '1',
        units: 2
      }
    })

    // Trigger calculation
    await wrapper.vm.calculateOrder()

    // Check calculations
    expect(wrapper.vm.calculations).toBeTruthy()
    expect(wrapper.vm.calculations.invoiceAmount).toBe(200) // 2 units * $100
    expect(wrapper.vm.calculations.mscCommission).toBe(30) // 15% of $200
  })

  it('emits close event when cancel button is clicked', async () => {
    const cancelButton = wrapper.find('button[type="button"]')
    await cancelButton.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('submits form with correct data', async () => {
    // Mock the orderService
    const mockCreateOrder = jest.fn().mockResolvedValue({})
    wrapper.vm.orderService = { createOrder: mockCreateOrder }

    // Set up form data
    await wrapper.setData({
      formData: {
        doctor_id: '1',
        product_id: '1',
        size: 'M',
        date_of_service: '2024-02-20',
        units: 2
      }
    })

    // Trigger form submission
    await wrapper.find('form').trigger('submit.prevent')

    // Verify order creation was called with correct data
    expect(mockCreateOrder).toHaveBeenCalledWith(expect.objectContaining({
      doctor_id: 1,
      product_id: 1,
      size: 'M',
      units: 2,
      status: 'pending'
    }))

    // Verify events were emitted
    expect(wrapper.emitted('order-created')).toBeTruthy()
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
