{-# LANGUAGE LambdaCase #-}

-- | 玉の破裂で星を生成する。旧 shells.ts に対応する
module Ojoxux.Core.Fireworks.Shells (
    GradeParams (..),
    gradeParams,
    explodeShell,
) where

import Control.Monad (forM, replicateM)
import Data.Maybe (fromMaybe)
import Ojoxux.Core.Fireworks.Palette (gin, kin, white)
import Ojoxux.Core.Fireworks.Random (Rand, pick, rand, randInt)
import Ojoxux.Core.Fireworks.Types
import Ojoxux.Core.Round (roundHalfUp)

data GradeParams = GradeParams
    { gradeCount :: !Int
    , radiusMin :: !Double
    -- ^ canvas の高さに対する比率。解像度に依存しないようにするため
    , radiusMax :: !Double
    , gradeLifeScale :: !Double
    }

{- | 星の数は半径とセットで決める。星が 1 粒ずつ判別できるには外周で 3〜4px
程度の間隔が要るので、上限はおおよそ 2πr / 3.5 になる
-}
gradeParams :: Grade -> GradeParams
gradeParams = \case
    Small -> GradeParams 38 0.065 0.1 0.85
    Medium -> GradeParams 65 0.105 0.16 1.0
    Large -> GradeParams 118 0.19 0.25 1.15
    XLarge -> GradeParams 160 0.26 0.32 1.5

-- | 星 1 つの作り方
data Recipe = Recipe
    { rDrag :: Double
    , rSpeedScale :: Double
    , rFallPerSecond :: Double
    -- ^ 終端落下速度を「1 秒で画面高さの何割落ちるか」で指定する
    , rColors :: Rand [Color]
    , rLife :: (Double, Double)
    , rFadeExp :: Double
    , rTrail :: Bool
    , rFlicker :: Double
    , rSplit :: Rand (Maybe SplitSpec)
    }

baseRecipe :: Double -> Double -> Rand [Color] -> (Double, Double) -> Recipe
baseRecipe d fall colors lifeRange =
    Recipe
        { rDrag = d
        , rSpeedScale = 1
        , rFallPerSecond = fall
        , rColors = colors
        , rLife = lifeRange
        , rFadeExp = 1
        , rTrail = True
        , rFlicker = 0
        , rSplit = pure Nothing
        }

explodeShell :: ShellSpec -> Double -> Double -> Double -> Rand [Particle]
explodeShell s x y height = do
    -- 半径は 1 発につき 1 回だけ決める。星ごとに引き直すと球殻ではなく円盤になる
    shellRadius <- rand (radiusMin g) (radiusMax g)
    let star r = do
            jitter <- rand 0.96 1.04
            colors <- rColors r
            sz <- randInt 1 3
            lf <- (\v -> roundHalfUp (v * lifeMul)) <$> uncurry rand (rLife r)
            sp <- rSplit r
            let
                -- 指数減衰する星の到達距離は 初速 / (1 - drag)。目標半径から逆算する
                speed = shellRadius * jitter * height * rSpeedScale r * (1 - rDrag r)
            makeStar
                speed
                Particle
                    { px = x
                    , py = y
                    , vx = 0
                    , vy = 0
                    , size = sz
                    , drag = rDrag r
                    , gravity = rFallPerSecond r * height / 60 * (1 - rDrag r)
                    , life = lf
                    , maxLife = lf
                    , colorStops = colors
                    , flicker = rFlicker r
                    , trail = rTrail r
                    , fadeExp = rFadeExp r
                    , split = sp
                    }
    case kind s of
        Kiku -> replicateM count (star (baseRecipe 0.975 0.08 single (70, 100)))
        Botan ->
            replicateM count (star (baseRecipe 0.965 0.11 single (40, 60)){rFadeExp = 1.6, rTrail = False})
        Kamuro ->
            replicateM
                count
                (star (baseRecipe 0.992 0.32 (one kin) (160, 220)){rSpeedScale = 0.8, rFadeExp = 0.6, rFlicker = 0.12})
        Senrin -> do
            childColor <- pick pal
            let child = do
                    n <- randInt 8 13
                    pure . Just $
                        SplitSpec
                            { splitCount = n
                            , -- 子星の drag は 0.96 固定。半径は画面高さの 5%
                              splitSpeed = 0.05 * height * (1 - 0.96)
                            , splitSize = 1
                            , splitLife = 22
                            , splitColors = [childColor]
                            }
            replicateM count (star (baseRecipe 0.97 0.1 single (35, 45)){rSplit = child})
        ShinIri -> do
            let core = fromMaybe gin (corePalette s)
                layers
                    | triple s = [(1, pal, 0.6), (0.6, core, 0.25), (0.32, gin, 0.15)]
                    | otherwise = [(1, pal, 0.7), (0.45, core, 0.3)]
            concat
                <$> forM
                    layers
                    ( \(scale, colors, ratio) ->
                        replicateM
                            (roundHalfUp (fromIntegral count * ratio))
                            (star (baseRecipe 0.975 0.08 (one colors) (75, 105)){rSpeedScale = scale})
                    )
        IroHenka -> do
            let from = case pal of
                    (c : _) -> c
                    [] -> white
                to = case pal of
                    (_ : c : _) -> c
                    _ -> from
            replicateM count (star (baseRecipe 0.975 0.08 (pure [from, to]) (70, 100)))
  where
    g = gradeParams (grade s)
    pal = palette s
    count = roundHalfUp (fromIntegral (gradeCount g) * countScale s)
    lifeMul = gradeLifeScale g * lifeScale s
    one colors = (: []) <$> pick colors
    single = one pal

{- | 3 次元の球面上の一様な点を平面に投影する。外周が密になり真球に見える。
速さ speed で向きを決め、vx / vy に振り分ける
-}
makeStar :: Double -> Particle -> Rand Particle
makeStar speed p = do
    z <- rand (-1) 1
    theta <- rand 0 (2 * pi)
    let radius = sqrt (1 - z * z)
    pure p{vx = cos theta * radius * speed, vy = sin theta * radius * speed}
