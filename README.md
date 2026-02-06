# ポケモンユナイト カウンターピック

ポケモンユナイトの使用キャラの選択を支援するWebアプリです。

## 技術スタック

- Framework: React
- Build Tool: Vite (TypeScript)
- CSS Library: Linaria (Zero-runtime CSS-in-JS)
- D&D: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

新規でパッケージを追加する場合は以下を実行してください。

```bash
npm install @linaria/core @linaria/react @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install -D @linaria/vite
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

### 3. ビルド

```bash
npm run build
```

### 4. プレビュー

```bash
npm run preview
```

## 画像について

サンプルデータでは `/images/xxx.png` を参照しています。  
`public/images/` フォルダにポケモン画像を配置してください（例: `public/images/pikachu.png`）。  
画像が存在しない場合は、Role に応じた背景色のみが表示されます。

## GitHub Pages での公開

- `vite.config.ts` の `base` は `./` に設定済みです。
- `.github/workflows/deploy.yml` で `main` ブランチへの push 時にビルド・デプロイされます。
- リポジトリの Settings → Pages で「GitHub Actions」を選択してください。

## 主な機能

- セットの追加・削除・上下での並び替え
- 項目名（ターゲット・有利など）のクリック編集
- プールのアコーディオン開閉
- ドラッグ＆ドロップでのポケモン配置
- タップで選択 → 移動先エリアをタップで配置（モバイル向け）
- localStorage への自動保存（リロードで復元）
- Reset ボタンで全データ削除（確認ダイアログあり）
