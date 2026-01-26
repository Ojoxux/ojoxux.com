'use server'

import { Effect } from 'effect'
import { getSupabaseClient } from '@/lib/supabase'

export interface VisitorCountResult {
  count: number
}

function runEffect<T>(effect: Effect.Effect<T, Error>): Promise<T> {
  return Effect.runPromise(effect)
}

export async function getVisitorCount(): Promise<VisitorCountResult> {
  const effect = Effect.tryPromise({
    try: async () => {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase
        .from('visitor_count')
        .select('count')
        .eq('id', 1)
        .single()

      if (error) {
        throw error
      }

      return { count: data?.count ?? 0 }
    },
    catch: (error) =>
      error instanceof Error ? error : new Error('Failed to fetch visitor count'),
  })

  return runEffect(
    effect.pipe(
      Effect.tapError((error) =>
        Effect.sync(() => {
          console.error('Error fetching visitor count:', error)
        })
      ),
      Effect.catchAll(() => Effect.succeed({ count: 0 }))
    )
  )
}

export async function incrementVisitorCount(): Promise<VisitorCountResult> {
  const effect = Effect.tryPromise({
    try: async () => {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase.rpc('increment_visitor_count')

      if (error) {
        throw error
      }

      return { count: data ?? 1 }
    },
    catch: (error) =>
      error instanceof Error
        ? error
        : new Error('Failed to increment visitor count'),
  })

  return runEffect(
    effect.pipe(
      Effect.tapError((error) =>
        Effect.sync(() => {
          console.error('Error incrementing visitor count:', error)
        })
      ),
      Effect.catchAll(() => Effect.succeed({ count: 1 }))
    )
  )
}

