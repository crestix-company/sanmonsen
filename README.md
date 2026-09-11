# やきとり 居酒屋 三文銭

提供されたヒアリングシートと店舗写真をもとに制作した、5ページ構成の静的サイトです。

## ページ

- トップ: dist/index.html
- お料理とお酒: dist/cuisine.html
- ご宴会: dist/banquet.html
- 店内: dist/space.html
- 店舗案内: dist/access.html

## 確認

Node.js 22以上で `node scripts/verify-site.mjs`。外部ライブラリ・ビルドは不要です。
ローカル配信例: `python3 -m http.server 4196 --bind 127.0.0.1 --directory dist`。
配信確認: `node scripts/verify-site.mjs http://127.0.0.1:4196/`。

## 公開先別の設定

- Sites: .openai/hosting.json の static.directory は dist。登録済み project_id を再利用します。
- Cloudflare **Pages**: フレームワークなし、ビルドコマンド空欄、出力ディレクトリ **dist**。Workers設定は使用しません。
- GitHub Pages: **Settings → Pages → Source: GitHub Actions**。同梱の `.github/workflows/pages.yml` がmainへのプッシュ時に検証を行い、**dist の中身だけ**を公開します。「Deploy from a branch / main / root」はREADMEが表示されるため使用しません。画像・ページは相対URLなのでプロジェクトパスにも対応します。

GitHub Pages公開URL: https://crestix-company.github.io/sanmonsen/

公開前のパス検証: `node scripts/verify-pages-prefix.mjs`。公開後はトップを含む全ページのHTMLが検証済みファイルと完全一致することまで自動検査します。

ソースの保存先と実際のサイトURLは別です。新たな公開先に反映した際は、トップ・全5ページ・写真・動画・電話予約リンクを確認してください。

## 素材

提供写真はWebPに圧縮し、750px/1500pxを画面幅に応じて使い分けています。750pxの元写真は無理に拡大せず使用しています。撮影内容を改変する生成加工はしていません。
提供動画はトップと料理ページで無音ループ再生します。音声トラックを除去したH.264/MP4をPC用1280×720、スマホ用960×540で用意し、画面内に入るまで動画本体を読み込みません。ユーザーの希望により、動画上の停止・再開ボタンと「音声なし」の表示は取り除いています。画面外、別タブ表示中、モバイルメニュー表示中は停止します。OSの「動きを減らす」設定、対応ブラウザーのデータ節約設定、自動再生が制限された環境では静止画を表示します。

動画制御の回帰確認: `node scripts/verify-motion.mjs`。無音動画を再生成する場合はFFmpegを用意し、`sh scripts/prepare-silent-video.sh`を実行します。提供元の動画はそのまま保存し、公開ページからは軽量な無音版だけを参照します。

トップの焼き台の写真は、提供動画から切り出した実写フレームです。750px/1280pxのWebP（約59KB/97KB）を使用し、撮影内容は変更していません。店名のみ「Yuji Syuku」の3文字サブセットをセルフホストしています（ライセンスは dist/assets/yuji-syuku-license.txt）。

## 納品先と公開状態

ソースの納品先は https://github.com/crestix-company/sanmonsen です。初回納品はコミット・プッシュのみでしたが、その後の「ページが映ってない」という依頼でGitHub Pagesの公開設定を修正しました。Sites・Cloudflareの設定は変更していません。リポジトリの閲覧URLと、実際のホームページの公開URLは別です。確認内容は QUALITY-CHECK.md を参照してください。

掲載情報の根拠と未提供情報は SOURCES.md を参照してください。
