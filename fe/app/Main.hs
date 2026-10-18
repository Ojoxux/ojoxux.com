{-# LANGUAGE CPP #-}
{-# LANGUAGE OverloadedStrings #-}

module Main (main) where

import Miso
import Ojoxux.Model (Action (..), Model, initialModel)
import Ojoxux.Update (updateModel)
import Ojoxux.View (viewModel)

main :: IO ()
main = startApp defaultEvents app

app :: App Model Action
app =
  (component initialModel updateModel viewModel)
    { mount = Just Init
    , mountPoint = Just "app"
    }

#ifdef WASM
foreign export javascript "hs_start" main :: IO ()
#endif
