import { Effect } from 'effect'
import HomeClient from '@/components/HomeClient'
import { BasePage } from '@/lib/runtime'

const HomePage = Effect.fn('HomePage')(() => Effect.succeed(<HomeClient />))

export default BasePage.build(HomePage)

