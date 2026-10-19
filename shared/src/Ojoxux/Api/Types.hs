{- | フロント（Miso）と Worker（Hono）で共有する API 型。
TS 側の型は shared/gen/GenTs.hs がここから生成する。
-}
module Ojoxux.Api.Types (
    WakaTimeLanguage (..),
    WakaTimeActivity (..),
    BlogPost (..),
    VisitResult (..),
    apiOptions,
) where

import Data.Aeson (
    FromJSON (..),
    Options (..),
    ToJSON (..),
    defaultOptions,
    genericParseJSON,
    genericToEncoding,
    genericToJSON,
 )
import Data.Text (Text)
import GHC.Generics (Generic)

{- | JSON と TS 型の両方で使う設定。Nothing のフィールドは出力しない
（TS 側では @thumbnail?: string@ になる）。
-}
apiOptions :: Options
apiOptions = defaultOptions{omitNothingFields = True}

data WakaTimeLanguage = WakaTimeLanguage
    { name :: Text
    , text :: Text
    , percent :: Double
    }
    deriving (Eq, Show, Generic)

instance FromJSON WakaTimeLanguage where
    parseJSON = genericParseJSON apiOptions

instance ToJSON WakaTimeLanguage where
    toJSON = genericToJSON apiOptions
    toEncoding = genericToEncoding apiOptions

data WakaTimeActivity = WakaTimeActivity
    { rangeText :: Text
    , totalText :: Text
    , languages :: [WakaTimeLanguage]
    }
    deriving (Eq, Show, Generic)

instance FromJSON WakaTimeActivity where
    parseJSON = genericParseJSON apiOptions

instance ToJSON WakaTimeActivity where
    toJSON = genericToJSON apiOptions
    toEncoding = genericToEncoding apiOptions

data BlogPost = BlogPost
    { title :: Text
    , link :: Text
    , pubDate :: Text
    , thumbnail :: Maybe Text
    }
    deriving (Eq, Show, Generic)

instance FromJSON BlogPost where
    parseJSON = genericParseJSON apiOptions

instance ToJSON BlogPost where
    toJSON = genericToJSON apiOptions
    toEncoding = genericToEncoding apiOptions

newtype VisitResult = VisitResult
    { count :: Int
    }
    deriving (Eq, Show, Generic)

instance FromJSON VisitResult where
    parseJSON = genericParseJSON apiOptions

instance ToJSON VisitResult where
    toJSON = genericToJSON apiOptions
    toEncoding = genericToEncoding apiOptions
