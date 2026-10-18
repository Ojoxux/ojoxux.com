{-# LANGUAGE OverloadedStrings #-}

-- | 読み込み中の表示（現行 page.tsx の WakaTimeFallback / WritingFallback）
module Ojoxux.View.Skeleton
  ( wakaTimeSkeleton
  , postsSkeleton
  ) where

import Miso
import Miso.Html
import Miso.Html.Property (class_)

box :: MisoString -> View context props model action
box cls = div_ [class_ ("skeleton-box " <> cls)] []

wakaTimeSkeleton :: View context props model action
wakaTimeSkeleton =
  div_
    [class_ "skeleton-waka pulse"]
    [ div_ [class_ "skeleton-heading"] [box "skeleton-waka__label", box "skeleton-waka__total"]
    , box "skeleton-waka__bar"
    ]

postsSkeleton :: View context props model action
postsSkeleton =
  div_
    [class_ "skeleton-posts pulse"]
    [ box "skeleton-posts__label"
    , div_ [class_ "skeleton-posts__list"] (replicate 3 post)
    ]
  where
    post =
      div_
        [class_ "skeleton-posts__post"]
        [box "skeleton-posts__image", box "skeleton-posts__title", box "skeleton-posts__date"]
