{- | ショー全体の状態と 1 ステップ（1/60 秒）の物理。旧 engine.ts の状態更新部分に対応する。
描画とタイミング（requestAnimationFrame）は WASM 側の Ojoxux.Fireworks.Loop が持つ
-}
module Ojoxux.Core.Fireworks.Show (
    ShowState (..),
    DrawItem (..),
    newShow,
    step,
    drawItems,
    resizeShow,
    isFinished,
    isIdle,
    particleCount,
    launchAt,
    stepMs,
    maxDt,
    maxSteps,
    fadeAlpha,
    particleCap,
    drainSteps,
) where

import Control.Monad (replicateM)
import Control.Monad.State.Strict (runState)
import Data.List (partition)
import Data.Word (Word64)
import Ojoxux.Core.Fireworks.Palette (white)
import Ojoxux.Core.Fireworks.Particle (particleColor, updateParticle)
import Ojoxux.Core.Fireworks.Program (buildProgram)
import Ojoxux.Core.Fireworks.Random (Rand, rand, randInt, seeded)
import Ojoxux.Core.Fireworks.Shells (explodeShell)
import Ojoxux.Core.Fireworks.Types
import Ojoxux.Core.Round (roundHalfUp)
import System.Random.SplitMix (SMGen)

stepMs, maxDt, fadeAlpha :: Double
stepMs = 1000 / 60
maxDt = 100
fadeAlpha = 0.09

maxSteps, particleCap, drainSteps :: Int
maxSteps = 3
particleCap = 12000
drainSteps = 120

data ShowState = ShowState
    { showWidth :: !Double
    , showHeight :: !Double
    , pending :: ![(Double, Cue)]
    -- ^ 未発射の演目と打ち上げ時刻（ms）
    , shells :: ![Shell]
    , particles :: ![Particle]
    , elapsed :: !Double
    -- ^ ショー開始からの経過時間（ms、ステップ単位で進む）
    , drain :: !Int
    -- ^ すべて消えてからのステップ数。残光を拭い切るまで待つ
    , gen :: !SMGen
    }

-- | 描く 1 粒
data DrawItem = DrawItem
    { diX :: !Double
    , diY :: !Double
    , diSize :: !Double
    , diColor :: !Color
    , diAlpha :: !Double
    , diTrail :: !Bool
    }
    deriving (Eq, Show)

{- | riseSpeed は高さに対する比率かつ垂直成分なので、高さが約分されて
上昇時間がビューポートの高さに依存しない
-}
launchAt :: Cue -> Double
launchAt c = max 0 (at c - (1 - burstYRatio c) / riseSpeed c * stepMs)

newShow :: Word64 -> Double -> Double -> ShowState
newShow seed w h =
    let (program, g) = runState buildProgram (seeded seed)
     in ShowState
            { showWidth = w
            , showHeight = h
            , pending = [(launchAt c, c) | c <- program]
            , shells = []
            , particles = []
            , elapsed = 0
            , drain = 0
            , gen = g
            }

isIdle :: ShowState -> Bool
isIdle st = null (pending st) && null (shells st) && null (particles st)

isFinished :: ShowState -> Bool
isFinished st = drain st >= drainSteps

particleCount :: ShowState -> Int
particleCount = length . particles

withRand :: ShowState -> Rand a -> (a, ShowState)
withRand st r = let (a, g) = runState r (gen st) in (a, st{gen = g})

