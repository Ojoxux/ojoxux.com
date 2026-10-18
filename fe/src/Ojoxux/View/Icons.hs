{-# LANGUAGE OverloadedStrings #-}

module Ojoxux.View.Icons
  ( githubIcon
  , xIcon
  , zennIcon
  , eyeIcon
  , partyPopperIcon
  ) where

import Miso
import Miso.Html.Property (aria_, class_)
import Miso.Svg.Element (circle_, path_, svg_)
import qualified Miso.Svg.Property as SP

-- | 塗りつぶしのブランドアイコン（icons.tsx）
filledIcon :: MisoString -> MisoString -> View context props model action
filledIcon d cls =
  svg_
    [SP.viewBox_ "0 0 24 24", SP.fill_ "currentColor", aria_ "hidden" "true", class_ cls]
    [path_ [SP.d_ d]]

-- | lucide と同じ線画アイコン
strokeIcon :: [View context props model action] -> MisoString -> View context props model action
strokeIcon children cls =
  svg_
    [ SP.viewBox_ "0 0 24 24"
    , SP.fill_ "none"
    , SP.stroke_ "currentColor"
    , SP.strokeWidth_ "2"
    , SP.strokeLinecap_ "round"
    , SP.strokeLinejoin_ "round"
    , aria_ "hidden" "true"
    , class_ cls
    ]
    children

githubIcon :: MisoString -> View context props model action
githubIcon =
  filledIcon
    "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.833.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"

xIcon :: MisoString -> View context props model action
xIcon =
  filledIcon
    "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"

zennIcon :: MisoString -> View context props model action
zennIcon =
  filledIcon
    "M.264 23.771h4.984c.264 0 .498-.147.645-.352L19.614.874c.176-.293-.029-.645-.381-.645h-4.72c-.235 0-.44.117-.557.323L.03 23.361c-.088.176.029.41.234.41zM17.445 23.419l6.479-10.408c.205-.323-.029-.733-.41-.733h-4.691c-.176 0-.352.088-.44.235l-6.655 10.643c-.176.264.029.616.352.616h4.779c.234-.001.468-.118.586-.353z"

eyeIcon :: MisoString -> View context props model action
eyeIcon =
  strokeIcon
    [ path_ [SP.d_ "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"]
    , circle_ [SP.cx_ "12", SP.cy_ "12", SP.r_ "3"]
    ]

partyPopperIcon :: MisoString -> View context props model action
partyPopperIcon =
  strokeIcon
    [ path_ [SP.d_ "M5.8 11.3 2 22l10.7-3.79"]
    , path_ [SP.d_ "M4 3h.01"]
    , path_ [SP.d_ "M22 8h.01"]
    , path_ [SP.d_ "M15 2h.01"]
    , path_ [SP.d_ "M22 20h.01"]
    , path_ [SP.d_ "m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"]
    , path_ [SP.d_ "m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"]
    , path_ [SP.d_ "m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"]
    , path_ [SP.d_ "M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"]
    ]
