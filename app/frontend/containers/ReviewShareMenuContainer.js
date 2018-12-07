import React from 'react';
import { connect } from 'react-redux';
import ReviewShareMenu from '../ui/ReviewShareMenu';
import openToast from '../actions/openToast';
import I18n from './I18n';

const mapStateToProps = state => {
  return {
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleUrlCopied: () => {
      dispatch(openToast(I18n.t('copied')));
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(ReviewShareMenu));
