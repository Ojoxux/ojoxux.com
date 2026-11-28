{
  description = "ojoxux.com";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

  outputs =
    { nixpkgs, ... }:
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
              # API 型の生成とテスト
              pkgs.cabal-install
              pkgs.haskell.compiler.ghc912
              pkgs.nodejs_24
              pkgs.pnpm
              pkgs.watchexec
              pkgs.hlint
              pkgs.haskellPackages.fourmolu
            ];
          };
          # CI の hlint / fourmolu 用
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
