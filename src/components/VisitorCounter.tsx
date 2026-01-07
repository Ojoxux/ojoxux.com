import { Suspense } from 'react'
import { useSuspenseQuery, useQueryClient, queryOptions } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { incrementVisitorCount, getVisitorCount } from '../server/visitor-count'

async function fetchVisitorCount() {
  try {
    const data = await incrementVisitorCount()
    return data.count
  } catch (error) {
    console.error('Failed to increment visitor count:', error)
    try {
      const data = await getVisitorCount()
      return data.count
    } catch (err) {
      console.error('Failed to fetch visitor count:', err)
      return 0
    }
  }
}

export function visitorCountQueryOptions() {
  return queryOptions({
    queryKey: ['visitor-count'],
    queryFn: fetchVisitorCount,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: 1,
  })
}

function VisitorCount() {
  const { data: count } = useSuspenseQuery(visitorCountQueryOptions())

  return (
    <div className="flex flex-col items-center justify-center text-white font-pixel z-10">
      <div className="relative">
        <div 
          className="text-[20vw] font-bold leading-none tracking-wider text-white drop-shadow-[8px_8px_0_#4b5563] select-none"
          style={{ fontFamily: 'PixelFont, monospace' }}
        >
          {count.toLocaleString()}
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center text-white/80 font-pixel">
      <div className="text-2xl animate-pulse tracking-widest">LOADING...</div>
    </div>
  )
}

function ErrorFallback({ resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  const queryClient = useQueryClient()

  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['visitor-count'] })
    resetErrorBoundary()
  }

  return (
    <div className="flex flex-col items-center justify-center text-white/80 font-pixel gap-4">
      <div className="text-2xl tracking-widest">ERROR!</div>
      <button 
        onClick={handleRetry}
        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded border border-white/30 transition-colors"
      >
        RETRY
      </button>
    </div>
  )
}

export default function VisitorCounter() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={<LoadingFallback />}>
        <VisitorCount />
      </Suspense>
    </ErrorBoundary>
  )
}

