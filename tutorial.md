[:contents]

# きっかけ

1 年前の v1.0.0 リリース時に見かけた Deno、当時はサポートするモジュールも少なく実用は先と思ったが、1 年でどれだけ進化したか気になったので定期観測的に確認してみた。

# 所感

TODO

- import_map や Tasks の採用など、実用性向上
- 個人プロジェクトなら OK。商用での利用はまだ難しそう。
- 個人プロジェクトなら OK
  - ESM の標準サポートで node.js で利用できるメジャーなモジュールはほぼ使える模様。型定義もメジャー系は十分存在するみたい（今回 Todo リストで使う程度のモジュールしか見ていないため細かなところは不明。。。）
- 商用はまだ
  - 使えるのであって、使いやすい状況にはない。使う中でプラットフォームのバグに当たったり、サンプルが無く Github の issue や、コード読んでなんとか使ったりするようなケースが多々あり、まだまだ Deno 導入のメリットがコストを上回っていないかなと感じた。

# React で Todo リスト@Deno

## Deno の概要

- TypeScript をプラットフォームレベルでサポート
- ES Module を標準サポート、Common JS は使えない (互換レイヤによって一部は使える模様 [※公式](https://deno.land/std@0.138.0/node/README.md)
- Lint や Formatter を標準ツールとして包含している。開発系ツールは基本標準プラットフォームとして提供する方針
- トレードマークの恐竜がかわいい

## 環境構築

1. Deno

   ```bash
   brew install deno
   ```

1. VSCode 拡張

   [公式の拡張](リンクhttps://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)をインストールする。
   インストール後要再起動。コマンドパレットから`Deno: Initialize Workspace Configuration`で勝手に VSCode 用の設定を作ってくれる。

1. shell のオートコンプリート設定

   [公式の解説](https://deno.land/manual@v1.21.1/getting_started/setup_your_environment)から。

1. Hello World

   適当に VScode で以下内容のファイル(ここでは`foo.ts`と名付けた)を用意。JS でしかないけど。

   ```typescript
   console.info(“hello, world”);
   ```

   deno に食わせると実行してくれた！これが TypeScript ネイティブの力だよ。

   ```bash
   deno run foo.ts
   ```

   なお、`run`の後ろはファイル名以外に URL 指定でもいけるらしい。なんだかすごい。

## プロジェクト設定（フロント）

1. フロント用のプロジェクトを作ってみる。以下構造にした。

   ```bash
   ./
   └── front
       ├── deno.json
       ├── dist
       │   └── index.html
       └── src
           └── study
               ├── foo.ts
               └── sampleApp.tsx
   ```

1. `deno.json`を作る

   見様見真似で作ってみる。※[公式のマニュアル](https://deno.land/manual/getting_started/configuration_file)

   ```json
   {
     "compilerOptions": {
       "lib": ["deno.window"],
       "jsx": "react",
       "jsxFactory": "React.createElement",
       "jsxFragmentFactory": "React.Fragment"
     },
     "lint": {
       "files": {
         "include": ["src/**/*"],
         "exclude": []
       }
     },
     "fmt": {
       "files": {
         "include": ["src/**/*"],
         "exclude": []
       },
       "options": {
         "useTabs": false,
         "lineWidth": 100,
         "indentWidth": 4,
         "singleQuote": true,
         "proseWrap": "always"
       }
     }
   }
   ```

1. タスクランナーの定義

   いつの間にか[タスクランナー](https://deno.land/manual@v1.20.1/tools/task_runner)が登場している。現状は unstable だけど。
   構文は npm script と似ている。`deno.json`の`tasks`に定義

   ```json
   "tasks": {
     "run": "deno run ./src/study/foo.ts"
   }
   ```

   `deno task run`で先程の Hello, World が呼べた。
   `deno task`が登場するまでは、[Velociraptor](https://velociraptor.run/)が使われていたようだ。yaml でタスクを記述するので、yaml 好きだとこれが良いかも

1. React のライブラリインポート

   今回は大人しく本家 React を使ってみる。
   Next.js の Deno 版で[Aleph.js](https://alephjs.org/)を見つけたのだが、v1.0.0 リリースが大詰めらしく、公式にて「今は使うな」と警告されていた。

   deno は ESM を利用できるので import で ESM の URL を指定すればそれを取り込むこむことができる。以下のような CDN の ESM 配布サイトから URL を取得できる。

   - [https://www.skypack.dev/:title]
   - [https://esm.sh/:title]

   特に理由はないが、今回はドキュメントが豊富な skypack を利用することにした。
   URL 末端に`?dst`を付与することで TypeScript 向けの型情報が利用できる。なお、CDN ごとにこの辺の URL 仕様は異なる模様。

   空の`sampleApp.tsx`を作成して、import 文に URL を指定。

   ```typescript
   import React from "https://cdn.skypack.dev/react@17.0.2?dts",
   import ReactDom from “https://cdn.skypack.dev/react-dom@17.0.2?dts",
   ```

   記載しただけでは、モジュールが存在しないような注意が。そこでターミナルから以下`deno cache`すると import の内容をダウンロードできる。`npm i`的な。するとエディタ側で無事認識される。

   ```bash
   deno cache ./src/study/sampleApp.tsx
   ```

   依存関係を見るには`deno info`。

   ```bash
   deno info ./src/study/sampleApp.tsx
   ```

   見られるのはいいんだけど、バージョン固定したり無理くりあげるにはどうすれば良いんだろう。。。今後要調査。

   ライブラリのバージョンアップごとに import 文を書き換えるのも面倒なので、import_map を利用する。
   `/front`以下に`import_map.json`を追加。以下を記載する。

   ```json
     "imports": {
       "react": "https://cdn.skypack.dev/react@17.0.2?dts",
       "react-dom": "https://cdn.skypack.dev/react-dom@17.0.2?dts",
       "./": "./"
     }
   }
   ```

   `sampleApp.tsx`の import 文を変更

   ```typescript
   import React from "react";
   import ReactDOM from "react-dom";
   ```

   先程の`deno cache`で問題なく解決されることを確認。

1. React での UI 作り

   Deno の lib に記載している`deno.window`はサーバ向けのライブラリしか持っていないため、`deno.json`の lib を以下内容に変更。

   ```json
   "lib": ["dom", "dom.iterable", "dom.asynciterable", "deno.ns"],
   ```

   import 文 しかなかった`sampleApp.tsx`に Hello World のコードを追加。

   ```typescript
   import React from "react";
   import ReactDOM from "react-dom";

   addEventListener("DOMContentLoaded", () => {
     main();
   });

   const main = () => {
     ReactDOM.render(<App />, document.querySelector("#root"));
   };

   const App = () => {
     return (
       <>
         <h1>Hello, World!</h1>
       </>
     );
   };
   ```

   記述中に Deno の VSCode 拡張が`document`をうまく解決しないことを発見。「`document`が存在しません」みたいな警告が出る。

   調べたところ、`.vscode/setting.json`に以下の設定で、`deno.json`の場所を指定すると`deno.json`に記述した`lib`の内容を拡張が認識してくれるようだ。

   ```json
     "deno.config": "./front/deno.json"
   ```

   ただ、`.vscode`はプロジェクトごと、`deno.json`はモジュールごとに定義だけどモノレポ構成だとどうすれば良いんだろ。複数指定するのか？
   と思ったらまだ未解決だった。。。
   ※[github でのやりとり](https://github.com/denoland/vscode_deno/issues/501)  
   当面の解決策としては、各プロジェクトで`.vscode`を作って、プロジェクトごとに VSCode を開くという感じ。。。※[解決策の一例@stackoverflow](https://stackoverflow.com/questions/71038134/vscode-setup-a-monorepo-with-a-deno-backend-folder-and-a-vite-frontend-fol)

   寄り道したけど、React の UI をバンドルする。

   ```bash
   $deno bundle ./src/study/sampleApp.tsx ./dist/sampleApp.js
   ```

   うまく出力されたようなので、表示するための`index.html`を作成し`front/dist/`以下に配置。

   ```html
   <html>
     <head> </head>
     <script src="./sample.js"></script>
     <body>
       <div id="root"></div>
     </body>
   </html>
   ```

   `./dist/index.html`を表示すると Hello, World の文字列が！

   ついでに、先程の bundle コマンドを`deno.json`の`deno tasks`に登録。

   ```json
     "tasks": {
       "bundle": "deno bundle ./src/study/sampleApp.tsx ./dist/sample.js",
   ...
   ```

   これで以下コマンドからバンドルできるようになった。

   ```bash
   deno tasks bundle
   ```

   後はコード書くだけです。

   ```typescript

   baa foo
   ```

   最後の最後で問題発生。`Material UI`か`React Bootstrap`で見栄えを良くしようと考えてインポート、ソース書いてバンドルしたところ、エラー発生で動かなくなる。依存ライブラリが増えると Deno さんで不具合出る可能性も上がるのかも。対応に時間かかりそうなので今回は自前 CSS で最低限の見た目を整えた。そして Todo リストが完成。

## バックエンドの作成

せっかくなのでバックエンドも作成してみる。

1. バックエンドの構成は以下の通り。フロントの横に生やしただけ。.ts をそのまま実行できるため、`dist`ディレクトリが存在しない。少しスッキリ。

   ```bash
   ./
   ├─── front
   │    └── 略
   └─── back
        ├── deno.json
        └── src
                ├── foo.ts
                └── sampleApp.tsx
   ```

1. プロジェクト設定(バックエンド)

   今回は Deno ネイティブな HTTP サーバ[OAK](https://github.com/oakserver/oak)を使ってみる。
   import_map.json を作成し、oak を追加。
   server.ts を作成し、import から oak を参照するようにした。
   フロントの部分で記載した、`.vscode/setting.json`を作成して、バックエンド単体で VSCode を開く。

1. サーバ作り

   後はコードを書くのみ。以下コード掲載します。

   ```typescript:server.ts

   ```

   ```typescript:todo.ts

   ```

   少し OAK を使ってみての感想。

   - 明確な send 系メソッドがなく少し不安。ただ、これはこれで利点はあるのかも。誰かが send したばかりに以降のハンドラが呼ばれなくなるなどは無くなりそう。[^1]
   - 例外用のハンドラは無く、`await next();`をキャッチして例外処理する。例外処理を先頭に書くことになるので違和感が。慣れの問題か。
   - リクエストやレスポンスについて`@types/express-server-static-core`にあるようなジェネリクスでの型付けがない？json を型変換するのが少しだけ面倒かも。

   [^1]そんなんで不具合を出すのは私ぐらいしかいないかもなのだが。。。

# 最後に

今回は Todo アプリを作ってみました。Deno で動かす苦労よりも久しぶりに使った React を思い出す苦労の方が多かった気が。。。  
まだまだ開発環境やライブラリの動作で苦労することは多いように感じました。しかし、確実に普及に向けて進化しているのを感じられましたし、TypeScript ネイティブの使用感や ESM のインポートからは環境構築が格段に楽になりそうという手応えがありました。  
今回あまり扱えなかった標準ライブラリ周りを次回試してみたいと思います。豊富になっているとの噂も聞いており、Deno 君は環境構築の速さからしばらくツール系を作るのにお役に立ちそうな気がしています。
年末ごろに今回の Todo で出来なかった`Aleph.js`や`Material UI`を取り込んで見れたらと思います。
