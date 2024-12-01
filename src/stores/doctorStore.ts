import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Doctor } from '@/types/models'
import { supabase } from '@/lib/supabaseClient'

export const useDoctorStore = defineStore('doctors', () => {
  // State
  const doctors = ref<Doctor[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentDoctor = ref<Doctor | null>(null)

  // Getters
  const getDoctorById = computed(() => {
    return (id: string) => doctors.value.find(doctor => doctor.id === id)
  })

  const sortedDoctors = computed(() => {
    return [...doctors.value].sort((a, b) => a.name.localeCompare(b.name))
  })

  // Actions
  async function fetchDoctors() {
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('doctors')
        .select('*')
        .order('name')

      if (err) throw err

      doctors.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch doctors'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function createDoctor(doctorData: Partial<Doctor>) {
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('doctors')
        .insert([doctorData])
        .select()
        .single()

      if (err) throw err

      doctors.value.push(data)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create doctor'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function updateDoctor(id: string, updates: Partial<Doctor>) {
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('doctors')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      const index = doctors.value.findIndex(doctor => doctor.id === id)
      if (index !== -1) {
        doctors.value[index] = { ...doctors.value[index], ...data }
      }
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update doctor'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  async function deleteDoctor(id: string) {
    try {
      loading.value = true
      const { error: err } = await supabase
        .from('doctors')
        .delete()
        .eq('id', id)

      if (err) throw err

      doctors.value = doctors.value.filter(doctor => doctor.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete doctor'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    doctors,
    loading,
    error,
    currentDoctor,
    
    // Getters
    getDoctorById,
    sortedDoctors,
    
    // Actions
    fetchDoctors,
    createDoctor,
    updateDoctor,
    deleteDoctor
  }
})
