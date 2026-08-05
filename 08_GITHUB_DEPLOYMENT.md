# GitHub・デプロイ運用

## 1. リポジトリ

推奨名：

```text
facility-manual-app
```

Privateリポジトリを推奨。

## 2. ブランチ

```text
main        本番
develop     統合
feature/*   機能
fix/*       修正
```

小規模運用では`main`＋feature branchだけでもよい。

## 3. コミット

例：

```text
feat: マニュアル登録画面を追加
fix: 所要時間の範囲表示を修正
docs: Cloudflare設定手順を更新
test: 公開状態のテストを追加
```

## 4. GitHubへ含めないもの

- `.dev.vars`
- APIトークン
- Cloudflare秘密情報
- 本番DBのエクスポート
- 実際の管理者パスワード
- 個人情報
- 写真原本
- `.open-next`
- ビルド成果物

## 5. CI

Pull Requestまたはpush時：

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
```

## 6. デプロイ

方法A：

- Cloudflare公式のGitHub連携またはWorkers Builds

方法B：

- GitHub Actions
- `cloudflare/wrangler-action`

どちらかに統一し、二重デプロイを避ける。

## 7. 本番反映

- mainへのマージ
- CI成功
- Preview確認
- migration確認
- 本番デプロイ
- スモークテスト
- 問題時ロールバック

## 8. マイグレーション

アプリのデプロイとDB変更の順序に注意する。

安全な基本：

1. 後方互換の列追加
2. アプリ更新
3. データ移行
4. 古い列削除は別リリース

破壊的なDDLを同時に実施しない。
