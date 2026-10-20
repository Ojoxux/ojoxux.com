{-# LANGUAGE OverloadedStrings #-}

module FireworksShellsSpec (spec) where

import Control.Monad.State.Strict (evalState)
import Data.Maybe (isJust)
import Ojoxux.Core.Fireworks.Palette (kin, nishiki, saishiki)
import Ojoxux.Core.Fireworks.Random (seeded)
import Ojoxux.Core.Fireworks.Shells (explodeShell)
import Ojoxux.Core.Fireworks.Types
import Test.Hspec

explode :: ShellSpec -> [Particle]
explode s = evalState (explodeShell s 100 100 300) (seeded 11)

spec :: Spec
spec = describe "Fireworks.Shells" $ do
    it "菊（medium）は 65 個" $
        length (explode (shellSpec Kiku Medium saishiki)) `shouldBe` 65

    it "countScale を掛けて丸める（large × 0.85 = 100）" $
        length (explode (shellSpec Kamuro Large kin){countScale = 0.85}) `shouldBe` 100

    it "千輪の星はすべて子星を持つ" $
        all (isJust . split) (explode (shellSpec Senrin Medium saishiki)) `shouldBe` True

    it "千輪以外は子星を持たない" $
        any (isJust . split) (explode (shellSpec Botan Medium saishiki)) `shouldBe` False

    it "色変わりの星は 2 色を持つ" $
        all ((== 2) . length . colorStops) (explode (shellSpec IroHenka Medium ["#3bff8f", "#ff3b3b"]))
            `shouldBe` True

    it "三重芯は層の比率どおり（xlarge: 96 + 40 + 24）" $
        length (explode (shellSpec ShinIri XLarge nishiki){triple = True}) `shouldBe` 160

    it "二重芯（medium）は 46 + 20" $
        length (explode (shellSpec ShinIri Medium saishiki)) `shouldBe` 66

    it "星は破裂位置から始まる" $
        all (\p -> px p == 100 && py p == 100) (explode (shellSpec Kiku Small saishiki)) `shouldBe` True
