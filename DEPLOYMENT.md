# GitHub Actions 自動デプロイ設定ガイド

## 1. GitHub Secrets の設定

GitHub リポジトリに以下の Secrets を追加してください。

### 手順

1. GitHub リポジトリ `syulicht/budget-book-be` にアクセス
2. **Settings** → **Secrets and variables** → **Actions** をクリック
3. **New repository secret** ボタンをクリック
4. 以下の 2 つの Secret を追加

#### AWS_ACCESS_KEY_ID

- **Name**: `AWS_ACCESS_KEY_ID`
- **Value**: IAM ユーザーのアクセスキー ID

#### AWS_SECRET_ACCESS_KEY

- **Name**: `AWS_SECRET_ACCESS_KEY`
- **Value**: IAM ユーザーのシークレットアクセスキー

---

## 2. IAM ユーザーの必要な権限

デプロイ用 IAM ユーザーには以下の権限が必要です：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition",
        "ecs:UpdateService",
        "ecs:DescribeServices"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["iam:PassRole"],
      "Resource": [
        "arn:aws:iam::229830623661:role/ecsTaskExecutionRole",
        "arn:aws:iam::229830623661:role/ecsTaskRole"
      ]
    }
  ]
}
```

---

## 3. デプロイフロー

### トリガー

- `main`ブランチへの push 時に自動実行

### ステップ

1. コードをチェックアウト
2. AWS 認証情報を設定
3. ECR にログイン
4. Docker イメージをビルド
5. ECR にプッシュ（2 つのタグ: コミット SHA と latest）
6. 現在のタスク定義をダウンロード
7. 新しいイメージでタスク定義を更新
8. ECS サービスをデプロイ
9. サービスが安定するまで待機

---

## 4. 動作確認

### テストデプロイ

1. リポジトリにコードを push:

```bash
git add .
git commit -m "test: GitHub Actions deployment"
git push origin main
```

2. GitHub の Actions タブで進行状況を確認:

   - https://github.com/syulicht/budget-book-be/actions

3. デプロイ完了後、ECS サービスを確認:

```bash
aws ecs describe-services \
  --cluster mm-app-be-cluster \
  --services mm-app-be-service \
  --region ap-northeast-1
```

---

## 5. トラブルシューティング

### ワークフローが失敗した場合

#### ECR 認証エラー

- AWS_ACCESS_KEY_ID と AWS_SECRET_ACCESS_KEY が正しく設定されているか確認
- IAM ユーザーに ECR の権限があるか確認

#### ECS デプロイエラー

- タスク定義名が正しいか確認: `mm-app-be-task`
- コンテナ名が正しいか確認: `mm-app-be`
- IAM ユーザーに ECS の権限があるか確認

#### ログ確認

```bash
# GitHub ActionsのログをWeb UIで確認
# または、ECSタスクのログを確認
aws logs tail /ecs/mm-app-be --follow --region ap-northeast-1
```

---

## 6. 今後の拡張

### テストの追加

```yaml
- name: Run tests
  run: npm test
```

### 環境別デプロイ

- staging/production 環境の分離
- ブランチ別のデプロイ設定

### 通知

- Slack への通知
- メール通知

---

準備ができたら、GitHub Secrets を設定して main ブランチに push してください！
