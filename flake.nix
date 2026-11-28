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
              pkgs.nodejs_24
              pkgs.pnpm
              pkgs.watchexec
            ];
          };
        }
      );

      formatter = forAllSystems (_: pkgs: pkgs.nixfmt);
    };
}
