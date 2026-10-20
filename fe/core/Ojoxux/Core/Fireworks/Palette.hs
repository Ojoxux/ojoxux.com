{-# LANGUAGE OverloadedStrings #-}

module Ojoxux.Core.Fireworks.Palette (
    nishiki,
    kin,
    gin,
    saishiki,
    iroHenkaPairs,
    white,
) where

import Ojoxux.Core.Fireworks.Types (Color)

-- | 錦（暖色の金）
nishiki :: [Color]
nishiki = ["#ffd27a", "#ffb347", "#ffe6b0"]

-- | 金
kin :: [Color]
kin = ["#ffc24a", "#ffdca0"]

-- | 銀
gin :: [Color]
gin = ["#e8f4ff", "#ffffff"]

-- | 彩色
saishiki :: [Color]
saishiki = ["#ff3b3b", "#3b9bff", "#3bff8f", "#c46bff", "#4ff0ff", "#ff5ed2"]

-- | 色変わりの組み合わせ（変化前, 変化後）
iroHenkaPairs :: [[Color]]
iroHenkaPairs =
    [ ["#3bff8f", "#ff3b3b"]
    , ["#3b9bff", "#ffc24a"]
    , ["#c46bff", "#e8f4ff"]
    , ["#ff3b3b", "#3b9bff"]
    ]

white :: Color
white = "#ffffff"
