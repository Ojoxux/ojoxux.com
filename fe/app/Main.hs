{-# LANGUAGE CPP #-}
{-# LANGUAGE OverloadedStrings #-}

module Main (main) where

import Miso
import Miso.Html

main :: IO ()
main = startApp defaultEvents app

app :: App () ()
app =
  (component () (const (pure ())) (const (div_ [] [text "hello miso"])))
    { mountPoint = Just "app"
    }

#ifdef WASM
foreign export javascript "hs_start" main :: IO ()
#endif
