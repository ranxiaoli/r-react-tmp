import React, { FormEvent } from 'react';
import { connect } from 'react-redux';
import { addTodo } from '@/redux/actions';

const AddTodo = ({ dispatch }: any) => {
  let input: any;

  return (
    <div>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          if (!input.value.trim()) {
            return;
          }
          dispatch(addTodo(input.value));
          input.value = '';
        }}>
        <input ref={(node: HTMLInputElement) => (input = node)} />
        <button type="submit">Add Todo</button>
      </form>
    </div>
  );
};

export default connect()(AddTodo);
