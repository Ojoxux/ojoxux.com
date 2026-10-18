{-# LANGUAGE OverloadedStrings #-}

module Ojoxux.Core.CountUp
  ( countDurationMs
  , easeOutCubic
  , countValueAt
  , formatWithSeparator
  ) where

import Data.Text (Text)
import qualified Data.Text as T
import Ojoxux.Core.Round (roundHalfUp)

-- | カウントアップにかける時間（現行の duration=1 秒）
countDurationMs :: Double
countDurationMs = 1000

-- | ease-out（3 次）。入力は 0..1 に丸める
easeOutCubic :: Double -> Double
easeOutCubic t = 1 - (1 - clamped) ^ (3 :: Int)
  where
    clamped = max 0 (min 1 t)

-- | 開始からの経過ミリ秒に対する表示値
countValueAt :: Int -> Double -> Int
countValueAt target elapsedMs =
  roundHalfUp (fromIntegral target * easeOutCubic (elapsedMs / countDurationMs))

-- | 3 桁ごとにカンマで区切る（現行の separator="," と同じ）。
-- minBound の符号反転でオーバーフローしないよう Integer で扱う
formatWithSeparator :: Int -> Text
formatWithSeparator n
  | n < 0 = "-" <> groupDigits (abs (toInteger n))
  | otherwise = groupDigits (toInteger n)
  where
    groupDigits :: Integer -> Text
    groupDigits =
      T.intercalate "," . reverse . map T.reverse . T.chunksOf 3 . T.reverse . T.pack . show
