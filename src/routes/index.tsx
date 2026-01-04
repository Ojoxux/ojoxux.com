import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Coming Soon</h1>
      <p className="mt-4">This site is under construction.</p>
    </div>
  )
}
