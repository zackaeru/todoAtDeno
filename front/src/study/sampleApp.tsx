import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

const BACKEND_URL = "http://localhost:8000";

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
  useEffect(() => {
    getTodo().then((todos) => setTodo(todos));
  }, []);

  return (
    <>
      <h1>シンプルなTodoリスト</h1>
      <TodoInputForm todos={todo} setTodoState={setTodo}></TodoInputForm>
      <TodoList todos={todo} setTodoState={setTodo}></TodoList>
    </>
  );
};

const getTodo = async () => {
  const body = await fetch(`${BACKEND_URL}/todo`, {
    method: "GET",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = (await body.json()) as TodoArray;
  return data;
};

type TodoItemProps = {
  todo: Todo;
  deleteHandler: (deleted: Todo) => void;
};

const TodoElement: React.VFC<TodoItemProps> = (props) => {
  const { todo, deleteHandler } = props;
  return (
    <li>
      <div>{todo.value}</div>
      <Button
        handler={() => {
          deleteHandler(props.todo);
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
  const { handler, children } = props;
  return <button onClick={handler}>{children}</button>;
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

type TodoArrayProps = {
  todos: TodoArray;
  setTodoState: React.Dispatch<React.SetStateAction<TodoArray>>;
};

const TodoInputForm = (props: TodoArrayProps) => {
  const { todos, setTodoState } = props;
  const [textInput, setTextInput] = useState("");
  const addTodoHandler = async () => {
    if (textInput) {
      const newTodo = await addTodo(textInput);
      setTodoState([...todos, newTodo]);
    }
  };
  return (
    <div>
      <TextBox onChange={setTextInput}></TextBox>
      <Button handler={addTodoHandler}>Add Todo!</Button>
    </div>
  );
};

const addTodo = async (newTodoValue: string) => {
  const body = await fetch(`${BACKEND_URL}/todo`, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ value: newTodoValue }),
  });
  return (await body.json()) as Todo;
};

const TodoList: React.VFC<TodoArrayProps> = (props) => {
  const { todos, setTodoState } = props;
  const deleteHandler = async (deletedTodo: Todo) => {
    const result = await deleteTodo(deletedTodo.id);
    if (result) {
      setTodoState(todos.filter((todo) => todo.id !== deletedTodo.id));
    } else {
      console.error(`削除ミスったけどダマだぜ。${JSON.stringify(deletedTodo)}`);
    }
  };
  return (
    <ul>
      {todos.map((todo) => {
        return (
          <TodoElement todo={todo} deleteHandler={deleteHandler}></TodoElement>
        );
      })}
    </ul>
  );
};

const deleteTodo = async (deletedId: number) => {
  const res = await fetch(`${BACKEND_URL}/todo/${deletedId}`, {
    method: "DELETE",
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.status === 204;
};
