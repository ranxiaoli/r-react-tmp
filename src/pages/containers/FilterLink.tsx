import { connect } from 'react-redux';
import { setVisibilityFilter } from '@/redux/actions';
import Link from '@/components/Link';
import { Dispatch } from 'redux';

const mapStateToProps = (state: any, ownProps: any) => ({
  active: ownProps.filter === state.visibilityFilter,
});

const mapDispatchToProps = (dispatch: Dispatch, ownProps: any) => ({
  onClick: () => dispatch(setVisibilityFilter(ownProps.filter)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Link);
