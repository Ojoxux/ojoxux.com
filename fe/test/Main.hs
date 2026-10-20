{-# LANGUAGE OverloadedStrings #-}

module Main (main) where

import FireworksParticleSpec qualified
import FireworksRandomSpec qualified
import Ojoxux.Core.Birthday (resolveBirthdayMode)
import Ojoxux.Core.CountUp (countValueAt, easeOutCubic, formatWithSeparator)
import Ojoxux.Core.Round (roundHalfUp)
import Ojoxux.Core.WakaTime (filledBlocks, rowBlocks)
import Test.Hspec

main :: IO ()
main = hspec $ do
    describe "roundHalfUp" $
        it "JS の Math.round と同じく .5 を切り上げる" $ do
            roundHalfUp 2.5 `shouldBe` 3
            roundHalfUp 3.5 `shouldBe` 4
            roundHalfUp 1.25 `shouldBe` 1
            roundHalfUp 0 `shouldBe` 0

    describe "resolveBirthdayMode" $ do
        it "8/18 は誕生日" $
            resolveBirthdayMode False False 8 18 `shouldBe` True
        it "それ以外の日は誕生日ではない" $
            resolveBirthdayMode False False 8 17 `shouldBe` False
        it "8 月以外の 18 日は誕生日ではない" $
            resolveBirthdayMode False False 7 18 `shouldBe` False
        it "localStorage のフラグがあれば常に誕生日" $
            resolveBirthdayMode True False 1 1 `shouldBe` True
        it "ビルド時のフラグがあれば常に誕生日" $
            resolveBirthdayMode False True 1 1 `shouldBe` True

    describe "easeOutCubic" $ do
        it "0 と 1 で端点を返す" $ do
            easeOutCubic 0 `shouldBe` 0
            easeOutCubic 1 `shouldBe` 1
        it "範囲外の入力は 0..1 に丸める" $ do
            easeOutCubic (-1) `shouldBe` 0
            easeOutCubic 2 `shouldBe` 1

    describe "countValueAt" $ do
        it "開始時は 0" $
            countValueAt 1000 0 `shouldBe` 0
        it "半分の時間で ease-out の 87.5%" $
            countValueAt 1000 500 `shouldBe` 875
        it "所要時間を過ぎたら目標値で止まる" $ do
            countValueAt 1000 1000 `shouldBe` 1000
            countValueAt 1000 5000 `shouldBe` 1000

    describe "formatWithSeparator" $ do
        it "3 桁ごとにカンマを入れる" $ do
            formatWithSeparator 0 `shouldBe` "0"
            formatWithSeparator 999 `shouldBe` "999"
            formatWithSeparator 1000 `shouldBe` "1,000"
            formatWithSeparator 1234567 `shouldBe` "1,234,567"
            formatWithSeparator (-1234) `shouldBe` "-1,234"
        it "minBound でも停止して正しく整形する" $
            formatWithSeparator minBound `shouldBe` "-9,223,372,036,854,775,808"

    describe "filledBlocks" $ do
        it "1 行は 10 ブロック" $
            rowBlocks `shouldBe` 10
        it "パーセントをブロック数に丸める（.5 は切り上げ）" $ do
            filledBlocks 0 `shouldBe` 0
            filledBlocks 12.5 `shouldBe` 1
            filledBlocks 25 `shouldBe` 3
            filledBlocks 75 `shouldBe` 8
            filledBlocks 100 `shouldBe` 10
        it "0..rowBlocks の範囲に収める" $ do
            filledBlocks 150 `shouldBe` 10
            filledBlocks (-5) `shouldBe` 0

    FireworksParticleSpec.spec
    FireworksRandomSpec.spec
