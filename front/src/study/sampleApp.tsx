import React, { useState } from "react";
import ReactDOM from "react-dom";

addEventListener("DOMContentLoaded", () => {
  main();
});

const main = () => {
  ReactDOM.render(<App />, document.querySelector("#root"));
};

type TodoArray = { value: string }[];

const App = () => {
  const [todo, setTodo] = useState<TodoArray>([]);
  const deleteHandler = (deleted: string) => {
    setTodo(todo.filter((todo) => todo.value !== deleted));
  };
  return (
    <>
      <h1>シンプルなTodoリスト</h1>
      <TodoInputForm todos={todo} setTodoState={setTodo}></TodoInputForm>
      <TodoList todos={todo} deleteHandler={deleteHandler}></TodoList>
    </>
  );
};

type TodoItemProps = {
  deleteHandler: (todo: string) => void;
  todo: string;
};

const TodoElement: React.VFC<TodoItemProps> = (props) => {
  return (
    <li>
      {props.todo}
      <Button
        handler={() => {
          props.deleteHandler(props.todo);
          console.info(`del: ${props.todo}`);
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
  setTodoState: React.Dispatch<React.SetStateAction<TodoArray>>;
};

const TodoInputForm = (props: AddTodoProps) => {
  const [textInput, setTextInput] = useState("");
  const addTodoHandler = async () => {
    props.setTodoState([...props.todos, { value: textInput }]);
  };
  return (
    <div>
      <TextBox onChange={setTextInput}></TextBox>
      <Button handler={addTodoHandler}>Add Todo!</Button>
    </div>
  );
};

type TodoListProps = {
  deleteHandler: (value: string) => void;
  todos: TodoArray;
};

const TodoList: React.VFC<TodoListProps> = (props) => {
  return (
    <ul>
      {props.todos.map((todo) => {
        return (
          <TodoElement
            todo={todo.value}
            deleteHandler={props.deleteHandler}
          ></TodoElement>
        );
      })}
    </ul>
  );
};
