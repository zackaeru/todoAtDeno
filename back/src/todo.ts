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
  }
}
