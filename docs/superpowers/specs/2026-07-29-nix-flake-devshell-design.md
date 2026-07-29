# Nix flake devShell design

Date: 2026-07-29  
Status: approved

## Goal

Provide a reproducible local toolchain for `ojoxux.com` via Nix flakes. Fix **Node.js 24** and **pnpm 9** so `direnv` + `nix develop` yield the same CLI versions across machines. Application dependencies, builds, and Cloudflare deploy remain managed by pnpm / wrangler as today.

## Non-goals

- Packaging the Next.js / OpenNext app as a Nix derivation
- Driving GitHub Actions from the flake
- Replacing `pnpm-lock.yaml` or installing npm packages through Nix
- Pinning Biome, wrangler, or TypeScript in Nix (they come from `node_modules`)

## Approach

Thin flake matching the docbridge pattern: `flake.nix` + `flake.lock` + `.envrc`.

## Files

### `flake.nix`

- `description`: ojoxux.com development environment
- `inputs.nixpkgs.url`: `github:NixOS/nixpkgs/nixpkgs-unstable`
- Systems: `aarch64-darwin`, `x86_64-darwin`, `aarch64-linux`, `x86_64-linux`
- `devShells.default`: `pkgs.mkShellNoCC` with:
  - `pkgs.nodejs_24`
  - `pkgs.pnpm`
- `formatter`: `pkgs.nixpkgs-fmt` for all systems

`mkShellNoCC` is intentional: this is a pure JS/TS project; skipping the C compiler avoids macOS Apple SDK / toolchain side effects (same rationale as docbridge).

### `flake.lock`

Generated on first evaluation / `nix flake lock` and committed so input revisions are shared.

### `.envrc`

```
use flake
dotenv_if_exists
```

- `use flake` loads `devShells.default`
- `dotenv_if_exists` loads `.env` / `.env.local` when present (gitignored / local secrets stay out of Nix)

## Workflow

1. Enter the repo; run `direnv allow` once
2. Shell provides Node 24 and pnpm 9
3. `pnpm install` then `pnpm dev` / existing scripts unchanged

## Out of scope for follow-ups (unless requested later)

- CI nix installers
- `package.json` `engines` / `packageManager` fields
- Extra shell packages (`git`, `just`, etc.)
