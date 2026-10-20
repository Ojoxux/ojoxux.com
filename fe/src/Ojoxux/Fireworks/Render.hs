{-# LANGUAGE OverloadedStrings #-}

-- | 花火の描画。Miso.Canvas で 2 枚の canvas（残光用と輪郭用）に描く
module Ojoxux.Fireworks.Render (
    Contexts (..),
    ColorCache,
    newColorCache,
    setComposite,
    fadeTrail,
    drawFrame,
    clearAll,
) where

import Control.Monad (forM_)
import Control.Monad.Reader (runReaderT)
import Data.IORef (IORef, modifyIORef', newIORef, readIORef)
import Data.Map.Strict qualified as Map
import Miso.Canvas (CompositeOperation (..), clearRect, fillRect, globalAlpha, globalCompositeOperation, set)
import Miso.DSL (JSVal, setField, toJSVal)
import Miso.String (MisoString, ms)
import Ojoxux.Core.Fireworks.Show (DrawItem (..))
import Ojoxux.Core.Fireworks.Types (Color)

data Contexts = Contexts
    { trailCtx :: JSVal
    , sharpCtx :: JSVal
    }

{- | 1 粒を描く。Miso.Canvas 経由だと 1 粒あたり 3 回の呼び出しと複数の JSVal ハンドルが要り、
フィナーレ（約 4000 粒）で 1 フレーム 15ms かかったので、1 回の呼び出しにまとめる
-}
foreign import javascript unsafe "$1.globalAlpha = $2; $1.fillStyle = $3; $1.fillRect($4, $5, $6, $6);"
    drawDot :: JSVal -> Double -> JSVal -> Double -> Double -> Double -> IO ()

-- | 色の JSVal を使い回す（色は十数種類しかない）
type ColorCache = IORef (Map.Map Color JSVal)

newColorCache :: IO ColorCache
newColorCache = newIORef Map.empty

cachedColor :: ColorCache -> Color -> IO JSVal
cachedColor cache c = do
    m <- readIORef cache
    case Map.lookup c m of
        Just v -> pure v
        Nothing -> do
            v <- toJSVal (ms c)
            modifyIORef' cache (Map.insert c v)
            pure v

-- | 加算合成にする。canvas のサイズを変えるとリセットされるので、そのたびに呼ぶ
setComposite :: Contexts -> IO ()
setComposite cs = forM_ [trailCtx cs, sharpCtx cs] (runReaderT (globalCompositeOperation Lighter))

-- | 残光を少しずつ消す。物理ステップと同じ回数だけ呼ぶ
fadeTrail :: Contexts -> Double -> Double -> IO ()
fadeTrail cs w h = flip runReaderT (trailCtx cs) $ do
    globalCompositeOperation DestinationOut
    globalAlpha 1
    -- show 0.09 は "9.0e-2" になり CSS として読めないので、文字列で直接持つ（Show.fadeAlpha と同じ値）
    set "fillStyle" ("rgba(0, 0, 0, 0.09)" :: MisoString)
    fillRect (0, 0, w, h)
    globalCompositeOperation Lighter

{- | 1 フレーム分の粒子を描く。
粒子ごとの描画は drawDot の 1 回の JS 呼び出しにまとめる。色は cachedColor で JSVal を使い回す
-}
drawFrame :: ColorCache -> Contexts -> Double -> Double -> [DrawItem] -> IO ()
drawFrame cache cs w h items = do
    runReaderT (clearRect (0, 0, w, h)) (sharpCtx cs)
    forM_ items $ \d -> do
        col <- cachedColor cache (diColor d)
        let ctx = if diTrail d then trailCtx cs else sharpCtx cs
        drawDot ctx (diAlpha d) col (diX d) (diY d) (diSize d)
    forM_ [trailCtx cs, sharpCtx cs] (\c -> setField c ("globalAlpha" :: MisoString) (1 :: Double))

clearAll :: Contexts -> Double -> Double -> IO ()
clearAll cs w h = forM_ [trailCtx cs, sharpCtx cs] (runReaderT (clearRect (0, 0, w, h)))
