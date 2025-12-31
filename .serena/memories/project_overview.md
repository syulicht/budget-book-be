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
- カテゴリ管理
- 予算ベース管理
- ユーザー管理
