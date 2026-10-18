{-# LANGUAGE OverloadedStrings #-}

module Ojoxux.View.Common
  ( Wave (..)
  , sectionHeading
  , waveDivider
  , emptyView
  ) where

import Miso
import Miso.Html
import Miso.Html.Property (aria_, class_)

data Wave
  = -- | wavelength=24, amplitude=4, speed=2（パネルの区切り）
    WaveDefault
  | -- | wavelength=32, amplitude=5, speed=2.5（プロフィールの下）
    WaveProfile

sectionHeading :: MisoString -> View context props model action
sectionHeading label = h2_ [class_ "section-heading"] [text label]

waveDivider :: Wave -> View context props model action
waveDivider wave = div_ [aria_ "hidden" "true", class_ cls] []
  where
    cls = case wave of
      WaveDefault -> "wave"
      WaveProfile -> "wave wave--profile"

-- | 何も描かない（React の null に相当）
emptyView :: View context props model action
emptyView = text ""
