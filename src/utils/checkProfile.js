import { supabase } from '@/lib/supabase'

async function checkProfileTable() {
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

    console.log('Profile table data sample:', data)
    console.log('Table definition:', definition)
  } catch (error) {
    console.error('Error:', error)
  }
}

checkProfileTable()
