{-# LANGUAGE LambdaCase #-}
{-# LANGUAGE OverloadedRecordDot #-}
{-# LANGUAGE OverloadedStrings #-}

module Ojoxux.View.Posts (postsView) where

import Miso
import Miso.Html
import Miso.Html.Property
import Ojoxux.Api.Types qualified as Api
import Ojoxux.Core.Remote (Remote (..))
import Ojoxux.View.Common (emptyView, sectionHeading)
import Ojoxux.View.Skeleton (postsSkeleton)

postsView :: Remote [Api.BlogPost] -> View context props model action
postsView = \case
    Loading -> postsSkeleton
    Failed -> emptyView
    Loaded [] -> emptyView
    Loaded posts ->
        div_
            [class_ "posts"]
            [ sectionHeading "Posts"
            , ul_ [class_ "posts__list"] (map postItem posts)
            ]

postItem :: Api.BlogPost -> View context props model action
postItem post =
    li_
        []
        [ a_
            [href_ (ms post.link), target_ "_blank", rel_ "noopener noreferrer", class_ "posts__link"]
            [ thumbnail
            , div_
                [class_ "posts__meta"]
                [ span_ [class_ "posts__title"] [text (ms post.title)]
                , span_ [class_ "posts__date"] [text (ms post.pubDate)]
                ]
            ]
        ]
  where
    thumbnail = case post.thumbnail of
        Just src -> img_ [src_ (ms src), alt_ "", loading_ "lazy", class_ "posts__thumbnail"]
        Nothing -> div_ [class_ "posts__thumbnail-placeholder"] []
