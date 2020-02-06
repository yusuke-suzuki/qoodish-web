import React from 'react';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import MapIcon from '@material-ui/icons/Map';
import I18n from '../../utils/I18n';

const styles = {
  card: {
    width: 1280,
    height: 630,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5em'
  },
  icon: {
    fontSize: '13rem',
    marginRight: '0.1em'
  },
  logo: {
    fontFamily: "'Lobster', cursive",
    lineHeight: 'unset',
    fontSize: '13rem'
  },
  caption: {
    fontSize: '4.0rem',
    marginBottom: '0.5em'
  }
};

const OgpLogo = () => {
  return (
    <Card style={styles.card} square={true} elevation={0}>
      <div>
        <div style={styles.logoContainer}>
          <MapIcon color="primary" style={styles.icon} />
          <Typography variant="h1" color="default" style={styles.logo}>
            Qoodish
          </Typography>
        </div>
        <Typography
          variant="h4"
          color="inherit"
          align="center"
          style={styles.caption}
        >
          {I18n.t('create map together')}
        </Typography>
      </div>
    </Card>
  );
};

export default React.memo(OgpLogo);
