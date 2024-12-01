import { supabase } from '@/lib/supabaseClient'
import type { User } from '@/types'

export const checkAdminAccess = (user: User | null): boolean => {
  if (!user) return false
  return user.role === 'admin'
}

export const checkRepAccess = (user: User | null): boolean => {
  if (!user) return false
  return user.role === 'rep' || user.role === 'admin'
}

export const getAccessLevel = (user: User | null): 'admin' | 'rep' | 'user' | 'none' => {
  if (!user) return 'none'
  return user.role
}

export const hasPermission = (user: User | null, requiredRole: 'admin' | 'rep' | 'user'): boolean => {
  if (!user) return false
  
  switch (requiredRole) {
    case 'admin':
      return user.role === 'admin'
    case 'rep':
      return user.role === 'admin' || user.role === 'rep'
    case 'user':
      return true
    default:
      return false
  }
}

interface TableDefinition {
  column_name: string
  data_type: string
  is_nullable: boolean
}

export const checkProfileTable = async (): Promise<void> => {
  try {
    // Get table information
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Error checking profiles table:', error)
      return
    }

    // Get table definition
    const { data: definition, error: defError } = await supabase
      .rpc('get_table_definition', { table_name: 'profiles' })

    if (defError) {
      console.error('Error getting table definition:', defError)
      return
    }

    // Log table structure
    console.log('Profile table definition:', definition)

    // Verify required columns exist
    const requiredColumns = ['id', 'user_id', 'role', 'created_at', 'updated_at']
    const missingColumns = requiredColumns.filter(col => 
      !(definition as TableDefinition[]).some(def => def.column_name === col)
    )

    if (missingColumns.length > 0) {
      console.error('Missing required columns:', missingColumns)
    }
  } catch (error) {
    console.error('Error in checkProfileTable:', error)
  }
}
