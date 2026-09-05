import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import withStylexTurbopack from '@stylexswc/nextjs-plugin/turbopack'

const nextConfig: NextConfig = withStylexTurbopack({
  rsOptions: {
    dev: process.env.NODE_ENV === 'development',
  },
})({})

export default nextConfig

initOpenNextCloudflareForDev()
