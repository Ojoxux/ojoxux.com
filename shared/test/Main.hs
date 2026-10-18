{-# LANGUAGE OverloadedStrings #-}

module Main (main) where

import Data.Aeson (decode, encode)
import Data.ByteString.Lazy.Char8 qualified as BL
import Data.Text.Lazy.Encoding qualified as TLE
import Ojoxux.Api.Types
import Test.Hspec

main :: IO ()
main = hspec $ do
    describe "WakaTimeActivity" $ do
        -- ByteString の文字列リテラルは非 ASCII を切り詰めるので、Text から UTF-8 にエンコードする
        it "Worker が返す JSON をデコードできる" $
            decode
                ( TLE.encodeUtf8
                    "{\"rangeText\":\"10/12 – 10/18\",\"totalText\":\"12 hrs 3 mins\",\"languages\":[{\"name\":\"Haskell\",\"text\":\"5 hrs\",\"percent\":41.5}]}" ::
                    BL.ByteString
                )
                `shouldBe` Just
                    WakaTimeActivity
                        { rangeText = "10/12 – 10/18"
                        , totalText = "12 hrs 3 mins"
                        , languages = [WakaTimeLanguage{name = "Haskell", text = "5 hrs", percent = 41.5}]
                        }

        it "往復しても値が変わらない" $ do
            let activity = WakaTimeActivity "a" "b" [WakaTimeLanguage "Nix" "1 hr" 10]
            decode (encode activity) `shouldBe` Just activity

    describe "BlogPost" $ do
        it "thumbnail が無い JSON をデコードできる" $
            decode "{\"title\":\"t\",\"link\":\"https://example.com\",\"pubDate\":\"2026-10-18\"}"
                `shouldBe` Just (BlogPost "t" "https://example.com" "2026-10-18" Nothing)

        it "thumbnail がある JSON をデコードできる" $
            decode "{\"title\":\"t\",\"link\":\"l\",\"pubDate\":\"d\",\"thumbnail\":\"https://cdn/x.png\"}"
                `shouldBe` Just (BlogPost "t" "l" "d" (Just "https://cdn/x.png"))

        it "thumbnail が Nothing のときはキーを出力しない" $
            BL.unpack (encode (BlogPost "t" "l" "d" Nothing)) `shouldNotContain` "thumbnail"

    describe "VisitResult" $ do
        it "Worker が返す JSON をデコードできる" $
            decode "{\"count\":12345}" `shouldBe` Just (VisitResult 12345)

        it "オブジェクト {\"count\": n} としてエンコードする" $
            encode (VisitResult 1) `shouldBe` "{\"count\":1}"
