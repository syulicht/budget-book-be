# Budget Book Backend

## プロジェクト概要

家計簿アプリケーション (Budget Book) のバックエンド API。TypeScript + Express.js + Prisma (MySQL) で構築。

## 技術スタック

- **言語**: TypeScript (ES2022, NodeNext modules)
- **フレームワーク**: Express.js
- **データベース**: MySQL + Prisma ORM
- **開発環境**: Node.js, nodemon, tsx
- **デプロイ**: Docker, AWS (ECS, ECR)

## コーディング規約

### TypeScript

- Strict モードを有効化
- 明示的な型定義を優先
- `any` の使用は避ける
- 関数の戻り値型を明示する
- 未使用の変数/パラメータは禁止

### 命名規則

- **ファイル名**: camelCase (例: `userController.ts`)
- **変数/関数**: camelCase
- **クラス/型/インターフェース**: PascalCase
- **定数**: UPPER_SNAKE_CASE

### インポート

- ESModules 形式を使用 (`import/export`)
- 相対インポートには `.js` 拡張子を必ず付ける

  ```typescript
  // Good
  import routes from "./routes/index.js";
  import { errorHandler } from "./middlewares/errorHandler.js";

  // Bad
  import routes from "./routes/index";
  ```

- インポート順序: 外部パッケージ → 内部モジュール

### プロジェクト構造

```
src/
├── app.ts              # Expressアプリケーション設定
├── server.ts           # サーバーエントリーポイント
├── controllers/        # ビジネスロジック、リクエスト/レスポンス処理
├── middlewares/        # 共通処理 (エラーハンドリング、認証等)
├── routes/            # エンドポイント定義
├── lib/               # 共通ライブラリ (Prismaクライアント等)
├── types/             # 型定義
└── generated/         # 自動生成ファイル (Prisma等)
```

### 設計パターン

- **コントローラー**: ビジネスロジックを含み、リクエスト/レスポンスを処理
- **ルート**: エンドポイント定義のみ、ロジックは含まない
- **ミドルウェア**: 横断的関心事を処理
- **エラーハンドリング**: 一元的にエラーミドルウェアで処理

## Prisma 規約

- モデル名: PascalCase (例: `BudgetBase`)
- テーブル名: snake_case (例: `budget_base`) - `@@map` ディレクティブを使用
- フィールド名（TypeScript 側）: snake_case (例: `user_id`)
- Enum 名: PascalCase、値: UPPER_SNAKE_CASE
- クライアント出力先: `src/generated/prisma`

### データベーススキーマ

**主要なモデル:**

- `Category` - カテゴリ管理
  - フィールド: id, name, user_id, created_at, updated_at
  - リレーション: BudgetBase (1:N)

- `BudgetBase` - 予算ベース情報
  - フィールド: id, category_id, amount, memo, created_at, updated_at
  - リレーション: Category (N:1), Budget (1:N), Subscription (1:N)

- `Budget` - 予算記録
  - フィールド: id, budget_base_id, user_id, date, created_at, updated_at
  - リレーション: BudgetBase (N:1)

- `Subscription` - 定期予算
  - フィールド: id, budget_base_id, user_id, frequency, day_order, start_date, end_date, next_date, created_at, updated_at
  - リレーション: BudgetBase (N:1)

**Enum:**

- `Frequency` - 定期予算の頻度 (YEAR, MONTH, WEEK, DAY)

### Prisma クライアントの使用

```typescript
import { prisma } from "./lib/prisma.js";

// データ取得
const categories = await prisma.category.findMany();

// リレーション込みで取得
const budgetBase = await prisma.budgetBase.findUnique({
  where: { id: 1 },
  include: {
    category: true,
    budgets: true,
    subscriptions: true,
  },
});
```

## 開発コマンド

- `npm run dev`: 開発サーバー起動 (ホットリロード)
- `npm run build`: TypeScript コンパイル
- `npm start`: プロダクション実行
- `npx prisma migrate dev`: マイグレーション生成・実行
- `npx prisma generate`: Prisma クライアント生成
- `npx prisma studio`: Prisma Studio 起動

## API 設計

- ベースパス: `/api`
- レスポンス形式: JSON
- エラーハンドリング: 統一的なエラーミドルウェア使用

## セキュリティ

- 環境変数は `.env` で管理 (gitignore 対象)
- 本番環境では AWS Systems Manager Parameter Store を使用
- 認証/認可機能を実装する際は適切なミドルウェアを使用

## コメント

- 日本語コメント可
- 複雑なロジックには必ず説明を追加
- 公開 API 相当の関数には JSDoc を推奨

## コード品質

### ESLint

- TypeScript ESLint を使用
- `npm run lint`: Lint チェック
- `npm run lint:fix`: 自動修正
- コミット前に必ず lint エラーを解消すること

### Prettier

- コードフォーマッターとして使用
- `npm run format`: コード整形
- `npm run format:check`: フォーマットチェック
- セミコロンあり、シングルクォートなし、tabWidth: 2

### GitHub Actions

- 全てのブランチで push 時に自動 Lint チェックが実行される
- Lint エラーがある場合は CI が失敗する

## 注意事項

- テストフレームワークは未導入 (将来的に導入予定)
- TypeScript コンパイルエラーは必ず解決すること
- ESLint エラーは必ず解決してからコミットすること
