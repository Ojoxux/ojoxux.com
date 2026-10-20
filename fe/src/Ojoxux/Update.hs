{-# LANGUAGE LambdaCase #-}
{-# LANGUAGE OverloadedRecordDot #-}
{-# LANGUAGE OverloadedStrings #-}

module Ojoxux.Update (updateModel) where

import Control.Monad (when)
import Data.Maybe (fromMaybe)
import Miso
import Ojoxux.Api.Types qualified as Api
import Ojoxux.Core.CountUp (countDurationMs, countValueAt)
import Ojoxux.Core.Remote (Remote (..))
import Ojoxux.Ffi qualified as Ffi
import Ojoxux.Fireworks.Loop qualified as Fireworks
import Ojoxux.Model

type AppEffect = Effect () () Model Action

-- | 現行の WritingSection と同じ件数
postLimit :: MisoString
postLimit = "5"

countUpSub :: MisoString
countUpSub = "count-up"

updateModel :: Action -> AppEffect
updateModel = \case
    Init -> do
        io (GotBirthday <$> Ffi.readBirthdayMode)
        fetchWakaTime
        fetchPosts
        postVisit
    GotBirthday isBirthday ->
        modify (\m -> m{birthday = isBirthday})
    GotWakaTime remote ->
        modify (\m -> m{wakaTime = remote})
    GotPosts remote ->
        modify (\m -> m{posts = remote})
    GotVisit remote -> do
        modify (\m -> m{visitor = remote, countShown = 0, countStart = Nothing})
        case remote of
            Loaded _ -> io (StartCount <$> Ffi.prefersReducedMotion)
            _ -> pure ()
    StartCount reduced -> do
        m <- get
        case m.visitor of
            Loaded target
                | reduced -> put m{countShown = target}
                | otherwise -> startSub countUpSub (rAFSub CountTick)
            _ -> pure ()
    CountTick ts -> do
        m <- get
        case m.visitor of
            Loaded target -> do
                let start = fromMaybe ts m.countStart
                    elapsed = ts - start
                put m{countStart = Just start, countShown = countValueAt target elapsed}
                when (elapsed >= countDurationMs) (stopSub countUpSub)
            _ -> stopSub countUpSub
    RetryVisit -> do
        m <- get
        case m.visitor of
            Failed -> put m{visitor = Loading} >> postVisit
            _ -> pure ()
    ToggleFireworks ->
        modify (\m -> m{fireworks = not m.fireworks})
    FireworksCreated ref ->
        io_ (Fireworks.start ref)
    FireworksDestroyed _ ->
        io_ Fireworks.stop
    HatenaStarCreated ->
        io_ Ffi.initHatenaStar

fetchWakaTime :: AppEffect
fetchWakaTime =
    getJSON "/api/wakatime" [] (GotWakaTime . Loaded . body) (failed (GotWakaTime Failed))

fetchPosts :: AppEffect
fetchPosts =
    getJSON ("/api/posts?limit=" <> postLimit) [] (GotPosts . Loaded . body) (failed (GotPosts Failed))

postVisit :: AppEffect
postVisit =
    postJSON' "/api/visit" () [] (GotVisit . Loaded . Api.count . body) (failed (GotVisit Failed))

-- | エラーレスポンスの中身は使わない（現行もログ以上のことはしていない）
failed :: action -> Response JSVal -> action
failed action _ = action
