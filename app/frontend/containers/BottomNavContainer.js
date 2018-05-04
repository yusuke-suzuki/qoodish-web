import { connect } from 'react-redux';
import BottomNav from '../ui/BottomNav';

const mapStateToProps = state => {
  return {
    pathname: state.router.location.pathname,
    unreadNotifications: state.shared.unreadNotifications
  };
};

const mapDispatchToProps = dispatch => {
  return {
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BottomNav);
