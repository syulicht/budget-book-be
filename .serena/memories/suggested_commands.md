# 推奨コマンド

## 開発コマンド

### 開発サーバーの起動
```bash
npm run dev
```
- nodemon + tsx でホットリロード開発サーバーを起動
- ポート: 3000 (デフォルト)

### ビルド
```bash
npm run build
```
- TypeScriptをコンパイルして `dist/` ディレクトリに出力

### プロダクション実行
```bash
npm start
```
- コンパイル済みのコード (`dist/server.js`) を実行

### テスト
```bash
npm test
```
- 現時点ではテストは未実装

## Prismaコマンド

### マイグレーション生成
```bash
npx prisma migrate dev --name <migration_name>
```

### Prisma Clientの生成
```bash
npx prisma generate
```

### Prisma Studio起動
```bash
npx prisma studio
```

## システムコマンド (macOS)
- `ls` - ファイル一覧
- `cd` - ディレクトリ移動
- `grep` - テキスト検索
- `find` - ファイル検索
- `cat` - ファイル内容表示
- `ps` - プロセス一覧
- `kill` - プロセス終了

## Gitコマンド
```bash
git status          # 変更状態確認
git add .           # ステージング
git commit -m ""    # コミット
git push            # プッシュ
```
