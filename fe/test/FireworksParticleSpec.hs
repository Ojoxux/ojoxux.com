{-# LANGUAGE OverloadedStrings #-}

module FireworksParticleSpec (spec, sampleParticle) where

import Ojoxux.Core.Fireworks.Particle (particleColor, updateParticle)
import Ojoxux.Core.Fireworks.Types
import Test.Hspec

sampleParticle :: Particle
sampleParticle =
    Particle
        { px = 0
        , py = 0
        , vx = 1
        , vy = 0
        , size = 1
        , drag = 0.5
        , gravity = 0.1
        , life = 10
        , maxLife = 100
        , colorStops = ["#111111", "#222222"]
        , flicker = 0
        , trail = True
        , fadeExp = 1
        , split = Nothing
        }

spec :: Spec
spec = describe "Fireworks.Particle" $ do
    it "1 ステップで空気抵抗、重力、移動、寿命が進む" $ do
        let p = updateParticle sampleParticle
        vx p `shouldBe` 0.5
        vy p `shouldBe` 0.1
        px p `shouldBe` 0.5
        py p `shouldBe` 0.1
        life p `shouldBe` 9

    it "寿命の 45% までは 1 色目" $
        particleColor sampleParticle{life = 60} `shouldBe` "#111111"

    it "寿命の 45% を過ぎたら 2 色目" $
        particleColor sampleParticle{life = 50} `shouldBe` "#222222"

    it "1 色だけならその色" $
        particleColor sampleParticle{colorStops = ["#333333"]} `shouldBe` "#333333"

    it "色が無ければ白" $
        particleColor sampleParticle{colorStops = []} `shouldBe` "#ffffff"
