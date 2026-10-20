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

import Control.Monad (forM_, when)
import Control.Monad.Reader (runReaderT)
import Data.IORef (IORef, modifyIORef', newIORef, readIORef, writeIORef)
import Data.Map.Strict qualified as Map
import Miso.Canvas (CompositeOperation (..), clearRect, fillRect, globalAlpha, globalCompositeOperation, set)
import Miso.DSL (JSVal, setField)
import Miso.String (MisoString, ms)
import Ojoxux.Core.Fireworks.Show (DrawItem (..))
import Ojoxux.Core.Fireworks.Types (Color)

data Contexts = Contexts
    { trailCtx :: JSVal
    , sharpCtx :: JSVal
    }

-- | 色の文字列を JS 側の文字列に変換した結果を使い回す（色は十数種類しかない）
type ColorCache = IORef (Map.Map Color MisoString)

newColorCache :: IO ColorCache
newColorCache = newIORef Map.empty

cachedColor :: ColorCache -> Color -> IO MisoString
cachedColor cache c = do
    m <- readIORef cache
    case Map.lookup c m of
        Just s -> pure s
        Nothing -> do
            let s = ms c
            modifyIORef' cache (Map.insert c s)
            pure s

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
Miso.Canvas の set / globalAlpha は値を 1 要素の配列に包んで渡すので、粒子ごとの書き込みは setField で直接行う。
fillStyle は同じ色が続くあいだ書き直さない（フレームごとに ctx ごとの最後の色を覚える）
-}
drawFrame :: ColorCache -> Contexts -> Double -> Double -> [DrawItem] -> IO ()
drawFrame cache cs w h items = do
    runReaderT (clearRect (0, 0, w, h)) (sharpCtx cs)
    lastTrail <- newIORef Nothing
    lastSharp <- newIORef Nothing
    forM_ items $ \d -> do
        col <- cachedColor cache (diColor d)
        let trail = diTrail d
            ctx = if trail then trailCtx cs else sharpCtx cs
            lastRef = if trail then lastTrail else lastSharp
        setField ctx ("globalAlpha" :: MisoString) (diAlpha d)
        prev <- readIORef lastRef
        when (prev /= Just (diColor d)) $ do
            setField ctx ("fillStyle" :: MisoString) col
            writeIORef lastRef (Just (diColor d))
        runReaderT (fillRect (diX d, diY d, diSize d, diSize d)) ctx
    forM_ [trailCtx cs, sharpCtx cs] (\c -> setField c ("globalAlpha" :: MisoString) (1 :: Double))

clearAll :: Contexts -> Double -> Double -> IO ()
clearAll cs w h = forM_ [trailCtx cs, sharpCtx cs] (runReaderT (clearRect (0, 0, w, h)))
