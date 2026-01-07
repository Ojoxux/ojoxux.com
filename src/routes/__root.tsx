import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import appCss from '../styles.css?url'
import pixelFont from '../assets/fonts/dot_font.woff?url'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        retry: 1,
      },
    },
  })
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'ojoxux.com',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'preload',
        href: pixelFont,
        as: 'font',
        type: 'font/woff',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'icon',
        href: '/favicon-32.ico',
        sizes: '32x32',
      },
      {
        rel: 'icon',
        href: '/favicon-16.ico',
        sizes: '16x16',
      },
    ],
  }),

  wrapInSuspense: true,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'PixelFont';
              src: url('${pixelFont}') format('woff');
              font-weight: normal;
              font-style: normal;
              font-display: swap;
            }
          `
        }} />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: 'React Query',
              render: <ReactQueryDevtools />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
