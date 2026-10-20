{-# LANGUAGE OverloadedStrings #-}

-- | fe/js/bridge.ts が globalThis.ojoxux に置いた関数の呼び出し
module Ojoxux.Ffi (
    readBirthdayMode,
    prefersReducedMotion,
    initHatenaStar,
) where

import Control.Monad (void)
import Miso.DSL (JSVal, fromJSValUnchecked, jsg, (!), (#))
import Miso.String (MisoString)
import Ojoxux.Core.Birthday (resolveBirthdayMode)

bridge :: IO JSVal
bridge = jsg "ojoxux"

call0 :: MisoString -> IO JSVal
call0 name = do
    b <- bridge
    (b # name) ()

readBirthdayMode :: IO Bool
readBirthdayMode = do
    facts <- call0 "birthdayFacts"
    storageFlag <- fromJSValUnchecked =<< facts ! "storageFlag"
    envFlag <- fromJSValUnchecked =<< facts ! "envFlag"
    month <- fromJSValUnchecked =<< facts ! "month"
    day <- fromJSValUnchecked =<< facts ! "day"
    pure (resolveBirthdayMode storageFlag envFlag month day)

prefersReducedMotion :: IO Bool
prefersReducedMotion = fromJSValUnchecked =<< call0 "prefersReducedMotion"

initHatenaStar :: IO ()
initHatenaStar = void (call0 "initHatenaStar")
