{-# LANGUAGE OverloadedStrings #-}

module Ojoxux.View.Profile (profileView) where

import Miso
import Miso.Html
import Miso.Html.Property
import Ojoxux.Model (Action (..), Model)
import Ojoxux.View.Common (Wave (..), sectionHeading, waveDivider)
import Ojoxux.View.Icons (githubIcon, xIcon, zennIcon)

data SocialLink = SocialLink
  { linkLabel :: MisoString
  , linkAccount :: MisoString
  , linkHref :: MisoString
  , linkIcon :: View () () Model Action
  }

socialLinks :: [SocialLink]
socialLinks =
  [ SocialLink "GitHub" "Ojoxux" "https://github.com/Ojoxux" (githubIcon "social-links__icon")
  , SocialLink "X" "Ojoxux__18" "https://x.com/ojoxux__18" (xIcon "social-links__icon")
  , SocialLink
      "はてなブログ"
      "でってまんず、もっけだの"
      "https://ojoxux.hatenablog.com"
      (img_ [src_ "/hatena-blog.png", alt_ "", width_ "28", height_ "28", class_ "social-links__image"])
  , SocialLink "Zenn" "Ojoxux" "https://zenn.dev/ojoxux" (zennIcon "social-links__icon")
  ]

socialLinksView :: View () () Model Action
socialLinksView = ul_ [class_ "social-links"] (map item socialLinks)
  where
    item l =
      li_
        [class_ "social-links__item"]
        [ a_
            [ href_ (linkHref l)
            , target_ "_blank"
            , rel_ "noopener noreferrer"
            , aria_ "label" (linkLabel l <> ": " <> linkAccount l)
            , class_ "social-links__link"
            ]
            [linkIcon l, span_ [class_ "social-links__account"] [text (linkAccount l)]]
        ]

-- | hover で表裏が入れ替わる名前（アニメーションは CSS）
flipName :: MisoString -> MisoString -> View context props model action
flipName front backText =
  span_
    [class_ "flip-name"]
    [ span_
        [class_ "flip-name__inner"]
        [ span_ [class_ "flip-name__face flip-name__face--front"] [text front]
        , span_ [class_ "flip-name__face flip-name__face--back", aria_ "hidden" "true"] [text backText]
        ]
    ]

profileView :: View () () Model Action
profileView =
  div_
    [class_ "profile"]
    [ div_
        [class_ "profile__avatar-frame"]
        [img_ [src_ "/avatar.png", alt_ "Ojoxux", class_ "profile__avatar", textProp "fetchpriority" "high"]]
    , div_
        [class_ "profile__title-row"]
        [ a_
            [href_ "/", class_ "profile__home-link"]
            [h1_ [class_ "profile__title"] [flipName "Ojoxux" "Jou Okuyama"]]
        ]
    , span_ [class_ "profile__identifier"] [text "44112f7c-1326-47f3-bea8-138e5ac9f02d"]
    , p_
        [class_ "profile__bio"]
        [text "Web engineer. Recently interested in functional languages and learning more about them."]
    , div_
        [class_ "profile__hatena-star"]
        -- HatenaStar.js が #hatena-star の中にスターを差し込む
        [span_ [id_ "hatena-star", onCreated HatenaStarCreated] []]
    , div_ [class_ "profile__divider"] [waveDivider WaveProfile]
    , div_ [class_ "profile__links"] [sectionHeading "Links", socialLinksView]
    ]
