# ojoxux.com

Haskell Miso（GHC WASM）のフロントエンドと Hono の Cloudflare Worker からなるサイトです。フロントエンドは GHC WASM でビルドされた `.wasm` を Vite でバンドルし、Worker（Hono）が API と静的アセットを配信します。Vite は `@cloudflare/vite-plugin` 経由で Worker とブラウザ側を一緒にビルドします。API のリクエスト・レスポンスの型は `shared/` の Haskell から TypeScript を生成して共有しています。

## 構成

- `fe/` … フロントエンド（Miso）
  - `core/` … 純粋ロジック（テスト対象）
  - `src/` … ビュー等
  - `js/` … ブートと JS ブリッジ、花火
  - `styles.css`
- `shared/` … API 型と gen-ts（TypeScript 生成）
- `worker/` … Hono の Cloudflare Worker
- `scripts/` … ビルド・監視・型生成のスクリプト
- `public/` … 静的ファイル
- `migrations/d1` … D1 のマイグレーション

## セットアップ

```sh
nix develop            # direnv を使っていれば自動で入る
pnpm install
cabal update && wasm32-wasi-cabal update   # 初回のみ（cabal.project で index-state を固定）
pnpm db:migrate:local
```

ローカルの Worker 用に `.dev.vars` を作り、`WAKATIME_API_KEY` を設定してください。

```sh
WAKATIME_API_KEY=...
```

## 開発

```sh
pnpm build:wasm       # 一度だけ実行して fe/wasm-out を作る
pnpm dev              # 開発サーバー
pnpm watch:fe         # 別ターミナルで。Haskell を変更すると WASM を再ビルドし、自動リロードされる
pnpm gen:types        # shared/ の Haskell から API 型を生成
```

`pnpm typecheck` は `fe/wasm-out` の生成物に依存するため、先に `pnpm build:wasm` が必要です。

## テストとチェック

```sh
pnpm test:hs                           # Haskell のテスト（api-test, fe-core-test）
pnpm test                              # Vitest
pnpm typecheck                         # TypeScript の型チェック
pnpm check                             # Biome
nix develop .#lint -c hlint shared fe  # hlint
fourmolu --mode check $(git ls-files "*.hs")   # Haskell の整形チェック（書き換えは --mode inplace）
```

## ビルドとデプロイ

```sh
pnpm build            # 本番ビルド。WRANGLER_CONFIG で設定ファイルを切り替える（未指定なら wrangler.jsonc）
```

デプロイは CI で行います。`staging` ブランチへの push で ojoxux-com-staging に、`main` への push で ojoxux-com にデプロイされます。手元から本番に出す場合は次のコマンドを使います。

```sh
pnpm run deploy:prod
```

D1 のマイグレーションも本番に適用してからデプロイします。

## 誕生日モードの確認

次のどちらかで誕生日モードを有効にできます。

- ブラウザの DevTools で `localStorage.setItem("birthday", "1")` を実行してリロードする
- ビルド時に `VITE_BIRTHDAY_MODE=1` を設定する
