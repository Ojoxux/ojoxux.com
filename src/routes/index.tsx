import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Snowflake } from 'lucide-react'
import PixelSnow from '../components/PixelSnow'
import VisitorCounter, { visitorCountQueryOptions } from '../components/VisitorCounter'

export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(visitorCountQueryOptions())
  },
  component: Home,
})

function Home() {
  const [showSnow, setShowSnow] = useState(true)

  return (
    <div className="relative min-h-screen bg-black">
      {showSnow && (
        <PixelSnow
          color="#ffffff"
          flakeSize={0.012}
          minFlakeSize={1.3}
          pixelResolution={200}
          speed={1.25}
          depthFade={7}
          farPlane={15}
          brightness={1.5}
          gamma={0.4545}
          density={0.2}
          variant="round"
          direction={125}
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <VisitorCounter />
        </div>
      </div>
      <button
        onClick={() => setShowSnow(!showSnow)}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        aria-label={showSnow ? '雪を非表示' : '雪を表示'}
      >
        <Snowflake
          className={`w-6 h-6 transition-colors ${showSnow ? 'text-white' : 'text-white/40'}`}
        />
      </button>
    </div>
  )
}
