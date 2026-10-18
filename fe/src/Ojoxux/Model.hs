module Ojoxux.Model
  ( Model (..)
  , Action (..)
  , initialModel
  ) where

import Miso (DOMRef)
import qualified Ojoxux.Api.Types as Api
import Ojoxux.Core.Remote (Remote (..))

data Model = Model
  { wakaTime :: Remote Api.WakaTimeActivity
  , posts :: Remote [Api.BlogPost]
  , visitor :: Remote Int
  , birthday :: Bool
  -- ^ 起動時に一度だけ判定する
  , fireworks :: Bool
  -- ^ 花火のトグル。誕生日モードのときだけ意味を持つ
  , countShown :: Int
  -- ^ CountUp の現在表示値
  , countStart :: Maybe Double
  -- ^ CountUp を始めた rAF タイムスタンプ（ミリ秒）
  }
  deriving (Eq)

data Action
  = Init
  | GotBirthday Bool
  | GotWakaTime (Remote Api.WakaTimeActivity)
  | GotPosts (Remote [Api.BlogPost])
  | GotVisit (Remote Int)
  | -- | 引数は prefers-reduced-motion
    StartCount Bool
  | CountTick Double
  | RetryVisit
  | ToggleFireworks
  | FireworksCreated DOMRef
  | FireworksDestroyed DOMRef
  | HatenaStarCreated

initialModel :: Model
initialModel =
  Model
    { wakaTime = Loading
    , posts = Loading
    , visitor = Loading
    , birthday = False
    , fireworks = True
    , countShown = 0
    , countStart = Nothing
    }
