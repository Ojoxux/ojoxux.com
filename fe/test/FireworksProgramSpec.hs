module FireworksProgramSpec (spec) where

import Control.Monad.State.Strict (evalState)
import Data.List (sort)
import Ojoxux.Core.Fireworks.Program (Section (..), buildProgram, sectionAt)
import Ojoxux.Core.Fireworks.Random (seeded)
import Ojoxux.Core.Fireworks.Types
import Test.Hspec

program :: [Cue]
program = evalState buildProgram (seeded 5)

spec :: Spec
spec = describe "Fireworks.Program" $ do
    it "at の昇順に並ぶ" $
        map at program `shouldBe` sort (map at program)

    it "開幕は 1500 / 5000 / 8500ms の xlarge 3 発" $ do
        let opening = take 3 program
        map at opening `shouldBe` [1500, 5000, 8500]
        map (kind . shell) opening `shouldBe` [Kiku, ShinIri, IroHenka]
        all ((== XLarge) . grade . shell) opening `shouldBe` True

    it "止め玉は 58200ms の三重芯" $ do
        let lastCue = last program
        at lastCue `shouldBe` 58200
        kind (shell lastCue) `shouldBe` ShinIri
        triple (shell lastCue) `shouldBe` True

    it "フィナーレは 51000〜56560ms に収まる" $ do
        let finale = filter (\c -> at c >= 51000 && at c < 58200) program
        length finale `shouldBe` 86
        all (\c -> at c <= 56560) finale `shouldBe` True

    it "同じシードなら同じ演目" $
        map at (evalState buildProgram (seeded 5)) `shouldBe` map at program

    it "区間の境界" $ do
        map sectionAt [0, 9999, 10000, 22000, 32500, 43500, 51000, 58200]
            `shouldBe` [Opening, Opening, FirstAct, Starmine, Interlude, SecondStarmine, Finale, Tomedama]
