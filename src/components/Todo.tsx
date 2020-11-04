import React from 'react';

interface TodoProps {
  text: string;
  completed: boolean;
  onClick: () => void;
}

const Todo = ({ onClick, completed, text }: TodoProps) => (
  <li
    onClick={onClick}
    style={{
      textDecoration: completed ? 'line-through' : 'none',
    }}>
    {text}
  </li>
);

export default Todo;
