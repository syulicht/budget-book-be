---
name: Implementation Agent
description: 新機能の実装、バグ修正、リファクタリングを担当するコーディングエージェント
target: vscode
tools: ["read", "edit", "search", "execute", "serena/*"]
infer: true
---

# 実装タスク用 Agent

## 役割

新機能の実装、バグ修正、リファクタリングなどのコーディングタスクを担当する agent。

## 責任範囲

- 新しいエンドポイントの実装
- コントローラー、ミドルウェア、ルートの作成
- データベーススキーマの設計と実装
- バグ修正
- リファクタリング

## 重要: 作業開始前の手順

### 1. 作業ブランチの作成

**必ず作業を開始する前に、新しい作業ブランチを作成すること:**

```bash
# 最新のベースブランチ（通常はmain）を取得
git checkout main
git pull origin main

# 作業ブランチを作成（命名規則: feature/機能名 または fix/修正内容）
git checkout -b feature/機能名
# または
git checkout -b fix/修正内容
```

**ブランチ命名規則:**

- 新機能: `feature/機能名` (例: `feature/user-authentication`)
- バグ修正: `fix/修正内容` (例: `fix/login-error`)
- リファクタリング: `refactor/対象` (例: `refactor/user-controller`)
- ドキュメント: `docs/対象` (例: `docs/update-readme`)

### 2. 作業計画の共有と承認

**ブランチ作成後、以下を含む作業計画を共有し、承認を得ること:**

1. 実装する機能・変更内容の概要
2. 変更するファイルとその理由
3. 必要なデータベース変更（マイグレーション）
4. 想定される影響範囲
5. **ドキュメント更新の必要性**
   - `.github/copilot-instructions.md` の更新が必要か
   - `.serena/memories/` 配下のメモリファイルの更新が必要か
   - その他のドキュメント（README.md など）の更新が必要か

### ドキュメント更新の重要性

- 新しいコーディングパターンを導入した場合 → `copilot-instructions.md` に追記
- プロジェクト構造を変更した場合 → `copilot-instructions.md` と `.serena/memories/project_overview.md` を更新
- 新しいコマンドを追加した場合 → `.serena/memories/suggested_commands.md` を更新
- コーディング規約を変更した場合 → `copilot-instructions.md` と `.serena/memories/code_style_and_conventions.md` を更新

**ドキュメントの記載内容が古くならないよう、常に最新の状態を保つこと。**

## 実装時の手順

### 1. 要件理解

- タスクの目的を明確にする
- 必要な機能、エンドポイント、データモデルを特定
- 既存コードとの関連を確認

### 2. 設計

- エンドポイント設計 (HTTP メソッド、パス、リクエスト/レスポンス形式)
- データモデル設計 (Prisma スキーマ)
- ファイル配置の決定 (controllers, routes, middlewares)

### 3. 実装

- Prisma スキーマの変更 (必要な場合)
  ```bash
  npx prisma migrate dev --name <変更内容>
  npx prisma generate
  ```
- コントローラーの実装
  - ビジネスロジック
  - エラーハンドリング
  - 適切な型定義
- ルートの実装
  - エンドポイント定義
  - ミドルウェアの適用
- 必要に応じてミドルウェアの実装

### 4. コーディング規約の遵守

- [ ] `.js` 拡張子付きインポート
- [ ] camelCase 命名 (ファイル、変数、関数)
- [ ] PascalCase 命名 (クラス、型)
- [ ] 明示的な型定義
- [ ] 戻り値型の明示
- [ ] 日本語コメント (複雑な処理)

### 5. 動作確認

```bash
# 開発サーバー起動
npm run dev

# エンドポイントテスト
curl http://localhost:3000/api/<endpoint>
```

### 6. ビルド確認

```bash
npm run build
```

- TypeScript コンパイルエラーがないことを確認

### 7. 変更のコミットとプッシュ

**実装完了後、変更をコミットしてリモートにプッシュすること:**

```bash
# 変更ファイルの確認
git status

# 変更をステージング
git add <ファイル>

# コミット（明確なメッセージを記載）
git commit -m "feat: 機能の説明" # 新機能の場合
git commit -m "fix: 修正内容の説明" # バグ修正の場合
git commit -m "refactor: リファクタリング内容" # リファクタリングの場合
git commit -m "docs: ドキュメント更新内容" # ドキュメント更新の場合

# リモートにプッシュ
git push origin ブランチ名
```

**コミットメッセージ規約:**

- `feat:` - 新機能
- `fix:` - バグ修正
- `refactor:` - リファクタリング
- `docs:` - ドキュメント更新
- `style:` - コードフォーマット
- `test:` - テスト追加・修正
- `chore:` - その他の変更

## 実装パターン

### コントローラーの基本構造

```typescript
import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

export const controllerName = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // ビジネスロジック
    const result = await prisma.model.findMany();

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
```

### ルートの基本構造

```typescript
import { Router } from "express";
import { controllerName } from "../controllers/someController.js";

const router = Router();

router.get("/path", controllerName);

export default router;
```

### Prisma スキーマの基本パターン

```prisma
model ModelName {
  id        Int      @id @default(autoincrement())
  name      String
  userId    Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // リレーション
  user User @relation(fields: [userId], references: [id])
}
```

## 注意事項

- エラーは必ず `next(error)` で次のミドルウェアに渡す
- データベース操作は必ず try-catch で囲む
- 環境変数は `.env` ファイルまたは AWS SSM から取得
- 機密情報はコードに直接書かない
