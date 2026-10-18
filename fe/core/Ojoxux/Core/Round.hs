module Ojoxux.Core.Round (roundHalfUp) where

-- | JS の Math.round と同じ丸め（.5 は +∞ 方向）。
-- Haskell の round は偶数丸めなので、現行の見た目と揃えるためにこちらを使う。
roundHalfUp :: Double -> Int
roundHalfUp x = floor (x + 0.5)
