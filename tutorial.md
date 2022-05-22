[:contents]

# きっかけ

1 年前の v1.0.0 リリース時に見かけた Deno、当時は興味を持ちながらもお試しを先送りしていましたが、1 年経った今、目にする機会も多くなり気になったのでお試ししてみました。

# お試し結果

- インポートの管理(import_map) やタスクランナー(Tasks) など、実開発で必須だが足りなかった部品が標準として登場、使い勝手が向上しているよう感じました。
- ESM の標準サポートで node.js で利用できるメジャーなモジュールはほぼ使える模様。しかし依存関係が多いものはそこが起点となって使えなくなるか、動かすのに相当苦労するケースがあります。
- 利用する中での苦労はまだまだ多いようです。使う中でサンプルが無く Github の issue や、コードを読んでなんとか使うようなケースが多々あリます。
- 標準プラットフォームに全部入りという利点は大きいと感じました。現時点でもツール系で力を発揮する可能性があるかと思います。

# コード置き場

https://github.com/zackaeru/todoAtDeno

フロントだけで動く版：https://github.com/zackaeru/todoAtDeno/tree/feature/frontOnly

# React で Todo リスト @ Deno

## Deno の概要

- TypeScript をプラットフォームレベルでサポート
- ES Module を標準サポート、Common JS は使えない (互換レイヤによって一部は使える模様 (( [公式から](https://deno.land/std@0.138.0/node/README.md) ))
- Lint や Formatter を標準ツールとして包含している。開発系ツールは基本標準プラットフォームとして提供する方針
- トレードマークの恐竜がかわいい

## 環境構築

Deno のインストール

```bash
brew install deno
```

VSCode 拡張のインストール  
[公式の拡張](リンクhttps://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno)をインストールする。
インストール後要再起動。コマンドパレットから`Deno: Initialize Workspace Configuration`で勝手に VSCode 用の設定を作ってくれる。以下、作成されたのち若干の修正を加えた`.vscode/settings.json`。

```json
{
  "deno.enable": true,
  "deno.lint": true,
  "deno.unstable": true,
  "[typescript]": {
    "editor.defaultFormatter": "denoland.vscode-deno"
  }
}
```

[公式の解説](https://deno.land/manual@v1.21.1/getting_started/setup_your_environment)から shell のオートコンプリート設定を行う。

そして早速、Hello, World を表示してみる。  
適当に 以下内容のファイル(ここでは`foo.ts`と名付けた)を用意。内容的には JS でしかないけど。

```typescript
console.info(“hello, world”);
```

`deno`に食わせると実行してくれた！追加で何か入れる必要全くなし。これが TypeScript ネイティブの力だよ。

```bash
deno run foo.ts
```

なお、`run`の後ろはファイル名以外に URL 指定でもいけるらしい。なんだかすごい。

## プロジェクト設定（フロント）

フロント用のプロジェクトを作ってみる。以下構造にした。

```bash
./
├── .vscode
│   └── settings.json
└── front
    ├── deno.json
    ├── import_map.json
    ├── dist
    │   ├── sample.js
    │   ├── style.css
    │   └── index.html
    └── src
        └── study
            ├── foo.ts #先程のハロワもここに仲良くつっこんである。。。特に深い意味はない。
            └── sampleApp.tsx
```

`deno.json`を見様見真似で作ってみる。  
[公式のマニュアル](https://deno.land/manual/getting_started/configuration_file)を参照。

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

いつの間にか[タスクランナー](https://deno.land/manual@v1.20.1/tools/task_runner)が登場しているのでタスクを定義してみる(( `.vscode/setting.json`に`"deno.unstable": true`を設定しておく必要あり ))。
構文は npm script と似ている。`deno.json`の`tasks`に以下定義

```json
"tasks": {
  "run": "deno run ./src/study/foo.ts"
}
```

`deno task run`で先程の Hello, World が呼べた。
`deno task`が登場するまでは、[Velociraptor](https://velociraptor.run/)が使われていたようだ。yaml でタスクを記述するので、yaml 好きだとこれが良いかも。

次に、React のライブラリをインポートする。  
今回は大人しく本家 React を使うことにした。
Next.js の Deno 版で[Aleph.js](https://alephjs.org/)を見つけたのだが、v1.0.0 リリースが大詰めらしく、公式にて「今は使うな」と警告されていたため。

Deno は ES Module を利用できるので import で ES Module の URL を指定すればそれを取り込むこむことができる。以下のような CDN の配布サイトから URL を取得できる。

- [https://www.skypack.dev/:title]
- [https://esm.sh/:title]

今回はドキュメントが豊富な skypack を利用することにした。(( どれか一つしか使えないということはない ))  
URL 末端に`?dst`を付与することで TypeScript 向けの型情報が利用できる。なお、CDN ごとにこの辺の URL 仕様は異なる模様。

空の`sampleApp.tsx`を作成して、import 文に URL を指定。

```typescript
import React from "https://cdn.skypack.dev/react@17.0.2?dts",
import ReactDom from “https://cdn.skypack.dev/react-dom@17.0.2?dts",
```

記載しただけでは、「モジュールが存在しない」ような注意が。そこでターミナルから以下`deno cache`すると import の内容をダウンロードできる。`npm i`的な。するとエディタ側で無事認識される。

```bash
deno cache ./src/study/sampleApp.tsx
```

モジュールの依存関係を見るには`deno info`。

```bash
deno info ./src/study/sampleApp.tsx
```

見られるのはいいんだけど、依存モジュールのバージョン固定したり無理くりバージョンあげるにはどうすれば良いんだろう。。。今後要調査 ((多分一年後くらい。。。))

ライブラリのバージョンアップごとに import 文を書き換えるのも面倒なので、import_map を利用する。
`import_map.json`を追加。以下を記載する。

```json
  "imports": {
    "react": "https://cdn.skypack.dev/react@17.0.2?dts",
    "react-dom": "https://cdn.skypack.dev/react-dom@17.0.2?dts",
    "./": "./"
  }
}
```

`sampleApp.tsx`の import 文を変更。

```typescript
import React from "react";
import ReactDOM from "react-dom";
```

先程の`deno cache`で問題なく解決されることを確認。

## React での UI 作り

`deno.json`の lib に記載している`deno.window`はサーバ向けのライブラリしか持っていないため、以下内容に変更。

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
と思ったらまだ未解決だった。。。 (( [github でのやりとり](https://github.com/denoland/vscode_deno/issues/501) ))

当面の解決策としては、各プロジェクトで`.vscode`を作って、プロジェクトごとに VSCode を開くという感じ。。。 (( [解決策の一例@stackoverflow](https://stackoverflow.com/questions/71038134/vscode-setup-a-monorepo-with-a-deno-backend-folder-and-a-vite-frontend-fol) ))

寄り道したけど、React の UI をバンドルする。

```bash
$deno bundle ./src/study/sampleApp.tsx ./dist/sample.js
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

`front/dist/index.html`を表示すると Hello, World の文字列が！

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

後は淡々とコードを書くのみ。`sampleApp.tsx`にひたすら追加。

```typescript
import React, { useState } from "react";
import ReactDOM from "react-dom";

addEventListener("DOMContentLoaded", () => {
  main();
});

const main = () => {
  ReactDOM.render(<App />, document.querySelector("#root"));
};

type Todo = { id: number; value: string };

type TodoArray = Todo[];

const App = () => {
  const [todo, setTodo] = useState<TodoArray>([]);
  const [id_counter, setIdCounter] = useState<number>(0);
  const deleteHandler = (deleted: Todo) => {
    setTodo(todo.filter((todo) => todo.id !== deleted.id));
  };
  return (
    <>
      <h1>シンプルなTodoリスト</h1>
      <TodoInputForm
        todos={todo}
        setTodoState={setTodo}
        currentMaxId={id_counter}
        setIdCounterState={setIdCounter}
      ></TodoInputForm>
      <TodoList todos={todo} deleteHandler={deleteHandler}></TodoList>
    </>
  );
};

type TodoItemProps = {
  deleteHandler: (todo: Todo) => void;
  todo: Todo;
};

const TodoElement: React.VFC<TodoItemProps> = (props) => {
  return (
    <li>
      <div>{props.todo.value}</div>
      <Button
        handler={() => {
          props.deleteHandler(props.todo);
        }}
      >
        del
      </Button>
    </li>
  );
};

type ButtonProps = {
  handler: () => void;
  children: React.ReactNode;
};

const Button: React.VFC<ButtonProps> = (props) => {
  return <button onClick={props.handler}>{props.children}</button>;
};

type TextBoxProps = {
  onChange: React.Dispatch<React.SetStateAction<string>>;
};

const TextBox: React.VFC<TextBoxProps> = (props) => {
  return (
    <input
      type="text"
      onChange={(evt) => {
        props.onChange(evt.target.value);
      }}
    ></input>
  );
};

type AddTodoProps = {
  todos: TodoArray;
  currentMaxId: number;
  setIdCounterState: React.Dispatch<React.SetStateAction<number>>;
  setTodoState: React.Dispatch<React.SetStateAction<TodoArray>>;
};

const TodoInputForm = (props: AddTodoProps) => {
  const [textInput, setTextInput] = useState("");
  const addTodoHandler = async () => {
    const newId = ++props.currentMaxId;
    props.setIdCounterState(newId);
    props.setTodoState([...props.todos, { id: newId, value: textInput }]);
  };
  return (
    <div>
      <TextBox onChange={setTextInput}></TextBox>
      <Button handler={addTodoHandler}>Add Todo!</Button>
    </div>
  );
};

type TodoListProps = {
  deleteHandler: (todo: Todo) => void;
  todos: TodoArray;
};

const TodoList: React.VFC<TodoListProps> = (props) => {
  return (
    <ul>
      {props.todos.map((todo) => {
        return (
          <TodoElement
            todo={todo}
            deleteHandler={props.deleteHandler}
          ></TodoElement>
        );
      })}
    </ul>
  );
};
```

以上でバンドルして`index.html`を開くと無事 Todo リストが開き動作したのだが、最後の最後で問題発生。`Material UI`か`React Bootstrap`で見栄えを良くしようと考えてインポート、ソース書いてバンドルしたところ、エラー発生で動かなくなる。  
依存ライブラリが増えると Deno さんで不具合出る可能性が上がるのかも。対応に時間かかりそうなので今回は以下自前 CSS で最低限の見た目を整えた。そして Todo リストが完成。

```css
ul {
  width: 30em;
}

li {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  border-radius: 5px;
  border-color: gray;
  border-width: 1px;
  border-style: solid;
  padding: 3px;
  margin-top: 3px;
}

li div {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

button {
  margin: 3px;
  padding: 3px;
}
```

```html
<head>
  <link href="./style.css" rel="stylesheet" />
</head>
```

## バックエンドの作成

せっかくなのでバックエンドも作成してみる。

バックエンドの構成は以下の通り。フロントの横に生やしただけ。`*.ts`をそのまま実行できるため、`dist`ディレクトリが存在しない。少しスッキリ。

```bash
./
├─── front
│    └── 略
└─── back
    ├── .vscode
    │   └── setting.json #deno拡張にlibを認識させるため
    ├── deno.json
    ├── import_map.json
    └── src
        ├── server.ts
        └── todo.ts
```

## プロジェクト設定(バックエンド)

今回は Deno ネイティブな HTTP サーバ[OAK](https://github.com/oakserver/oak)を使ってみる。
`import_map.json` を作成し、oak を追加。
`server.ts` を作成し、import から oak を参照するようにする。

- import_map.json

```json
{
  "imports": {
    "oak": "https://deno.land/x/oak@v10.5.1/mod.ts",
    "./": "./"
  }
}
```

- server.ts

```typescript
import { Application } from "oak";
```

フロントの部分で記載した、`deno.json`の`lib`が解決されない問題が発生するため、`back/.vscode/setting.json`を作成してバックエンド単体で VSCode を開く。

```json
{
  "deno.enable": true,
  "deno.lint": true,
  "deno.unstable": true,
  "[typescript]": {
    "editor.defaultFormatter": "denoland.vscode-deno"
  }
}
```

## サーバ作り

後はコードを書くのみ。以下コード掲載します。
`file:///`にて React アプリを開くことに固執したため少し複雑になってしった。。。

- back/src/server.ts

```typescript
import { Application, Router, RouterMiddleware, Status } from "oak";
import { TodoRepo } from "./todo.ts";

const todoRepo = new TodoRepo();

const app = new Application();
const router = new Router();

const PORT = 8000;
const HOSTNAME = "localhost";
const TODO_PATH: string = "/todo";

//file から localhost 通すために CORS 有効にしました(テスト用劇ゆる設定注意)
const experimentalCorsResponse: RouterMiddleware<string> = async (
  ctx,
  next
) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "_");
  ctx.response.headers.set("Access-Control-Allow-Methods", "_");
  ctx.response.headers.set("Access-Control-Allow-Headers", "*");
  ctx.response.status = Status.NoContent;
  await next();
};

router.options(TODO * PATH, experimentalCorsResponse);
router.get(TODO_PATH, async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.body = JSON.stringify(todoRepo.list());
  ctx.response.type = "json";
  ctx.response.status = Status.OK;
  await next();
});
router.post(TODO * PATH, async (ctx, next) => {
  const body = await ctx.request.body();
  if (body.type == "json") {
    const todoValue = (await body.value).value;
    if (todoValue) {
      ctx.response.headers.set("Access-Control-Allow-Origin", "*");
      ctx.response.body = todoRepo.add(todoValue);
      ctx.response.type = "json";
      ctx.response.status = Status.OK;
      await next();
    } else {
      ctx.response.headers.set("Access-Control-Allow-Origin", "*");
      ctx.response.body = "todo value is empty";
      ctx.response.type = "text/plain";
      ctx.response.status = Status.BadRequest;
      await next();
    }
  }
});

router.options(`${TODO_PATH}/:id`, experimentalCorsResponse);
router.delete(`${TODO_PATH}/:id`, async (ctx, next) => {
  todoRepo.delete(Number.parseInt(ctx.params.id));
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.status = Status.NoContent;
  await next();
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ hostname: HOSTNAME, port: PORT });
```

- back/src/todo.ts

```typescript
export type Todo = {
  id: number;
  value: string;
};

export class TodoRepo {
  private static id_counter = 0;
  private todoList: Todo[] = [];

  add = (value: string) => {
    const todo = { id: TodoRepo.id_counter++, value: value };
    this.todoList.push(todo);
    console.info(`add ${todo.id}`);
    return todo;
  };

  delete = (id: number) => {
    this.todoList = this.todoList.filter((todo) => todo.id !== id);
    console.info(`delete ${id}`);
  };

  list = () => {
    console.info(`list ${this.todoList.flatMap((todo) => `${todo.id}`)}`);
    return [...this.todoList];
  };
}
```

実行は`deno.json`に以下タスクを追加して実行。Deno はネットアクセスやファイルアクセスにパーミッションを指定してやる必要があるので注意（以下`--allow-net`の部分）。

```json
"tasks": {
  "run": "deno run --allow-net ./src/server.ts"
}
```

シンプルな Todo リストができました。フロント単体版と違いがないが、リロードしても値を持ち続けてるところだけ動きが変わってる。。。

![]()

少し OAK を使ってみての感想。

- 明確な send 系メソッドがなく少し不安。ただ、これはこれで利点はあるのかも。誰かが send したばかりに以降のハンドラが呼ばれなくなるなどは無くなりそう。(( そんなんで不具合を出すのは私ぐらいしかいないかもなのだが。。。 ))
- 例外用のハンドラは無く、`await next();`をキャッチして例外処理する。例外処理を先頭に書くことになるので違和感が。慣れの問題か。
- リクエストやレスポンスについて`@types/express-server-static-core`にあるようなジェネリクスでの型付けがない？json を型変換するのが少しだけ面倒かも。(あったら申し訳ない。知ってる方、教えてください。)

# 最後に

今回は Deno の上に、React で Todo アプリを作ってみました。Deno で動かす苦労よりも久しぶりに使った React を思い出す苦労の方が多かった気が。。。

まだまだ開発環境やライブラリの動作で苦労することは多いように感じました。しかし、確実に普及に向けて進化しているのを感じられましたし、TypeScript ネイティブの使用感や ESM のインポートからは環境構築が格段に楽になりそうという手応えがありました。

次回触る際は、今回あまり扱えなかった標準ライブラリ周りを試してみたいと思います。豊富になっているとの噂も聞いており、Deno 君は環境構築の速さからしばらくツール系を作るのにお役に立ちそうな気がしています。

また、そのうち今回の Todo で出来なかった`Aleph.js`や`Material UI`などなど 3rd のライブラリを色々と取り込んで試せたらと思います。
