import { createServerFn } from '@tanstack/react-start'
import { getSupabaseClient } from './supabase'

// Get visitor count
export const getVisitorCount = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from('visitor_count')
      .select('count')
      .eq('id', 1)
      .single()

    if (error) {
      console.error('Error fetching visitor count:', error)
      return { count: 0 }
    }

    return { count: data?.count ?? 0 }
  } catch (error) {
    console.error('Error fetching visitor count:', error)
    return { count: 0 }
  }
})

// Increment visitor count
export const incrementVisitorCount = createServerFn({ method: 'POST' }).handler(async () => {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase.rpc('increment_visitor_count')

    if (error) {
      console.error('Error incrementing visitor count:', error)
      return { count: 1 }
    }

    return { count: data ?? 1 }
  } catch (error) {
    console.error('Error incrementing visitor count:', error)
    return { count: 1 }
  }
})
