---
name: release
description: >-
  Use this skill when the user asks to perform a release update (e.g., "リリースして", "リリース更新", "release", "GitHub Pagesを更新して").
  Merges the master branch into the release branch and pushes to origin/release to trigger the GitHub Pages build.
---

# リリース更新作業 (Release Update)

`master` ブランチでの作業内容を `release` ブランチにマージし、リモートへプッシュして GitHub Pages のビルド・公開ページ更新をトリガーする手順です。

## 手順

1. **事前確認**
   - `git status` を実行し、未コミットの変更がないことを確認する。未コミットの変更がある場合は作業を中断し、コミットするか退避するかユーザーに確認する。
   - 現在のブランチが `master` であることを確認する。

2. **ビルド確認**
   - `npm run build` を実行し、TypeScript の型チェックおよび Vite ビルドが成功することを確認する。
   - ビルドに失敗した場合はマージへ進まず、エラー内容をユーザーに報告する。

3. **`release` ブランチへのマージ**
   - `git fetch origin` でリモート情報を最新化する。
   - `git checkout release` で `release` ブランチへ切り替える。
   - `git pull origin release` でリモートの `release` ブランチと同期する。
   - `git merge master` で `master` ブランチをマージする。
   - コンフリクトが発生した場合は勝手に解消せず、状況をユーザーに報告して指示を仰ぐ。

4. **リモートへプッシュ**
   - `git push origin release` を実行し、GitHub Pages のビルドをトリガーする。

5. **後処理・報告**
   - `git checkout master` で `master` ブランチに戻る。
   - マージ・プッシュしたコミット内容（例: `git log -n 3 --oneline`）と `master` ブランチへ戻ったことをユーザーに報告する。
   - なお、`master` ブランチ自体に未プッシュのコミットが残っている場合は、必要に応じて `master` もプッシュするかユーザーへ案内する。
