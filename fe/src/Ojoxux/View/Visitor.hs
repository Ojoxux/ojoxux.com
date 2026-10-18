{-# LANGUAGE OverloadedStrings #-}

module Ojoxux.View.Visitor (visitorView) where

import Miso
import Miso.Html
import Miso.Html.Property
import Ojoxux.Core.CountUp (formatWithSeparator)
import Ojoxux.Core.Remote (Remote (..))
import Ojoxux.Model (Action (..), Model)
import Ojoxux.View.Icons (eyeIcon)

-- | 第 2 引数は CountUp の現在表示値
visitorView :: Remote Int -> Int -> View () () Model Action
visitorView remote shown = case remote of
    Loading ->
        row "visitor-count" [span_ [class_ "visitor-count__status pulse"] [text "..."]]
    Loaded _ ->
        row
            "visitor-count visitor-count--ready"
            [span_ [class_ "visitor-count__value"] [text (ms (formatWithSeparator shown))]]
    Failed ->
        row
            "visitor-count"
            [ span_
                [class_ "visitor-count__error"]
                [ span_ [] [text "Error"]
                , button_ [type_ "button", class_ "visitor-count__retry", onClick RetryVisit] [text "Retry"]
                ]
            ]
  where
    row cls rest =
        div_
            [class_ cls]
            (eyeIcon "visitor-count__eye" : span_ [class_ "sr-only"] [text "Visits"] : rest)
