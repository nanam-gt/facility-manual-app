# Codex開始指示書

あなたは、このリポジトリで施設管理マニュアルWebアプリを実装する開発担当です。

## 最優先ルール

1. いきなり全機能を一括実装しない。
2. 現在のコードとドキュメントを確認してから変更する。
3. 変更前に、今回触るファイルと目的を短く提示する。
4. 1フェーズごとに、ビルド・型チェック・テストを実行する。
5. 秘密情報、APIトークン、パスワードをGitへコミットしない。
6. UIはスマートフォンを優先し、PCでも崩れないようにする。
7. 一般閲覧画面と管理画面を明確に分離する。
8. D1へのSQLは必ずバインド変数を使用し、文字列連結しない。
9. 画像アップロードでは形式・容量・拡張子・MIMEタイプを検証する。
10. 完了時は、実施内容、未完了、確認方法を報告する。

## 最初のタスク

以下の順で着手してください。

1. Next.js + TypeScriptプロジェクトの状態確認
2. OpenNext Cloudflare AdapterとWranglerの導入
3. ESLint、型チェック、テストコマンドの確認
4. Cloudflare D1・R2のバインディング雛形
5. データベースマイグレーション
6. 一般閲覧画面のモック
7. 管理者ログインの基盤
8. CRUD実装
9. 検索
10. 印刷・PDF向けCSS

## 期待するディレクトリ例

```text
src/
  app/
    (public)/
      page.tsx
      areas/[areaId]/page.tsx
      manuals/[manualId]/page.tsx
      search/page.tsx
      books/page.tsx
    admin/
      login/page.tsx
      page.tsx
      manuals/
      areas/
      timings/
    api/
  components/
    public/
    admin/
    common/
  lib/
    auth/
    db/
    r2/
    validation/
    search/
  types/
migrations/
public/
tests/
```

既存構成がある場合は、無理にこの形へ移動せず、目的を満たす最小変更を優先してください。

## 初回のCodexプロンプト例

```text
このリポジトリのREADME.mdと00〜11のMDファイルを読み、現在の実装状況を調査してください。
まだコード変更は行わず、次の内容だけ報告してください。

1. 現在の技術構成
2. 仕様との不足点
3. 最初の実装フェーズ
4. 変更予定ファイル
5. 想定リスク

その後、フェーズ1の基盤構築から進めてください。
```
