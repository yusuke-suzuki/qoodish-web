import React from 'react';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import amber from '@material-ui/core/colors/amber';

import Link from '../molecules/Link';
import FbPage from '../molecules/FbPage';
import I18n from '../../utils/I18n';

const styles = {
  gridContainer: {
    width: '100%',
    margin: 'auto'
  },
  bottomCardContent: {
    backgroundColor: amber[500]
  },
  bottomCardLicense: {
    backgroundColor: amber[700],
    paddingBottom: 16
  },
  containerLarge: {
    width: '80%',
    margin: '0 auto'
  },
  containerSmall: {
    width: '100%',
    margin: '0 auto'
  },
  container: {
    maxWidth: 1176,
    margin: 'auto'
  }
};

const Footer = () => {
  return (
    <Card>
      <CardContent style={styles.bottomCardContent}>
        <div style={styles.container}>
          <Grid container style={styles.gridContainer} spacing={24}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <FbPage />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <div>
                <Link to="/terms">{I18n.t('terms of service')}</Link>
              </div>
              <div>
                <Link to="/privacy">{I18n.t('privacy policy')}</Link>
              </div>
              <div>
                <a
                  href="https://github.com/yusuke-suzuki/qoodish-web"
                  target="_blank"
                >
                  GitHub
                </a>
              </div>
            </Grid>
          </Grid>
        </div>
      </CardContent>
      <CardContent style={styles.bottomCardLicense}>
        <div style={styles.container}>
          <Typography variant="caption">
            © 2019 Qoodish, All rights reserved.
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(Footer);
