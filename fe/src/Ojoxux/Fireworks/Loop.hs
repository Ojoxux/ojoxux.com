{-# LANGUAGE OverloadedStrings #-}

{- | 花火のループ。旧 fe/js/fireworks/mount.ts と engine.ts（削除済み）のタイミング部分に対応する。
花火は同時に 1 つしか出ないので、動作中のハンドルはこのモジュールの IORef 1 つに持つ
-}
module Ojoxux.Fireworks.Loop (
    start,
    stop,
) where

import Control.Exception (finally, onException)
import Control.Monad (join, unless, void, when)
import Data.IORef (IORef, newIORef, readIORef, writeIORef)
import Data.Maybe (isJust)
import Data.Text qualified as T
import Miso (DOMRef)
import Miso.DSL (
    Function (..),
    JSVal,
    cancelAnimationFrame,
    freeFunction,
    fromJSValUnchecked,
    isNull,
    jsg,
    requestAnimationFrame,
    setField,
    syncCallback,
    syncCallback1,
    (!),
    (#),
 )
import Miso.String (MisoString, fromMisoString, ms)
import Ojoxux.Core.Fireworks.Program (Section, sectionAt)
import Ojoxux.Core.Fireworks.Show
import Ojoxux.Core.Fireworks.Stats (Stats, emptyStats, formatStats, record)
import Ojoxux.Ffi qualified as Ffi
import Ojoxux.Fireworks.Render
import System.IO.Unsafe (unsafePerformIO)

-- | 実サイズの 1/3 で保持し、CSS で拡大してドット感を出す
pixelScale :: Double
pixelScale = 3

data Handle = Handle
    { hStopped :: IORef Bool
    , hFrame :: IORef Int
    , hCleanup :: IORef (IO ())
    , hInFrame :: IORef Bool
    -- ^ フレームコールバックの実行中かどうか
    , hFreePending :: IORef Bool
    -- ^ 実行中に stop されたため、実行が終わったらフレームコールバックを解放する必要があるか
    }

{-# NOINLINE current #-}
current :: IORef (Maybe Handle)
current = unsafePerformIO (newIORef Nothing)

{- | 花火を始める。Miso の onCreated は要素の DOM 挿入前に呼ばれるので、1 フレーム待ってから測る。

GHC WASM のコールバックは freeFunction するまで解放されない。実行の途中でコールバックを解放すると危険だが、
最後の処理として自分を解放するのは問題ない。この 1 回限りのコールバックは本体の最後で自分を解放する。止められたときに未実行なら、stop 側が解放する。
-}
start :: DOMRef -> IO ()
start container = do
    running <- readIORef current
    unless (isJust running) $ do
        stopped <- newIORef False
        frameRef <- newIORef 0
        cleanup <- newIORef (pure ())
        inFrame <- newIORef False
        freePending <- newIORef False
        let handle = Handle stopped frameRef cleanup inFrame freePending
        writeIORef current (Just handle)
        cbRef <- newIORef (error "deferral callback not set")
        cb <- syncCallback1 $ \_ -> do
            -- 実行が始まったら stop 側の解放は不要になる（二重解放を防ぐ）
            writeIORef cleanup (pure ())
            isStopped <- readIORef stopped
            -- begin が例外で落ちても、current を空に戻してから自分を解放する
            unless isStopped (begin container handle `onException` writeIORef current Nothing)
                `finally` (freeFunction . Function =<< readIORef cbRef)
        writeIORef cbRef cb
        -- rAF が走る前に stop された場合は cb は実行されないので、stop 側で解放する
        writeIORef cleanup (freeFunction (Function cb))
        writeIORef frameRef =<< requestAnimationFrame cb

-- | 花火を止めて canvas とコールバックを片付ける
stop :: IO ()
stop = do
    running <- readIORef current
    case running of
        Nothing -> pure ()
        Just h -> do
            writeIORef (hStopped h) True
            cancelAnimationFrame =<< readIORef (hFrame h)
            join (readIORef (hCleanup h))
            writeIORef current Nothing

begin :: DOMRef -> Handle -> IO ()
begin container handle = do
    reduced <- Ffi.prefersReducedMotion
    (w0, h0) <- measure container
    ok <- (\cw ch -> cw > 0 && ch > 0) <$> rawWidth container <*> rawHeight container
    if reduced || not ok
        then writeIORef current Nothing
        else do
            doc <- jsg "document"
            trail <- (doc # "createElement") ("canvas" :: MisoString)
            sharp <- (doc # "createElement") ("canvas" :: MisoString)
            trailC <- (trail # "getContext") ("2d" :: MisoString)
            sharpC <- (sharp # "getContext") ("2d" :: MisoString)
            -- 2d 非対応の環境では getContext が null を返す。旧 TS 版と同じく花火を出さずに終わる
            noContext <- (||) <$> isNull trailC <*> isNull sharpC
            if noContext
                then writeIORef current Nothing
                else attach container handle trail sharp (Contexts trailC sharpC) w0 h0

-- | 2d コンテキストが取れた後の初期化。canvas を載せ、フレームとリサイズのコールバックを登録する
attach :: DOMRef -> Handle -> JSVal -> JSVal -> Contexts -> Double -> Double -> IO ()
attach container handle trail sharp contexts w0 h0 = do
    void $ (container # "append") (trail, sharp)
    let sizeCanvases w h = do
            setField trail "width" w
            setField trail "height" h
            setField sharp "width" w
            setField sharp "height" h
            setComposite contexts
    sizeCanvases w0 h0
    seed <- (round :: Double -> Integer) <$> now
    stRef <- newIORef (newShow (fromIntegral seed) w0 h0)
    cache <- newColorCache
    accRef <- newIORef 0
    lastRef <- newIORef =<< now
    statsOn <- statsEnabled
    statsRef <- newIORef (sectionAt 0, emptyStats)

    frameCbRef <- newIORef (error "frame callback not set")
    let frameBody tsVal = do
            writeIORef (hInFrame handle) True
            isStopped <- readIORef (hStopped handle)
            unless isStopped $ do
                ts <- fromJSValUnchecked tsVal
                lastTs <- readIORef lastRef
                writeIORef lastRef ts
                let dt = min (ts - lastTs) maxDt
                acc0 <- (+ dt) <$> readIORef accRef
                t0 <- now
                _ <- runSteps contexts stRef acc0 accRef
                t1 <- now
                st <- readIORef stRef
                let (items, st') = drawItems st
                writeIORef stRef $! st'
                drawFrame cache contexts (showWidth st) (showHeight st) items
                t2 <- now
                when statsOn $ recordStats statsRef st dt (t1 - t0) (t2 - t1)
                if isFinished st'
                    then do
                        when statsOn (flushStats statsRef)
                        clearAll contexts (showWidth st') (showHeight st')
                        stop
                    else writeIORef (hFrame handle) =<< requestAnimationFrame =<< readIORef frameCbRef
    -- 本体が例外で抜けても実行中フラグは必ず戻す。この実行中に stop されていたら、ここで自分を解放する。
    -- 以降は呼ばれないので、本体の最後の処理として安全
    let finishFrame = do
            writeIORef (hInFrame handle) False
            pending <- readIORef (hFreePending handle)
            when pending $ do
                cancelAnimationFrame =<< readIORef (hFrame handle)
                freeFunction . Function =<< readIORef frameCbRef
    frameCb <- syncCallback1 $ \tsVal -> frameBody tsVal `finally` finishFrame
    writeIORef frameCbRef frameCb

    resizeCb <- syncCallback $ do
        (w, h) <- measure container
        sizeCanvases w h
        st <- readIORef stRef
        writeIORef stRef $! resizeShow w h st
    win <- jsg "window"
    void $ (win # "addEventListener") ("resize" :: MisoString, resizeCb)

    writeIORef (hCleanup handle) $ do
        void $ (win # "removeEventListener") ("resize" :: MisoString, resizeCb)
        void $ (trail # "remove") ()
        void $ (sharp # "remove") ()
        freeFunction (Function resizeCb)
        -- 実行中なら実行が終わるまで frameCb の解放を待つ。そうでなければ今すぐ解放する
        inFrame <- readIORef (hInFrame handle)
        if inFrame
            then writeIORef (hFreePending handle) True
            else freeFunction (Function frameCb)
        -- 止めたときに状態を小さくしてメモリを手放す（粒子が残ったまま保持されないように）
        writeIORef stRef $! newShow 0 1 1

    writeIORef (hFrame handle) =<< requestAnimationFrame frameCb

-- | 固定ステップで物理を進める。残光の減衰は物理ステップと同じ回数だけかけ、コマ落ちしても尾の長さを変えない
runSteps :: Contexts -> IORef ShowState -> Double -> IORef Double -> IO Int
runSteps contexts stRef acc0 accRef = go acc0 0
  where
    go acc n
        | acc >= stepMs && n < maxSteps = do
            st <- readIORef stRef
            fadeTrail contexts (showWidth st) (showHeight st)
            writeIORef stRef $! step st
            go (acc - stepMs) (n + 1)
        | otherwise = do
            writeIORef accRef (if n == maxSteps then 0 else acc)
            pure n

measure :: JSVal -> IO (Double, Double)
measure container = do
    w <- rawWidth container
    h <- rawHeight container
    pure (max 1 (fromIntegral (ceiling (w / pixelScale) :: Int)), max 1 (fromIntegral (ceiling (h / pixelScale) :: Int)))

rawWidth, rawHeight :: JSVal -> IO Double
rawWidth container = fromJSValUnchecked =<< container ! "offsetWidth"
rawHeight container = fromJSValUnchecked =<< container ! "offsetHeight"

now :: IO Double
now = do
    perf <- jsg "performance"
    fromJSValUnchecked =<< (perf # "now") ()

statsEnabled :: IO Bool
statsEnabled = do
    loc <- jsg "location"
    search <- fromJSValUnchecked =<< loc ! "search" :: IO MisoString
    pure (T.isInfixOf "fireworks-stats" (fromMisoString search))

recordStats :: IORef (Section, Stats) -> ShowState -> Double -> Double -> Double -> IO ()
recordStats ref st dt physics render = do
    (section, stats) <- readIORef ref
    let section' = sectionAt (elapsed st)
    if section' /= section
        then do
            logStats section stats
            writeIORef ref (section', record dt physics render (particleCount st) emptyStats)
        else writeIORef ref (section, record dt physics render (particleCount st) stats)

flushStats :: IORef (Section, Stats) -> IO ()
flushStats ref = do
    (section, stats) <- readIORef ref
    logStats section stats

logStats :: Section -> Stats -> IO ()
logStats section stats = do
    console <- jsg "console"
    void $ (console # "info") (ms (formatStats section stats))
