{-# LANGUAGE LambdaCase #-}
{-# LANGUAGE OverloadedRecordDot #-}
{-# LANGUAGE OverloadedStrings #-}

module Ojoxux.View.WakaTime (wakaTimeView) where

import Data.Text qualified as T
import Miso
import Miso.Html
import Miso.Html.Property (class_)
import Ojoxux.Api.Types qualified as Api
import Ojoxux.Core.Remote (Remote (..))
import Ojoxux.Core.WakaTime (filledBlocks, rowBlocks)
import Ojoxux.View.Common (emptyView, sectionHeading)
import Ojoxux.View.Skeleton (wakaTimeSkeleton)

wakaTimeView :: Remote Api.WakaTimeActivity -> View context props model action
wakaTimeView = \case
    Loading -> wakaTimeSkeleton
    Failed -> emptyView
    Loaded activity
        | null activity.languages -> emptyView
        | otherwise -> activityView activity

activityView :: Api.WakaTimeActivity -> View context props model action
activityView activity =
    div_
        [class_ "activity"]
        [ div_
            [class_ "activity__heading"]
            [ sectionHeading "Activity"
            , p_
                [class_ "activity__total"]
                ( span_ [] [text (ms activity.totalText)]
                    : [span_ [class_ "activity__range"] [text (ms activity.rangeText)] | not (T.null activity.rangeText)]
                )
            ]
        , ul_ [class_ "activity__list"] (map languageRow activity.languages)
        ]

languageRow :: Api.WakaTimeLanguage -> View context props model action
languageRow language =
    li_
        [class_ "activity__row"]
        [ span_ [class_ "activity__language"] [text (ms language.name)]
        , div_
            [class_ "activity__metrics"]
            [ div_ [class_ "activity__blocks"] [block i | i <- [0 .. rowBlocks - 1]]
            , span_ [class_ "activity__duration"] [text (ms language.text)]
            ]
        ]
  where
    filled = filledBlocks language.percent
    block i =
        div_
            [ class_
                ( if i < filled
                    then "activity__block activity__block--filled"
                    else "activity__block activity__block--empty"
                )
            ]
            []
