{-# LANGUAGE LambdaCase #-}
{-# LANGUAGE TemplateHaskell #-}
{-# OPTIONS_GHC -Wno-orphans #-}

-- | Ojoxux.Api.Types から Worker 用の TypeScript 型を生成する。
-- TypeScript インスタンスはここだけで導出し、WASM ビルドに Template Haskell を持ち込まない。
module Main (main) where

import Data.Aeson.TypeScript.TH
import Data.Proxy (Proxy (..))
import Ojoxux.Api.Types
import System.Environment (getArgs)
import System.Exit (die)
import System.IO (IOMode (WriteMode), hPutStr, hSetEncoding, utf8, withFile)

$(deriveTypeScript apiOptions ''WakaTimeLanguage)
$(deriveTypeScript apiOptions ''WakaTimeActivity)
$(deriveTypeScript apiOptions ''BlogPost)
$(deriveTypeScript apiOptions ''VisitResult)

main :: IO ()
main =
  getArgs >>= \case
    [output] -> withFile output WriteMode (\h -> hSetEncoding h utf8 >> hPutStr h contents)
    _ -> die "usage: gen-ts OUTPUT"

contents :: String
contents =
  "// このファイルは shared/gen/GenTs.hs が生成する。直接編集しない（scripts/gen-types.sh で再生成）。\n\n"
    <> formatTSDeclarations' formatting declarations
    <> "\n"
  where
    formatting = defaultFormattingOptions {exportMode = ExportEach}
    declarations =
      concat
        [ getTypeScriptDeclarations (Proxy :: Proxy WakaTimeLanguage)
        , getTypeScriptDeclarations (Proxy :: Proxy WakaTimeActivity)
        , getTypeScriptDeclarations (Proxy :: Proxy BlogPost)
        , getTypeScriptDeclarations (Proxy :: Proxy VisitResult)
        ]
