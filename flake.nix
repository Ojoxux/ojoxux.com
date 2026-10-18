{
  description = "ojoxux.com";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    ghc-wasm-meta.url = "gitlab:haskell-wasm/ghc-wasm-meta?host=gitlab.haskell.org";
  };

  outputs =
    { nixpkgs, ghc-wasm-meta, ... }:
    let
      supportedSystems = [
        "aarch64-darwin"
        "aarch64-linux"
        "x86_64-linux"
      ];

      forAllSystems =
        function:
        nixpkgs.lib.genAttrs supportedSystems (
          system: function system nixpkgs.legacyPackages.${system}
        );
    in
    {
      devShells = forAllSystems (
        system: pkgs: {
          default = pkgs.mkShellNoCC {
            packages = [
              # ネイティブ GHC（テストと型生成）。cabal-install を先に置き、
              # ghc-wasm-meta 側の cabal より優先させる
              pkgs.cabal-install
              pkgs.haskell.compiler.ghc912
              # ghc-wasm-meta も node を同梱しているので、CI と同じ Node 24 を先に置く
              pkgs.nodejs_24
              pkgs.pnpm
              # GHC WASM 9.14 一式（wasm32-wasi-ghc / wasm32-wasi-cabal / wasm-opt / wasm-tools）
              ghc-wasm-meta.packages.${system}.all_9_14
              pkgs.watchexec
              pkgs.hlint
              pkgs.haskellPackages.fourmolu
            ];
          };
          # CI の hlint / fourmolu 用。WASM の GHC などを落とさずに済むよう最小限にする
          lint = pkgs.mkShellNoCC {
            packages = [
              pkgs.hlint
              pkgs.haskellPackages.fourmolu
            ];
          };
        }
      );

      formatter = forAllSystems (_: pkgs: pkgs.nixfmt);
    };
}
