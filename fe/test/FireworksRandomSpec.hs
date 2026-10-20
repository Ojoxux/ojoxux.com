module FireworksRandomSpec (spec) where

import Control.Monad (replicateM)
import Control.Monad.State.Strict (evalState)
import Ojoxux.Core.Fireworks.Random (pick, rand, randInt, seeded)
import Test.Hspec

spec :: Spec
spec = describe "Fireworks.Random" $ do
    it "rand は [lo, hi) に収まる" $ do
        let xs = evalState (replicateM 1000 (rand 2 5)) (seeded 1)
        all (\x -> x >= 2 && x < 5) xs `shouldBe` True

    it "randInt は [lo, hi) の整数を返す" $ do
        let xs = evalState (replicateM 1000 (randInt 1 3)) (seeded 2)
        all (`elem` [1, 2]) xs `shouldBe` True
        elem 2 xs `shouldBe` True

    it "pick はリストの要素を返す" $ do
        let xs = evalState (replicateM 100 (pick "abc")) (seeded 3)
        all (`elem` "abc") xs `shouldBe` True

    it "同じシードなら同じ系列になる" $
        evalState (replicateM 10 (rand 0 1)) (seeded 7)
            `shouldBe` evalState (replicateM 10 (rand 0 1)) (seeded 7)
