{-# LANGUAGE OverloadedStrings #-}

module FireworksShowSpec (spec) where

import FireworksParticleSpec (sampleParticle)
import Ojoxux.Core.Fireworks.Program (riseSpeedFor)
import Ojoxux.Core.Fireworks.Show
import Ojoxux.Core.Fireworks.Types
import Test.Hspec hiding (pending)

-- | 演目なしの空のショー
emptyShow :: ShowState
emptyShow = (newShow 1 100 200){pending = []}

risingShell :: Double -> Shell
risingShell y =
    Shell
        { sx = 50
        , sy = y
        , svx = 0
        , sRiseSpeed = 2
        , burstY = 100
        , sSpec = shellSpec Kiku Small ["#ffffff"]
        , shellColor = "#ffffff"
        }

spec :: Spec
spec = describe "Fireworks.Show" $ do
    it "打ち上げ時刻は破裂時刻から上昇時間を引く" $ do
        let c = Cue{at = 1500, shell = shellSpec Kiku XLarge [], xRatio = 0.5, burstYRatio = 0.34, riseSpeed = riseSpeedFor XLarge}
        launchAt c `shouldSatisfy` (\t -> abs (t - (1500 - 0.66 / 0.0127 * stepMs)) < 1e-9)

    it "打ち上げ時刻が負なら 0" $ do
        let c = Cue{at = 10, shell = shellSpec Kiku XLarge [], xRatio = 0.5, burstYRatio = 0.34, riseSpeed = riseSpeedFor XLarge}
        launchAt c `shouldBe` 0

    it "newShow は演目をすべて未発射で持つ" $
        length (pending (newShow 1 100 200)) `shouldSatisfy` (> 100)

    it "破裂高度に達した玉は星になる" $ do
        let st = step emptyShow{shells = [risingShell 101]}
        shells st `shouldBe` []
        length (particles st) `shouldSatisfy` (>= 38)

    it "まだ高い玉は上昇を続け、火の粉を出す" $ do
        let st = step emptyShow{shells = [risingShell 150]}
        map sy (shells st) `shouldBe` [148]
        length (particles st) `shouldSatisfy` (\n -> n >= 1 && n <= 2)

    it "寿命が尽きた千輪の星は子星を出す" $ do
        let parent = sampleParticle{life = 1, split = Just (SplitSpec 3 1 1 22 ["#ffffff"])}
            st = step emptyShow{particles = [parent]}
        length (particles st) `shouldBe` 3
        all ((== 22) . life) (particles st) `shouldBe` True

    it "粒子は上限で打ち切る" $ do
        let many = replicate particleCap sampleParticle{life = 1000}
            st = step emptyShow{particles = many, shells = [risingShell 101]}
        length (particles st) `shouldSatisfy` (<= particleCap)

    it "すべて消えてから 120 ステップで終わる" $ do
        let nSteps n = iterate step emptyShow !! n
        isFinished (nSteps 119) `shouldBe` False
        isFinished (nSteps 120) `shouldBe` True

    it "粒子があるうちは終わらない" $
        isFinished (iterate step emptyShow{particles = [sampleParticle{life = 500, gravity = 0}]} !! 200)
            `shouldBe` False

    it "リサイズで座標をスケールする" $ do
        let st = resizeShow 200 400 emptyShow{particles = [sampleParticle{px = 10, py = 20}], shells = [risingShell 150]}
        map (\p -> (px p, py p)) (particles st) `shouldBe` [(20, 40)]
        map burstY (shells st) `shouldBe` [200]
        (showWidth st, showHeight st) `shouldBe` (200, 400)

    it "幅か高さが 0 以下のリサイズは無視する" $
        showWidth (resizeShow 0 400 emptyShow) `shouldBe` 100

    it "drawItems は不透明度を寿命と fadeExp から計算する" $ do
        let (items, _) = drawItems emptyShow{particles = [sampleParticle{life = 25, maxLife = 100, fadeExp = 2}]}
        map diAlpha items `shouldBe` [0.0625]

    it "drawItems は座標を Math.round と同じく丸める" $ do
        let (items, _) = drawItems emptyShow{particles = [sampleParticle{px = 2.5, py = 3.4}]}
        map (\d -> (diX d, diY d)) items `shouldBe` [(3, 3)]

    it "シードを変えても newShow は動く" $
        length (pending (newShow 99 100 200)) `shouldSatisfy` (> 100)
