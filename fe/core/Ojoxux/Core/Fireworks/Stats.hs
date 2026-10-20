-- | ?fireworks-stats のときの計測値。区間ごとに集めて 1 行に整形する
module Ojoxux.Core.Fireworks.Stats (
    Stats,
    emptyStats,
    record,
    statFrames,
    statMean,
    statP95,
    statMaxParticles,
    formatStats,
) where

import Data.List (sort)
import Data.Text (Text)
import Data.Text qualified as T
import Numeric (showFFloat)
import Ojoxux.Core.Fireworks.Program (Section)

data Stats = Stats
    { dts :: ![Double]
    , physicsTotal :: !Double
    , renderTotal :: !Double
    , statMaxParticles :: !Int
    }

emptyStats :: Stats
emptyStats = Stats [] 0 0 0

-- | 1 フレーム分を記録する（フレーム間隔、物理と描画の所要時間 ms、粒子数）
record :: Double -> Double -> Double -> Int -> Stats -> Stats
record dt physics render n s =
    s
        { dts = dt : dts s
        , physicsTotal = physicsTotal s + physics
        , renderTotal = renderTotal s + render
        , statMaxParticles = max n (statMaxParticles s)
        }

statFrames :: Stats -> Int
statFrames = length . dts

statMean :: Stats -> Double
statMean s
    | null (dts s) = 0
    | otherwise = sum (dts s) / fromIntegral (statFrames s)

-- | 95 パーセンタイル（ソートして floor (n * 0.95) 番目、0 始まり）
statP95 :: Stats -> Double
statP95 s = case sort (dts s) of
    [] -> 0
    sorted -> sorted !! min (length sorted - 1) (floor (fromIntegral (length sorted) * 0.95 :: Double))

formatStats :: Section -> Stats -> Text
formatStats section s =
    T.pack $
        "[fireworks:hs] "
            <> show section
            <> " frames="
            <> show (statFrames s)
            <> " mean="
            <> fixed 1 (statMean s)
            <> "ms p95="
            <> fixed 1 (statP95 s)
            <> "ms physics="
            <> fixed 2 (perFrame (physicsTotal s))
            <> "ms render="
            <> fixed 2 (perFrame (renderTotal s))
            <> "ms maxParticles="
            <> show (statMaxParticles s)
  where
    perFrame total = if statFrames s == 0 then 0 else total / fromIntegral (statFrames s)
    fixed digits x = showFFloat (Just digits) x ""
