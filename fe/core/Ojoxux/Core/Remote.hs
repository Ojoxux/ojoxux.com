-- | API から取得するデータの状態
module Ojoxux.Core.Remote (Remote (..)) where

data Remote a
    = Loading
    | Loaded a
    | Failed
    deriving (Eq, Show)
