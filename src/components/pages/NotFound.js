import React from 'react';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import I18n from '../../utils/I18n';
import { Link } from '@yusuke-suzuki/rize-router';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';

const NotFound = () => {
  return (
    <div>
      <Alert severity="warning">
        <AlertTitle>{I18n.t('page not found')}</AlertTitle>
        {I18n.t('page not found description')}
      </Alert>
      <Button
        component={Link}
        to="/discover"
        color="primary"
        startIcon={<KeyboardArrowLeftIcon />}
      >
        {I18n.t('back to our site')}
      </Button>
    </div>
  );
};

export default React.memo(NotFound);
