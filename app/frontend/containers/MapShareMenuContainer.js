import React from 'react';
import { connect } from 'react-redux';
import MapShareMenu from '../ui/MapShareMenu';
import openToast from '../actions/openToast';
import I18n from './I18n';

const mapStateToProps = state => {
  return {
    currentMap: state.mapSummary.currentMap,
    large: state.shared.large
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleUrlCopied: () => {
      dispatch(openToast(I18n.t('copied')));
    }
  };
};

export default React.memo(connect(mapStateToProps, mapDispatchToProps)(MapShareMenu));
