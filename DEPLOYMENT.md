# GitHub Actions 自動デプロイ設定ガイド

## 1. GitHub Secretsの設定

GitHubリポジトリに以下のSecretsを追加してください。

### 手順

1. GitHubリポジトリ `syulicht/budget-book-be` にアクセス
2. **Settings** → **Secrets and variables** → **Actions** をクリック
3. **New repository secret** ボタンをクリック
4. 以下の2つのSecretを追加

#### AWS_ACCESS_KEY_ID
- **Name**: `AWS_ACCESS_KEY_ID`
- **Value**: IAMユーザーのアクセスキーID

#### AWS_SECRET_ACCESS_KEY
- **Name**: `AWS_SECRET_ACCESS_KEY`
- **Value**: IAMユーザーのシークレットアクセスキー

---

## 2. IAMユーザーの必要な権限

デプロイ用IAMユーザーには以下の権限が必要です：

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
      "Action": [
        "iam:PassRole"
      ],
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
- `main`ブランチへのpush時に自動実行

### ステップ
1. コードをチェックアウト
2. AWS認証情報を設定
3. ECRにログイン
4. Dockerイメージをビルド
5. ECRにプッシュ（2つのタグ: コミットSHA と latest）
6. 現在のタスク定義をダウンロード
7. 新しいイメージでタスク定義を更新
8. ECSサービスをデプロイ
9. サービスが安定するまで待機

---

## 4. 動作確認

### テストデプロイ

1. リポジトリにコードをpush:
```bash
git add .
git commit -m "test: GitHub Actions deployment"
git push origin main
```

2. GitHubのActionsタブで進行状況を確認:
   - https://github.com/syulicht/budget-book-be/actions

3. デプロイ完了後、ECSサービスを確認:
```bash
aws ecs describe-services \
  --cluster mm-app-be-cluster \
  --services mm-app-be-service \
  --region ap-northeast-1
```

---

## 5. トラブルシューティング

### ワークフローが失敗した場合

#### ECR認証エラー
- AWS_ACCESS_KEY_ID と AWS_SECRET_ACCESS_KEY が正しく設定されているか確認
- IAMユーザーにECRの権限があるか確認

#### ECSデプロイエラー
- タスク定義名が正しいか確認: `mm-app-be-task`
- コンテナ名が正しいか確認: `mm-app-be`
- IAMユーザーにECSの権限があるか確認

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
- staging/production環境の分離
- ブランチ別のデプロイ設定

### 通知
- Slackへの通知
- メール通知

---

準備ができたら、GitHub Secretsを設定してmainブランチにpushしてください！
