module Ojoxux.Core.WakaTime (rowBlocks, filledBlocks) where

import Ojoxux.Core.Round (roundHalfUp)

-- | 言語ごとのバーを構成するブロック数
rowBlocks :: Int
rowBlocks = 10

-- | パーセントをブロック数に変換する。結果は 0..rowBlocks に収める
filledBlocks :: Double -> Int
filledBlocks percent =
    max 0 (min rowBlocks (roundHalfUp (percent / 100 * fromIntegral rowBlocks)))
