{- | miso の rAFSub の代わりに使う、毎フレーム action を送る Sub。

miso 1.14.0.0 の rAFSub は、コールバックの中で sink を呼んだ後に次のフレームを登録する。
sink の間に stopSub で release が走るとコールバックが解放され、その後に解放済みのコールバックを
次のフレームに登録してしまい、getJSVal で落ちる。カウントアップは最後のフレームで stopSub するので
毎回この状態になる。

ここでは、実行中に止められた場合は解放をコールバック側に任せ、コールバックが最後の処理として自分を解放する
（Ojoxux.Fireworks.Loop と同じ方針）。
-}
module Ojoxux.FrameSub (frameSub) where

import Control.Exception (finally)
import Control.Monad (unless, when)
import Data.IORef (newIORef, readIORef, writeIORef)
import Miso (Sub)
import Miso.DSL (
    Function (..),
    cancelAnimationFrame,
    freeFunction,
    fromJSValUnchecked,
    requestAnimationFrame,
    syncCallback1,
 )
import Miso.Subscription.Util (createSub)

frameSub :: (Double -> action) -> Sub model action
frameSub toAction sink = createSub acquire release sink
  where
    acquire = do
        stopped <- newIORef False
        inFrame <- newIORef False
        frameId <- newIORef (0 :: Int)
        cbRef <- newIORef (error "frameSub: callback not set")
        cb <- syncCallback1 $ \tsVal -> do
            writeIORef inFrame True
            let body = do
                    isStopped <- readIORef stopped
                    unless isStopped (sink . toAction =<< fromJSValUnchecked tsVal)
                -- 次のフレームを登録し終えるまで inFrame を下ろさない。途中で release されても解放されないようにする
                next = do
                    isStopped <- readIORef stopped
                    self <- readIORef cbRef
                    if isStopped
                        then writeIORef inFrame False >> freeFunction (Function self)
                        else do
                            writeIORef frameId =<< requestAnimationFrame self
                            writeIORef inFrame False
                            -- 登録の直後に release された場合、フレームは取り消し済みで release も解放していない
                            stoppedMeanwhile <- readIORef stopped
                            when stoppedMeanwhile (freeFunction (Function self))
            body `finally` next
        writeIORef cbRef cb
        writeIORef frameId =<< requestAnimationFrame cb
        pure (stopped, inFrame, frameId, cb)

    release (stopped, inFrame, frameId, cb) = do
        writeIORef stopped True
        cancelAnimationFrame =<< readIORef frameId
        running <- readIORef inFrame
        unless running (freeFunction (Function cb))
