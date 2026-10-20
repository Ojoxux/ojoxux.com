{-# LANGUAGE OverloadedStrings #-}

module FireworksStatsSpec (spec) where

import Ojoxux.Core.Fireworks.Program (Section (..))
import Ojoxux.Core.Fireworks.Stats
import Test.Hspec

spec :: Spec
spec = describe "Fireworks.Stats" $ do
    it "平均と 95 パーセンタイル" $ do
        let s = foldr (\dt acc -> record dt 1 2 10 acc) emptyStats ([1 .. 100] :: [Double])
        statMean s `shouldBe` 50.5
        statP95 s `shouldBe` 96
        statFrames s `shouldBe` 100

    it "粒子数は最大値を残す" $
        statMaxParticles (record 1 0 0 5 (record 1 0 0 9 emptyStats)) `shouldBe` 9

    it "1 行に整形する" $
        formatStats Finale (record 20 1 2 3 emptyStats)
            `shouldBe` "[fireworks:hs] Finale frames=1 mean=20.0ms p95=20.0ms physics=1.00ms render=2.00ms maxParticles=3"
