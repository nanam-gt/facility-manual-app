# データモデル

## 1. 基本方針

- 主キーはUUIDまたはULID文字列を推奨
- 日時はISO 8601文字列またはUnix timestampで統一
- 論理削除を必要箇所に採用
- 表示順は整数
- SQLはマイグレーションファイルで管理
- 外部キーを設定する
- 更新日時をすべての主要テーブルに持たせる

## 2. テーブル

### administrators

| 列 | 型 | 必須 | 説明 |
|---|---|---:|---|
| id | TEXT | yes | 主キー |
| email | TEXT | yes | 一意 |
| display_name | TEXT | yes | 表示名 |
| password_hash | TEXT | yes | ハッシュ |
| is_active | INTEGER | yes | 0/1 |
| created_at | TEXT | yes | 作成日時 |
| updated_at | TEXT | yes | 更新日時 |

### admin_sessions

| 列 | 型 | 必須 | 説明 |
|---|---|---:|---|
| id | TEXT | yes | セッションID |
| administrator_id | TEXT | yes | 管理者ID |
| token_hash | TEXT | yes | セッショントークンのハッシュ |
| expires_at | TEXT | yes | 有効期限 |
| created_at | TEXT | yes | 作成日時 |
| last_used_at | TEXT | no | 最終利用 |
| revoked_at | TEXT | no | 失効日時 |

### areas

| 列 | 型 | 必須 | 説明 |
|---|---|---:|---|
| id | TEXT | yes | 主キー |
| code | TEXT | no | 例：02 |
| name | TEXT | yes | 宿泊棟など |
| short_name | TEXT | no | 短縮名 |
| description | TEXT | no | 説明 |
| color_key | TEXT | no | UI識別 |
| display_order | INTEGER | yes | 表示順 |
| is_active | INTEGER | yes | 0/1 |
| created_at | TEXT | yes | 作成日時 |
| updated_at | TEXT | yes | 更新日時 |

### timings

| 列 | 型 | 必須 | 説明 |
|---|---|---:|---|
| id | TEXT | yes | 主キー |
| name | TEXT | yes | OUT後など |
| description | TEXT | no | 説明 |
| display_order | INTEGER | yes | 表示順 |
| is_active | INTEGER | yes | 0/1 |
| created_at | TEXT | yes | 作成日時 |
| updated_at | TEXT | yes | 更新日時 |

### manuals

| 列 | 型 | 必須 | 説明 |
|---|---|---:|---|
| id | TEXT | yes | 主キー |
| title | TEXT | yes | タイトル |
| slug | TEXT | yes | URL用、一意 |
| area_id | TEXT | yes | エリア |
| timing_id | TEXT | yes | タイミング |
| summary | TEXT | no | 概要 |
| preparation | TEXT | no | 準備物 |
| tools | TEXT | no | 道具 |
| chemicals | TEXT | no | 洗剤 |
| target_staff | TEXT | no | 対象 |
| frequency | TEXT | no | 頻度 |
| duration_mode | TEXT | yes | manual/steps_sum/hidden |
| duration_min_minutes | INTEGER | no | 最短 |
| duration_max_minutes | INTEGER | no | 最長 |
| duration_note | TEXT | no | 約、程度など |
| general_warning | TEXT | no | 全体注意 |
| completion_note | TEXT | no | 完了確認 |
| search_keywords | TEXT | no | 検索語 |
| status | TEXT | yes | draft/published/private |
| display_order | INTEGER | yes | 表示順 |
| published_at | TEXT | no | 公開日時 |
| created_at | TEXT | yes | 作成日時 |
| updated_at | TEXT | yes | 更新日時 |
| deleted_at | TEXT | no | 論理削除 |

### manual_steps

| 列 | 型 | 必須 | 説明 |
|---|---|---:|---|
| id | TEXT | yes | 主キー |
| manual_id | TEXT | yes | 所属 |
| title | TEXT | yes | 手順名 |
| description | TEXT | no | 説明 |
| warning | TEXT | no | 注意 |
| completion_criteria | TEXT | no | 完了基準 |
| tools | TEXT | no | 道具 |
| duration_minutes | INTEGER | no | 手順時間 |
| duration_note | TEXT | no | 約など |
| image_object_key | TEXT | no | R2キー |
| image_alt | TEXT | no | 代替テキスト |
| image_width | INTEGER | no | 幅 |
| image_height | INTEGER | no | 高さ |
| image_mime_type | TEXT | no | MIME |
| display_order | INTEGER | yes | 表示順 |
| created_at | TEXT | yes | 作成日時 |
| updated_at | TEXT | yes | 更新日時 |
| deleted_at | TEXT | no | 論理削除 |

### manual_relations

| 列 | 型 | 必須 | 説明 |
|---|---|---:|---|
| manual_id | TEXT | yes | 元 |
| related_manual_id | TEXT | yes | 関連先 |
| display_order | INTEGER | yes | 表示順 |

## 3. インデックス

最低限：

```sql
CREATE UNIQUE INDEX idx_administrators_email
ON administrators(email);

CREATE UNIQUE INDEX idx_manuals_slug
ON manuals(slug);

CREATE INDEX idx_manuals_public_filter
ON manuals(status, area_id, timing_id, display_order);

CREATE INDEX idx_manual_steps_manual
ON manual_steps(manual_id, display_order);

CREATE INDEX idx_sessions_token
ON admin_sessions(token_hash);

CREATE INDEX idx_sessions_expiry
ON admin_sessions(expires_at);
```

## 4. 削除ルール

- エリア・タイミング：使用中は原則削除不可。無効化を優先
- マニュアル：論理削除
- 手順：論理削除またはトランザクション内で物理削除
- 写真：DB更新成功後に旧R2オブジェクトを削除
- 復旧余地を持たせる場合、写真の完全削除は一定期間後

## 5. バックアップ形式

JSON例：

```json
{
  "version": 1,
  "exportedAt": "2026-08-05T00:00:00Z",
  "areas": [],
  "timings": [],
  "manuals": [],
  "steps": []
}
```
