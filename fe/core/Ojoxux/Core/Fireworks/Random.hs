-- | splitmix を State で回す乱数。旧 random.ts の Math.random を置き換える
module Ojoxux.Core.Fireworks.Random (
    Rand,
    seeded,
    rand,
    randInt,
    pick,
) where

import Control.Monad.State.Strict (State, state)
import Data.Word (Word64)
import System.Random.SplitMix (SMGen, mkSMGen, nextDouble)

type Rand = State SMGen

seeded :: Word64 -> SMGen
seeded = mkSMGen

-- | [lo, hi) の一様乱数
rand :: Double -> Double -> Rand Double
rand lo hi = state $ \g ->
    let (d, g') = nextDouble g
     in (d * (hi - lo) + lo, g')

-- | [lo, hi) の整数
randInt :: Int -> Int -> Rand Int
randInt lo hi = floor <$> rand (fromIntegral lo) (fromIntegral hi)

-- | リストから 1 つ選ぶ。空リストは呼び出し側で渡さないこと
pick :: [a] -> Rand a
pick xs = (xs !!) <$> randInt 0 (length xs)
