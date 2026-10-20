-- | 星（粒子）の 1 ステップ分の更新と色。旧 particle.ts に対応する
module Ojoxux.Core.Fireworks.Particle (
    updateParticle,
    particleColor,
) where

import Ojoxux.Core.Fireworks.Palette (white)
import Ojoxux.Core.Fireworks.Types (Color, Particle (..))

-- | 色変わりで 2 色目に切り替わる寿命の割合
colorSwitch :: Double
colorSwitch = 0.45

updateParticle :: Particle -> Particle
updateParticle p =
    let vx' = vx p * drag p
        vy' = vy p * drag p + gravity p
     in p{vx = vx', vy = vy', px = px p + vx', py = py p + vy', life = life p - 1}

particleColor :: Particle -> Color
particleColor p = case colorStops p of
    [] -> white
    [c] -> c
    (c1 : c2 : _)
        | progress < colorSwitch -> c1
        | otherwise -> c2
  where
    progress = 1 - fromIntegral (life p) / fromIntegral (maxLife p) :: Double
