import { useSupabase } from './useSupabase'

interface AuditEvent {
  table_name: string
  record_id: string
  action: string
  old_values?: any
  new_values: any
  changed_by: string
}

export function useAuditLog() {
  const supabase = useSupabase()

  const logAuditEvent = async (event: AuditEvent) => {
    const { error } = await supabase
      .from('audit_log')
      .insert({
        ...event,
        timestamp: new Date().toISOString()
      })

    if (error) {
      console.error('Error logging audit event:', error)
      throw error
    }
  }

  return {
    logAuditEvent
  }
} 