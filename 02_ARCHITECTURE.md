# アーキテクチャ設計

## 1. 採用構成

- Next.js
- React
- TypeScript
- Cloudflare Workers
- OpenNext Cloudflare Adapter
- Cloudflare D1
- Cloudflare R2
- GitHub
- Wrangler

## 2. 重要な方針

フルスタックNext.jsアプリはCloudflare Workersへデプロイする。

Cloudflare Pagesは静的サイト向けとして扱い、このアプリでは、サーバー処理・D1・R2・認証が必要なため、OpenNext Cloudflare Adapterを使ったWorkersデプロイを基本とする。

## 3. 論理構成

```text
ブラウザ
  │
  ├ 一般閲覧画面
  └ 管理画面
       │
Next.js on Cloudflare Workers
  ├ Server Components / Route Handlers / Server Actions
  ├ 認証
  ├ 入力検証
  ├ D1アクセス
  └ R2アクセス
       │
       ├ Cloudflare D1
       └ Cloudflare R2
```

## 4. データの役割

### D1

- 管理者
- セッション
- エリア
- タイミング
- マニュアル
- 手順
- 写真のオブジェクトキー
- 表示順
- 公開状態
- 更新日時

### R2

- マニュアル写真
- 将来のバックアップファイル
- 必要に応じたエクスポートファイル

### GitHub

- ソースコード
- マイグレーション
- テスト
- 設定例
- ドキュメント

マニュアル本文や写真本体をGitHubへ保存しない。

## 5. 推奨ライブラリ

バージョンは導入時に最新安定版と互換性を確認する。

- `next`
- `react`
- `typescript`
- `@opennextjs/cloudflare`
- `wrangler`
- `zod`
- `drizzle-orm` またはD1 Binding API直接利用
- `bcryptjs` またはWorkers互換の安全なパスワードハッシュ手段
- テスト：Vitest
- E2E：Playwright
- フォーム：React Hook Formは任意

ORMは必須ではない。初期版では、SQLとマイグレーションの透明性を優先し、Drizzle ORMまたはD1 Binding APIを選ぶ。Prismaを使う場合は、Cloudflare D1の最新公式手順と互換性を確認する。

## 6. レンダリング方針

- 公開一覧：サーバー側で取得
- 公開詳細：サーバー側で取得
- 管理フォーム：サーバー処理とクライアント操作を併用
- 検索：GETクエリ
- 印刷画面：印刷専用ルート
- 画像：R2から認可済み経路で配信

## 7. キャッシュ方針

初期版では過度なキャッシュを避ける。

- 管理画面：キャッシュしない
- 公開マニュアル一覧：短時間キャッシュ可
- 公開マニュアル詳細：更新後に再検証
- R2画像：長めのブラウザキャッシュ
- 非公開・下書き：公開キャッシュへ混入させない

## 8. 環境

```text
local
preview
production
```

可能ならD1・R2を環境ごとに分離する。

```text
manual-db-local
manual-db-preview
manual-db-production

manual-images-preview
manual-images-production
```
