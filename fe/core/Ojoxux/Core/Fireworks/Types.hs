{- | 花火エンジンの型。旧 TS 版（fe/js/fireworks/types.ts、削除済み）に対応する。
座標と速度は canvas（実サイズの 1/3）のピクセル単位、時間は 1/60 秒のステップ単位。
-}
module Ojoxux.Core.Fireworks.Types (
    Color,
    Kind (..),
    Grade (..),
    ShellSpec (..),
    shellSpec,
    Cue (..),
    SplitSpec (..),
    Particle (..),
    Shell (..),
) where

import Data.Text (Text)

-- | @#rrggbb@ 形式の色
type Color = Text

-- | 玉の種類（菊・牡丹・冠・千輪・芯入り・色変わり）
data Kind = Kiku | Botan | Kamuro | Senrin | ShinIri | IroHenka
    deriving (Eq, Show)

-- | 玉の大きさ
data Grade = Small | Medium | Large | XLarge
    deriving (Eq, Show)

data ShellSpec = ShellSpec
    { kind :: !Kind
    , grade :: !Grade
    , palette :: ![Color]
    , corePalette :: !(Maybe [Color])
    , countScale :: !Double
    , lifeScale :: !Double
    , triple :: !Bool
    }
    deriving (Eq, Show)

-- | 省略可能な項目を既定値にした 'ShellSpec'
shellSpec :: Kind -> Grade -> [Color] -> ShellSpec
shellSpec k g p =
    ShellSpec
        { kind = k
        , grade = g
        , palette = p
        , corePalette = Nothing
        , countScale = 1
        , lifeScale = 1
        , triple = False
        }

-- | 演目の 1 発。at は破裂させたい時刻（ms）、比率は canvas の幅・高さに対する値
data Cue = Cue
    { at :: !Double
    , shell :: !ShellSpec
    , xRatio :: !Double
    , burstYRatio :: !Double
    , riseSpeed :: !Double
    }
    deriving (Eq, Show)

-- | 千輪の子星
data SplitSpec = SplitSpec
    { splitCount :: !Int
    , splitSpeed :: !Double
    , splitSize :: !Int
    , splitLife :: !Int
    , splitColors :: ![Color]
    }
    deriving (Eq, Show)

data Particle = Particle
    { px :: !Double
    , py :: !Double
    , vx :: !Double
    , vy :: !Double
    , size :: !Int
    , drag :: !Double
    , gravity :: !Double
    , life :: !Int
    , maxLife :: !Int
    , colorStops :: ![Color]
    , flicker :: !Double
    , trail :: !Bool
    , fadeExp :: !Double
    , split :: !(Maybe SplitSpec)
    }
    deriving (Eq, Show)

-- | 上昇中の玉
data Shell = Shell
    { sx :: !Double
    , sy :: !Double
    , svx :: !Double
    , sRiseSpeed :: !Double
    , burstY :: !Double
    , sSpec :: !ShellSpec
    , shellColor :: !Color
    }
    deriving (Eq, Show)
