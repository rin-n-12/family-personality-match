# セットアップガイド

## 🚀 GitHubでの管理方法

### 1. リポジトリの作成

1. GitHubにログイン
2. 右上の「+」ボタンから「New repository」を選択
3. リポジトリ名を入力（例：`family-personality-match`）
4. 説明を追加（任意）
5. Publicを選択（GitHub Pagesを使用する場合）
6. 「Create repository」をクリック

### 2. ローカル環境の設定

```bash
# プロジェクトディレクトリに移動
cd family-personality-match

# Gitの初期化
git init

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "feat: 親子の特性相性診断アプリの初回コミット"

# リモートリポジトリを追加（YOUR_USERNAMEを自分のGitHubユーザー名に変更）
git remote add origin https://github.com/YOUR_USERNAME/family-personality-match.git

# メインブランチに名前を変更（必要に応じて）
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

### 3. GitHub Pagesの設定

1. GitHubのリポジトリページにアクセス
2. 「Settings」タブをクリック
3. 左サイドバーの「Pages」をクリック
4. 「Source」セクションで以下を設定：
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
5. 「Save」をクリック
6. 数分後、`https://YOUR_USERNAME.github.io/family-personality-match/` でアプリにアクセス可能

### 4. GitHub Actionsの有効化（自動デプロイ）

GitHub Actionsは自動的に有効になっています。`.github/workflows/deploy.yml`ファイルが設定済みです。

メインブランチにプッシュすると自動的にGitHub Pagesにデプロイされます。

## 📱 ローカル開発

### 簡易的なローカルサーバーの起動

#### Python 3を使用する場合
```bash
python -m http.server 8000
# ブラウザで http://localhost:8000 にアクセス
```

#### Python 2を使用する場合
```bash
python -m SimpleHTTPServer 8000
# ブラウザで http://localhost:8000 にアクセス
```

#### Node.jsを使用する場合
```bash
# http-serverをインストール（初回のみ）
npm install -g http-server

# サーバー起動
http-server -p 8000
# ブラウザで http://localhost:8000 にアクセス
```

#### VS Codeの拡張機能を使用する場合
1. VS Codeで「Live Server」拡張機能をインストール
2. `index.html`を右クリック
3. 「Open with Live Server」を選択

## 🔄 更新の流れ

### 変更をGitHubに反映させる

```bash
# 変更をステージング
git add .

# コミット（適切なメッセージを付けて）
git commit -m "feat: 新機能の追加"

# GitHubにプッシュ
git push origin main
```

### ブランチを使った開発

```bash
# 新しいブランチを作成
git checkout -b feature/new-feature

# 変更を加えた後、コミット
git add .
git commit -m "feat: 新機能の実装"

# ブランチをGitHubにプッシュ
git push origin feature/new-feature
```

その後、GitHubでプルリクエストを作成してマージします。

## 🛠️ トラブルシューティング

### GitHub Pagesが表示されない場合

1. リポジトリのSettingsでGitHub Pagesが有効になっているか確認
2. デプロイが完了するまで数分待つ
3. ブラウザのキャッシュをクリア
4. URLが正しいか確認（大文字小文字に注意）

### プッシュできない場合

```bash
# リモートURLの確認
git remote -v

# 正しいURLを設定
git remote set-url origin https://github.com/YOUR_USERNAME/family-personality-match.git

# 認証情報の更新（必要に応じて）
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 📚 参考リンク

- [GitHub Pages ドキュメント](https://docs.github.com/ja/pages)
- [Git 基本コマンド](https://git-scm.com/book/ja/v2)
- [GitHub Actions ドキュメント](https://docs.github.com/ja/actions)