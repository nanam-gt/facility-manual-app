# Cloudflare設定手順

## 1. 前提

- Cloudflareアカウント
- Node.js
- npm
- GitHub
- Wrangler

## 2. 構成

フルスタックNext.jsをCloudflare Workersへデプロイする。

必要パッケージの例：

```bash
npm install @opennextjs/cloudflare@latest
npm install --save-dev wrangler@latest
```

実際の導入時は公式ドキュメントと互換性を確認する。

## 3. リソース名

推奨：

```text
Worker: facility-manual-app
D1: facility-manual-db
R2: facility-manual-images
```

Previewを分ける場合：

```text
facility-manual-app-preview
facility-manual-db-preview
facility-manual-images-preview
```

## 4. バインディング名

```text
D1: DB
R2: MANUAL_IMAGES
```

アプリ内で名称を統一する。

## 5. Wrangler設定の概念例

実際のスキーマは導入バージョンの公式形式に合わせる。

```jsonc
{
  "name": "facility-manual-app",
  "main": ".open-next/worker.js",
  "compatibility_date": "YYYY-MM-DD",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "facility-manual-db",
      "database_id": "<DATABASE_ID>"
    }
  ],
  "r2_buckets": [
    {
      "binding": "MANUAL_IMAGES",
      "bucket_name": "facility-manual-images"
    }
  ]
}
```

## 6. Secrets

例：

```text
SESSION_SECRET
INITIAL_ADMIN_EMAIL
INITIAL_ADMIN_PASSWORD
```

初期管理者パスワードを環境変数のまま恒久利用しない。初期化後は管理者テーブルへ安全に移行し、不要な秘密値を削除する。

ローカル秘密情報：

```text
.dev.vars
```

Gitへコミットしない。

## 7. D1

- Production DB作成
- Preview DB作成
- migrations適用
- seedは本番で必要最小限
- 本番データをローカルへ無断コピーしない

例：

```bash
npx wrangler d1 migrations apply facility-manual-db --remote
```

コマンドはWranglerの現行仕様に合わせて調整する。

## 8. R2

- バケット作成
- 公開バケットにしないことを基本とする
- Worker経由で画像配信
- Content-Type設定
- Cache-Control設定
- 予測不能なキーを使用

## 9. デプロイ

OpenNext用スクリプト例：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
    "cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"
  }
}
```

スクリプト名・コマンドは導入パッケージの現行仕様に合わせる。

## 10. 独自ドメイン

初期は`workers.dev`のURLで動作確認し、安定後にサブドメインを設定する。

例：

```text
manual.example.jp
```

## 11. 無料枠対策

- 写真を圧縮
- 不要画像を削除
- 検索の全件走査を避ける
- 一覧にページング
- Workerへの無駄なAPI呼び出しを減らす
- 管理画面の自動ポーリングを避ける
