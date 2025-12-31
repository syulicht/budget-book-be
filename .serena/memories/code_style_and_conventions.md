# コードスタイルと規約

## TypeScript設定 (tsconfig.json)
- **ターゲット**: ES2022
- **モジュール**: NodeNext (ESModules)
- **Strict モード**: 有効
- **未使用変数/パラメータ**: エラー
- **暗黙的return**: エラー
- **Switch文のfall-through**: エラー

## コーディング規約

### 命名規則
- ファイル名: camelCase (例: `healthController.ts`, `errorHandler.ts`)
- 変数/関数: camelCase
- クラス/型: PascalCase
- 定数: UPPER_SNAKE_CASE (推奨)

### インポート
- ESModules形式を使用 (`import/export`)
- `.js` 拡張子を明示 (例: `import routes from "./routes/index.js"`)
- 順序: 外部パッケージ → 内部モジュール

### 型定義
- 明示的な型定義を優先
- `any` の使用は避ける
- 関数の戻り値型を明示

### コメント
- 日本語コメント可
- 複雑なロジックには説明を追加

## ファイル構成
- **コントローラー**: ビジネスロジックを含む、リクエスト/レスポンス処理
- **ミドルウェア**: 共通処理 (エラーハンドリング、認証等)
- **ルート**: エンドポイント定義のみ
- **lib**: 共通ライブラリ (Prismaクライアント等)
- **types**: 型定義

## Prisma規約
- スキーマファイル: `prisma/schema.prisma`
- クライアント出力: `src/generated/prisma`
- モデル名: PascalCase
- フィールド名: camelCase
- Enum: PascalCase (値は UPPER_SNAKE_CASE)
