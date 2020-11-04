import React from 'react';
import Todo from './Todo';

interface TodoProps {
  text: string;
  completed: boolean;
  onClick: () => void;
}

interface TodoListProps {
  todos: Array<TodoProps>;
  onTodoClick: (index: number) => void;
}

const TodoList = ({ todos, onTodoClick }: TodoListProps) => (
  <ul>
    {todos.map((todo: TodoProps, index: number) => (
      <Todo key={index} {...todo} onClick={() => onTodoClick(index)} />
    ))}
  </ul>
);

export default TodoList;
