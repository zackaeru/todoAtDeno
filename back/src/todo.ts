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
    return todo;
  };

  delete = (id: number) => {
    this.todoList = this.todoList.filter((todo) => todo.id !== id);
  };

  list = () => this.todoList;
}
