import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

const BACKEND_URL = "http://localhost:8000";

const App = () => {
  const [todo, setTodo] = useState<TodoArray>([]);
  useEffect(() => {
    getTodo().then((todos) => setTodo(todos));
  }, []);

  return (
    <>
      <h1>シンプルなTodoリスト</h1>
      <TodoInputForm todos={todo} setTodoState={setTodo}></TodoInputForm>
      <TodoList todos={todo}></TodoList>
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

type TodoArray = { id: number; value: string }[];

type TodoItemProps = {
  todo: string;
  children: React.ReactNode;
};

const TodoElement: React.VFC<TodoItemProps> = (props) => {
  return <li>{props.todo}</li>;
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
  setTodoState: React.Dispatch<React.SetStateAction<TodoArray>>;
};

const TodoInputForm = (props: AddTodoProps) => {
  const [textInput, setTextInput] = useState("");
  const addTodoHandler = async () => {
    const body = await fetch(`${BACKEND_URL}/todo`, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ value: textInput }),
    });
    const data = await body.json();
    props.setTodoState([...props.todos, { id: data.id, value: data.value }]);
  };
  return (
    <div>
      <TextBox onChange={setTextInput}></TextBox>
      <Button handler={addTodoHandler}>Add Todo!</Button>
    </div>
  );
};

type TodoListProps = {
  todos: TodoArray;
};

const TodoList: React.VFC<TodoListProps> = (props) => {
  return (
    <ul>
      {props.todos.map((todo) => {
        return (
          <TodoElement todo={todo.value}>{todo.id + "-items"}</TodoElement>
        );
      })}
    </ul>
  );
};

const main = () => {
  ReactDOM.render(<App />, document.querySelector("#root"));
};

addEventListener("DOMContentLoaded", () => {
  main();
});
