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
