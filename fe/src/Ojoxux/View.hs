{-# LANGUAGE OverloadedRecordDot #-}
{-# LANGUAGE OverloadedStrings #-}

-- | 全体レイアウト（現行の HomeClient）
module Ojoxux.View (viewModel) where

import Miso
import Miso.Html
import Miso.Html.Property
import Ojoxux.Model (Action (..), Model (..))
import Ojoxux.View.Common (Wave (..), sectionHeading, waveDivider)
import Ojoxux.View.Icons (partyPopperIcon)
import Ojoxux.View.Posts (postsView)
import Ojoxux.View.Profile (profileView)
import Ojoxux.View.Visitor (visitorView)
import Ojoxux.View.WakaTime (wakaTimeView)

viewModel :: Model -> View () () Model Action
viewModel m =
    div_
        [class_ "home"]
        [ div_ [class_ "home__background"] [fireworksLayer | m.birthday && m.fireworks]
        , div_
            [class_ "home__container"]
            [ main_
                [class_ "home__main"]
                [ div_
                    [class_ "profile-column"]
                    [ div_
                        [class_ "profile-content"]
                        [ profileView
                        , div_
                            [class_ "profile-details"]
                            ( [birthdayControls m.fireworks | m.birthday]
                                <> [ div_
                                        [class_ "visitor"]
                                        [sectionHeading "Visitor", visitorView m.visitor m.countShown]
                                   ]
                            )
                        ]
                    ]
                , panel False (wakaTimeView m.wakaTime)
                , panel True (postsView m.posts)
                ]
            ]
        ]

-- | 花火の canvas は WASM 側（Ojoxux.Fireworks.Loop）がこの div の中に作る
fireworksLayer :: View () () Model Action
fireworksLayer =
    div_ [class_ "fireworks", onCreatedWith FireworksCreated, onDestroyedWith FireworksDestroyed] []

birthdayControls :: Bool -> View () () Model Action
birthdayControls showing =
    div_
        [class_ "birthday-controls"]
        [ button_
            [ type_ "button"
            , class_ "toggle-button"
            , onClick ToggleFireworks
            , aria_ "label" (if showing then "花火を非表示" else "花火を表示")
            ]
            [ partyPopperIcon
                (if showing then "party-icon party-icon--active" else "party-icon party-icon--inactive")
            ]
        ]

-- | 第 1 引数は右側の縦線を出すかどうか（Posts パネルだけ）
panel :: Bool -> View () () Model Action -> View () () Model Action
panel rightDivider content =
    div_
        [class_ "panel"]
        ( [ div_ [class_ "panel__mobile-divider"] [waveDivider WaveDefault]
          , div_ [class_ "panel__vertical-divider"] []
          ]
            <> [div_ [class_ "panel__vertical-divider panel__vertical-divider--right"] [] | rightDivider]
            <> [div_ [class_ "panel__content"] [content]]
        )
