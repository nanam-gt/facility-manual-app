# 施設管理マニュアルWebアプリ 開発ドキュメント

このフォルダは、VS Code上のCodexで「施設管理マニュアルWebアプリ」を開発・調整するための資料一式です。

## 最初に読む順番

1. `00_CODEX_START_HERE.md`
2. `01_PRODUCT_SPEC.md`
3. `02_ARCHITECTURE.md`
4. `03_DATA_MODEL.md`
5. `04_SCREEN_SPEC.md`
6. `05_API_SPEC.md`
7. `06_DEVELOPMENT_PLAN.md`

CloudflareやGitHubの設定時は、以下も参照してください。

- `07_CLOUDFLARE_SETUP.md`
- `08_GITHUB_DEPLOYMENT.md`
- `09_SECURITY.md`
- `10_TEST_PLAN.md`
- `11_OPERATIONS.md`

## プロジェクトの前提

- アプリ名（仮）：施設管理マニュアル
- 利用者：管理者、一般スタッフ
- 一般スタッフ：ログインなしで閲覧
- 管理者：ログイン後に登録・編集
- 公開先：Cloudflare Workers
- データベース：Cloudflare D1
- 写真：Cloudflare R2
- コード管理：GitHub
- 言語：TypeScript
- フレームワーク：Next.js + React
- Cloudflare対応：OpenNext Cloudflare Adapter
- 目標費用：Cloudflare無料枠内
- OneDrive：アプリ稼働には使用しない

## 注意

この資料は設計と実装方針を定義するものです。Codexは、実装前に必ず既存ファイルと最新の公式ドキュメントを確認し、破壊的変更を避けてください。
