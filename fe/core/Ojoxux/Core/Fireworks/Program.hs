{-# LANGUAGE LambdaCase #-}

-- | 約 58 秒の演目。旧 program.ts に対応する
module Ojoxux.Core.Fireworks.Program (
    buildProgram,
    Section (..),
    sectionAt,
    riseSpeedFor,
) where

import Data.List (sortOn)
import Ojoxux.Core.Fireworks.Palette (gin, iroHenkaPairs, kin, nishiki, saishiki)
import Ojoxux.Core.Fireworks.Random (Rand, pick, rand)
import Ojoxux.Core.Fireworks.Types

-- | 高さに対する比率で持つと、上昇時間がビューポートの高さに依存しない
riseSpeedFor :: Grade -> Double
riseSpeedFor = \case
    Small -> 0.0087
    Medium -> 0.01
    Large -> 0.0113
    XLarge -> 0.0127

cue :: Double -> ShellSpec -> Double -> Double -> Cue
cue t s xr by = Cue{at = t, shell = s, xRatio = xr, burstYRatio = by, riseSpeed = riseSpeedFor (grade s)}

clamp01 :: Double -> Double
clamp01 = max 0 . min 1

shellFor :: Kind -> Grade -> Rand ShellSpec
shellFor k g = case k of
    Kamuro -> pure (shellSpec k g kin)
    IroHenka -> shellSpec k g <$> pick iroHenkaPairs
    ShinIri -> (\c -> (shellSpec k g [c]){corePalette = Just gin}) <$> pick saishiki
    _ -> (\c -> shellSpec k g [c]) <$> pick saishiki

openingCues :: Rand [Cue]
openingCues = do
    c1 <- pick saishiki
    pair <- pick iroHenkaPairs
    pure
        [ cue 1500 (shellSpec Kiku XLarge nishiki) 0.5 0.34
        , cue 5000 (shellSpec ShinIri XLarge [c1]){corePalette = Just gin} 0.3 0.36
        , cue 8500 (shellSpec IroHenka XLarge pair) 0.7 0.38
        ]

firstActCues :: Rand [Cue]
firstActCues = go 10000 [Kiku, Botan, Senrin, IroHenka, Botan, ShinIri, Senrin, Kiku]
  where
    go _ [] = pure []
    go t (k : ks) = do
        s <- shellFor k Medium
        xr <- rand 0.15 0.85
        by <- rand 0.25 0.45
        dt <- rand 1400 1900
        (cue t s xr by :) <$> go (t + dt) ks

starmineCues :: Rand [Cue]
starmineCues = go start
  where
    start = 22000
    end = 31500
    go t
        | t > end = pure []
        | otherwise = do
            let progress = (t - start) / (end - start)
                sweep = 0.5 + sin (progress * pi * 3) * 0.35
            roll <- rand 0 1
            s <- shellFor (if roll < 0.8 then Botan else Kiku) Small
            jitter <- rand (-0.08) 0.08
            by <- rand 0.3 0.55
            dt <- rand 150 270
            (cue t s (clamp01 (sweep + jitter)) by :) <$> go (t + dt)

interludeCues :: Rand [Cue]
interludeCues =
    pure
        [ cue 32500 (shellSpec Kamuro Large kin) 0.35 0.26
        , cue 35000 (shellSpec Senrin Medium gin) 0.65 0.3
        , cue 37500 (shellSpec Kamuro Large kin) 0.5 0.24
        , goldRain 40000 0.25
        , goldRain 40600 0.5
        , goldRain 41200 0.75
        ]
  where
    goldRain t xr = cue t (shellSpec Kamuro Small kin){lifeScale = 1.3} xr 0.18

secondStarmineCues :: Rand [Cue]
secondStarmineCues = go 43500 (0 :: Int)
  where
    end = 50500
    go t i
        | t > end = pure []
        | otherwise = do
            let g = if i `mod` 3 == 0 then Medium else Small
            xr <- if even i then rand 0.12 0.45 else rand 0.55 0.88
            pair <- pick iroHenkaPairs
            by <- rand 0.28 0.5
            dt <- rand 120 210
            (cue t (shellSpec IroHenka g pair) xr by :) <$> go (t + dt) (i + 1)

finaleCues :: Rand [Cue]
finaleCues = concat <$> mapM atTime [51000 :: Int, 51130 .. 56500]
  where
    atTime t = mapM (const (one (fromIntegral t))) [1 :: Int, 2]
    one t = do
        roll <- rand 0 1
        s <-
            if roll < 0.4
                then pure (shellSpec Kamuro Large kin){countScale = 0.85}
                else do
                    c <- pick saishiki
                    pure $
                        if roll < 0.8
                            then (shellSpec Kiku Large [c]){countScale = 0.85}
                            else (shellSpec ShinIri Large [c]){corePalette = Just gin, countScale = 0.85}
        dt <- rand 0 60
        xr <- rand 0.08 0.92
        by <- rand 0.26 0.54
        pure (cue (t + dt) s xr by)

-- | 56.5s のフィナーレ最終破裂から 1.7 秒の間を置く
tomedamaCues :: Rand [Cue]
tomedamaCues =
    pure
        [ cue
            58200
            (shellSpec ShinIri XLarge nishiki){corePalette = Just gin, triple = True, lifeScale = 1.4}
            0.5
            0.34
        ]

buildProgram :: Rand [Cue]
buildProgram =
    sortOn at . concat
        <$> sequence [openingCues, firstActCues, starmineCues, interludeCues, secondStarmineCues, finaleCues, tomedamaCues]

-- | 計測で使う演目の区間
data Section = Opening | FirstAct | Starmine | Interlude | SecondStarmine | Finale | Tomedama
    deriving (Eq, Show)

-- | 経過時間（ms）が属する区間
sectionAt :: Double -> Section
sectionAt t
    | t < 10000 = Opening
    | t < 22000 = FirstAct
    | t < 32500 = Starmine
    | t < 43500 = Interlude
    | t < 51000 = SecondStarmine
    | t < 58200 = Finale
    | otherwise = Tomedama
