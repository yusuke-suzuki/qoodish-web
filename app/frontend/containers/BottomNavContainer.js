import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import BottomNav from '../ui/BottomNav';

const mapStateToProps = state => {
  return {
    pathname: state.router.location.pathname,
    unreadNotifications: state.shared.unreadNotifications
  };
};

const mapDispatchToProps = dispatch => {
  return {
    handleHomeClick: () => {
      dispatch(push('/'));
    },

    handleDiscoverClick: () => {
      dispatch(push('/discover'));
    },

    handleMapsClick: () => {
      dispatch(push('/maps'));
    },

    handleNotificationsClick: () => {
      dispatch(push('/notifications'));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BottomNav);
