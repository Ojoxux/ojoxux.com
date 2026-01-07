import { createFileRoute } from '@tanstack/react-router'
import PixelSnow from '../components/PixelSnow'
import VisitorCounter, { visitorCountQueryOptions } from '../components/VisitorCounter'

export const Route = createFileRoute('/')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(visitorCountQueryOptions())
  },
  component: Home,
})

function Home() {
  return (
    <div className="relative min-h-screen bg-black">
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
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <VisitorCounter />
        </div>
      </div>
    </div>
  )
}
