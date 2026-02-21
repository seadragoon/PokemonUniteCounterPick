# Pokémon UNITE カウンターピックメーカー

ポケモンユナイトにおける、自分や構成に合わせた「ターゲット」「有利」「不利」などのポケモン相性を整理し、保存・共有できるWebアプリケーションです。  
ドラッグ＆ドロップによる直感的な操作と、閲覧に特化した「ビューモード」を備え、自分だけのカウンターピックリストを簡単に作成できます。

## 🌐 サイトのURL（GitHub Pages）
**[こちらのリンクからアプリを利用できます](https://seadragoon.github.io/PokemonUniteCounterPick/)**
*(ご自身のリポジトリURLに置き換えてください)*

---

## 🚀 主な機能

- **直感的なドラッグ＆ドロップ操作**：ポケモン一覧（プール）から各項目へ、項目間から別の項目へ自由に移動。
- **閲覧専用の「ビューモード」**：Pinterest風の美しいグリッドレイアウトで、構築したセットを一覧表示。
- **URLを使った共有機能**：作成したリストを圧縮URL化し、SNSや友人にシェアすることが可能（URLパラメータでデータを復元）。
- **カスタマイズ性の高さ**：セット名や各カテゴリ（項目）名を自由に編集可能。項目の順番の入れ替えにも対応。
- **オートセーブ**：操作するたびにブラウザの `localStorage` へ自動保存。次回アクセス時にそのまま再開できます。
- **レスポンシブデザイン**：PC・タブレット向けのリッチなレイアウトと、スマートフォン向けに最適化されたコンパクトUIを両立。

## 🛠 技術スタック

- **Framework**: React 19
- **Build Tool**: Vite (TypeScript)
- **CSS Library**: Linaria (Zero-runtime CSS-in-JS)
- **Drag & Drop**: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
- **Icons**: React Icons (lucide-react等)
- **Hosting**: GitHub Pages (GitHub ActionsによるCI/CDデプロイ)

## 💻 開発・セットアップ

プロジェクトを手元で実行・開発する場合の手順です。

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```
起動後、ターミナルに表示される `http://localhost:XXXX` にアクセスしてください。

### 3. 本番ビルド

```bash
npm run build
```
`dist/` ディレクトリに公開用のファイル群が出力されます。

## ⚖️ 免責事項・権利表記について

### 画像素材の出典
本アプリケーションで使用しているポケモンのアイコン画像は、**[Unite-DB](https://unite-db.com/)** 様のサイトより拝借させていただいております。

### 権利表記
当サイトはファンによる非営利目的のプロジェクトであり、株式会社ポケモン、Nintendo、Creatures Inc.、GAME FREAK inc.、およびTencent Gamesとは一切関係ありません。
『Pokémon UNITE』に関するすべての画像および知的財産権は、各権利者に帰属します。
