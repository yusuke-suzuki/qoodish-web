import React from 'react';
import { connect } from 'react-redux';
import Settings from '../ui/Settings';
import openDeleteAccountDialog from '../actions/openDeleteAccountDialog';
import updatePageTitle from '../actions/updatePageTitle';
import I18n from './I18n';

const mapStateToProps = state => {
  return {
    currentUser: state.app.currentUser,
    large: state.shared.large
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updatePageTitle: () => {
      dispatch(updatePageTitle(I18n.t('settings')));
    },

    handleDeleteAccountButtonClick: () => {
      dispatch(openDeleteAccountDialog());
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(Settings));
