'use client'

import { Suspense, useEffect, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { getVisitorCount, incrementVisitorCount } from '@/app/actions/visitor-count'

function VisitorCount() {
  const [count, setCount] = useState<number | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const data = await incrementVisitorCount()
        if (!cancelled) {
          setCount(data.count)
        }
      } catch (incrementError) {
        console.error('Failed to increment visitor count:', incrementError)
        try {
          const data = await getVisitorCount()
          if (!cancelled) {
            setCount(data.count)
          }
        } catch (fetchError) {
          console.error('Failed to fetch visitor count:', fetchError)
          if (!cancelled) {
            setError(fetchError instanceof Error ? fetchError : new Error('Unknown error'))
          }
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    throw error
  }

  if (count === null) {
    return <LoadingFallback />
  }

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

function ErrorFallback({
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center text-white/80 font-pixel gap-4">
      <div className="text-2xl tracking-widest">ERROR!</div>
      <button
        type="button"
        onClick={resetErrorBoundary}
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

