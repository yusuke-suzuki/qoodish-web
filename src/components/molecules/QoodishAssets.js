import React from 'react';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import PlaceIcon from '@material-ui/icons/Place';
import amber from '@material-ui/core/colors/amber';

const styles = {
  card: {
    width: 512,
    height: 512,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: amber[500],
    borderRadius: 20
  },
  logo: {
    fontFamily: "'Lobster', cursive",
    fontSize: '30rem',
    color: '#fff',
    letterSpacing: 'unset'
  },
  noImageCard: {
    width: 512,
    height: 512,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(241, 241, 241)'
  },
  placeIcon: {
    fontSize: 192
  }
};

const AppIcon = () => {
  return (
    <Card style={styles.card} elevation={0} color="primary">
      <Typography variant="h1" style={styles.logo}>
        Q
      </Typography>
    </Card>
  );
};

const NoImageIcon = () => {
  return (
    <Card style={styles.noImageCard} elevation={0}>
      <PlaceIcon style={styles.placeIcon} color="disabled" />
    </Card>
  );
};

const QoodishAssets = () => {
  return (
    <div>
      <AppIcon />
      <NoImageIcon />
    </div>
  );
};

export default React.memo(QoodishAssets);
