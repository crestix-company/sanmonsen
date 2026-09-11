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
- GitHub Pages: リポジトリのルートではなく **dist の中身**を公開します。ルートのREADMEを配信する設定は不可。画像・ページは相対URLなのでプロジェクトパスにも対応します。

ソースの保存先と実際のサイトURLは別です。新たな公開先に反映した際は、トップ・全5ページ・写真・動画・電話予約リンクを確認してください。

## 素材

提供写真はWebPに圧縮し、750px/1500pxを画面幅に応じて使い分けています。750pxの元写真は無理に拡大せず使用しています。撮影内容を改変する生成加工はしていません。
提供動画は操作して再生する仕様で、再生前は動画本体を読み込みません。

掲載情報の根拠と未提供情報は SOURCES.md を参照してください。
