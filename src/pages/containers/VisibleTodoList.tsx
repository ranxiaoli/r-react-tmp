import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { toggleTodo } from '@/redux/actions';
import TodoList from '@/components/TodoList';

const getVisibleTodos = (todos: any, filter: any) => {
  switch (filter) {
    case 'SHOW_COMPLETED':
      return todos.filter((t: any) => t.completed);
    case 'SHOW_ACTIVE':
      return todos.filter((t: any) => !t.completed);
    case 'SHOW_ALL':
    default:
      return todos;
  }
};

const mapStateToProps = (state: any) => ({
  todos: getVisibleTodos(state.todos, state.visibilityFilter),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    onTodoClick: (id: number) => {
      dispatch(toggleTodo(id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TodoList);
