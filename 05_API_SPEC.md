# API・サーバー処理仕様

Next.jsのRoute HandlersまたはServer Actionsで実装する。公開APIを無制限に増やさず、用途ごとに認可する。

## 1. 公開読み取り

### `GET /api/public/areas`

公開中のエリア一覧。

### `GET /api/public/timings`

有効タイミング一覧。

### `GET /api/public/manuals`

クエリ：

- `areaId`
- `timingId`
- `q`
- `page`
- `limit`

公開状態が`published`のみ返す。

### `GET /api/public/manuals/[slug]`

公開マニュアル詳細。

下書き・非公開は404相当。

## 2. 管理認証

### `POST /api/admin/auth/login`

入力：

```json
{
  "email": "admin@example.jp",
  "password": "..."
}
```

成功時：

- HttpOnly
- Secure
- SameSite=LaxまたはStrict
- 適切な有効期限

のCookieを発行。

### `POST /api/admin/auth/logout`

セッション失効。

## 3. 管理CRUD

### エリア

- `GET /api/admin/areas`
- `POST /api/admin/areas`
- `PATCH /api/admin/areas/[id]`
- `DELETE /api/admin/areas/[id]`
- `POST /api/admin/areas/reorder`

### タイミング

- `GET /api/admin/timings`
- `POST /api/admin/timings`
- `PATCH /api/admin/timings/[id]`
- `DELETE /api/admin/timings/[id]`
- `POST /api/admin/timings/reorder`

### マニュアル

- `GET /api/admin/manuals`
- `POST /api/admin/manuals`
- `GET /api/admin/manuals/[id]`
- `PATCH /api/admin/manuals/[id]`
- `DELETE /api/admin/manuals/[id]`
- `POST /api/admin/manuals/[id]/duplicate`
- `POST /api/admin/manuals/reorder`

### 手順

手順はマニュアル更新と同一トランザクションで保存する方式を推奨。

必要なら：

- `POST /api/admin/manuals/[id]/steps`
- `PATCH /api/admin/steps/[stepId]`
- `DELETE /api/admin/steps/[stepId]`
- `POST /api/admin/manuals/[id]/steps/reorder`

## 4. 写真

### `POST /api/admin/uploads/manual-step-image`

multipart/form-data。

制約：

- JPEG、PNG、WebP
- 1ファイル
- 初期上限10MB
- 保存前に実画像形式を検証
- 画像寸法を検証
- ランダムなオブジェクトキー
- 元ファイル名を公開URLに使用しない

返却：

```json
{
  "objectKey": "manuals/xxx/steps/yyy.webp",
  "width": 1200,
  "height": 800,
  "mimeType": "image/webp"
}
```

### `DELETE /api/admin/uploads/manual-step-image`

認証必須。

## 5. バックアップ

- `GET /api/admin/export/json`
- `GET /api/admin/export/csv`
- `POST /api/admin/export/zip`

ZIP生成がWorkers制限に合わない場合は、JSON・CSVとR2オブジェクト一覧を優先し、ZIPは後続フェーズへ分離する。

## 6. エラー形式

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力内容を確認してください。",
    "fields": {
      "title": "タイトルは必須です。"
    }
  }
}
```

## 7. 共通ルール

- Zod等でサーバー側検証
- 管理APIは毎回セッション確認
- SQLはPrepared Statement
- 返却データに内部秘密情報を含めない
- エラー時にSQLやスタックトレースを公開しない
- 変更操作はCSRF対策を検討
- 更新競合対策として`updated_at`を送信し、必要に応じて楽観ロック