step :: ShowState -> ShowState
step st0 =
    let t = elapsed st0 + stepMs
        (due, rest) = partition ((<= t) . fst) (pending st0)
        h = showHeight st0
        w = showWidth st0
        ((shells', newParticles), st1) =
            withRand st0 $ do
                launched <- mapM (launchShell w h . snd) due
                moved <- mapM (moveShell h) (shells st0 ++ launched)
                let rising = [s | (Just s, _) <- moved]
                    born = concatMap snd moved
                pure (rising, born)
        -- 新しい粒子を先頭に置き、上限を超えた分は末尾（古い粒子）から捨てる
        combined = take particleCap (newParticles ++ particles st1)
        (particles', st2) = withRand st1 (concat <$> mapM advance combined)
        st3 = st2{pending = rest, shells = shells', particles = particles', elapsed = t}
     in st3{drain = if isIdle st3 then drain st0 + 1 else 0}

launchShell :: Double -> Double -> Cue -> Rand Shell
launchShell w h c = do
    let speed = riseSpeed c * h
    drift <- rand (-0.15) 0.15
    pure
        Shell
            { sx = xRatio c * w
            , sy = h
            , svx = drift * speed
            , sRiseSpeed = speed
            , burstY = burstYRatio c * h
            , sSpec = shell c
            , shellColor = case palette (shell c) of
                (col : _) -> col
                [] -> white
            }

-- | 玉を 1 ステップ上げる。破裂したら Nothing と星、そうでなければ玉と曲導の火の粉
moveShell :: Double -> Shell -> Rand (Maybe Shell, [Particle])
moveShell h s = do
    let s' = s{sx = sx s + svx s, sy = sy s - sRiseSpeed s}
    n <- randInt 1 3
    sparks <- replicateM n (spark h s')
    if sy s' <= burstY s'
        then do
            stars <- explodeShell (sSpec s') (sx s') (sy s') h
            pure (Nothing, sparks ++ stars)
        else pure (Just s', sparks)

-- | 曲導の火の粉
spark :: Double -> Shell -> Rand Particle
spark h s = do
    dx <- rand (-0.001) 0.001
    dy <- rand 0.0007 0.0027
    pure
        Particle
            { px = sx s
            , py = sy s
            , vx = dx * h
            , vy = dy * h
            , size = 1
            , drag = 0.94
            , gravity = 0.00007 * h
            , life = 18
            , maxLife = 18
            , colorStops = [shellColor s]
            , flicker = 0.25
            , trail = True
            , fadeExp = 1.2
            , split = Nothing
            }

-- | 粒子を 1 ステップ進める。寿命が尽きたら消え、千輪なら子星を出す（子星はこのステップでは動かさない）
advance :: Particle -> Rand [Particle]
advance p0 =
    let p = updateParticle p0
     in if life p > 0
            then pure [p]
            else maybe (pure []) (children p) (split p)

children :: Particle -> SplitSpec -> Rand [Particle]
children parent sp = replicateM (splitCount sp) $ do
    angle <- rand 0 (2 * pi)
    speedMul <- rand 0.5 1
    let speed = splitSpeed sp * speedMul
    pure
        Particle
            { px = px parent
            , py = py parent
            , vx = cos angle * speed
            , vy = sin angle * speed
            , size = splitSize sp
            , drag = 0.96
            , gravity = 0.045
            , life = splitLife sp
            , maxLife = splitLife sp
            , colorStops = splitColors sp
            , flicker = 0
            , trail = False
            , fadeExp = 1.4
            , split = Nothing
            }

-- | 描く粒子。明滅（flicker）で描かない粒子を間引くため乱数を進める
drawItems :: ShowState -> ([DrawItem], ShowState)
drawItems st = withRand st (concat <$> mapM toItem (particles st))
  where
    toItem p = do
        roll <- if flicker p > 0 then rand 0 1 else pure 1
        pure
            [ DrawItem
                { diX = fromIntegral (roundHalfUp (px p))
                , diY = fromIntegral (roundHalfUp (py p))
                , diSize = fromIntegral (size p)
                , diColor = particleColor p
                , diAlpha = (fromIntegral (life p) / fromIntegral (maxLife p)) ** fadeExp p
                , diTrail = trail p
                }
            | not (flicker p > 0 && roll < flicker p)
            ]

-- | canvas のサイズが変わったら、粒子と玉の座標をスケールする
resizeShow :: Double -> Double -> ShowState -> ShowState
resizeShow w h st
    | w <= 0 || h <= 0 = st
    | otherwise =
        st
            { showWidth = w
            , showHeight = h
            , particles = [p{px = px p * kx, py = py p * ky} | p <- particles st]
            , shells =
                [ s
                    { sx = sx s * kx
                    , sy = sy s * ky
                    , burstY = burstY s * ky
                    , svx = svx s * kx
                    , sRiseSpeed = sRiseSpeed s * ky
                    }
                | s <- shells st
                ]
            }
  where
    kx = w / showWidth st
    ky = h / showHeight st
