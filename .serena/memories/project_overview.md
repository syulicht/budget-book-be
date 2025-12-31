# Budget Book Backend - プロジェクト概要

## プロジェクトの目的
家計簿アプリケーション (Budget Book) のバックエンドAPI。予算管理と記録機能を提供。

## 技術スタック
- **言語**: TypeScript
- **ランタイム**: Node.js
- **フレームワーク**: Express.js
- **データベース**: MySQL
- **ORM**: Prisma
- **開発ツール**: 
  - nodemon (開発時のホットリロード)
  - tsx (TypeScript実行)
  - ts-node
- **デプロイ**: AWS (ECS, ECR), Docker
- **環境変数管理**: dotenv, AWS Systems Manager Parameter Store

## プロジェクト構造
```
budget-book-be/
├── src/
│   ├── app.ts              # Expressアプリケーション設定
│   ├── server.ts           # サーバーエントリーポイント
│   ├── controllers/        # コントローラー層
│   ├── middlewares/        # ミドルウェア (エラーハンドリング等)
│   ├── routes/            # ルーティング定義
│   ├── lib/               # ライブラリ (Prismaクライアント等)
│   └── types/             # 型定義
├── prisma/
│   ├── schema.prisma      # データベーススキーマ
│   └── migrations/        # マイグレーションファイル
├── dist/                  # ビルド出力 (TypeScriptコンパイル後)
└── node_modules/          # 依存パッケージ
```

## 主要な機能
- ヘルスチェックエンドポイント (`/api/health`)
- カテゴリ管理 (Category)
- 予算ベース管理 (BudgetBase)
- 予算記録管理 (Budget)
- 定期予算管理 (Subscription)

## データベーススキーマ

### モデル構成
- **Category**: カテゴリ情報 (id, name, user_id, created_at, updated_at)
- **BudgetBase**: 予算のベース情報 (id, category_id, amount, memo, created_at, updated_at)
- **Budget**: 個別の予算記録 (id, budget_base_id, user_id, date, created_at, updated_at)
- **Subscription**: 定期的な予算 (id, budget_base_id, user_id, frequency, day_order, start_date, end_date, next_date, created_at, updated_at)

### Enum
- **Frequency**: 定期予算の頻度 (YEAR, MONTH, WEEK, DAY)

### 命名規則
- モデル名: PascalCase (例: BudgetBase)
- テーブル名: snake_case (例: budget_base)
- フィールド名: snake_case (例: user_id, created_at)
