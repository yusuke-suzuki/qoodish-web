import React from 'react';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';

const styles = {
  cardContent: {
    paddingBottom: 16,
    paddingTop: 8
  },
  skeltonTextPrimary: {
    width: '100%',
    height: '1rem'
  },
  skeltonTextSecondary: {
    width: '50%',
    height: '0.875rem'
  },
  loadingButton: {
    color: 'rgba(0, 0, 0, 0)'
  },
  loadingImage: {
    background: 'rgba(0, 0, 0, 0.1)',
    width: '100%',
    height: 120
  }
};

const SkeltonMapCard = () => {
  return (
    <Card elevation={0}>
      <CardMedia style={styles.loadingImage} />
      <CardContent style={styles.cardContent}>
        <Typography variant="subtitle1">
          <Chip style={styles.skeltonTextPrimary} />
        </Typography>
        <Typography variant="subtitle2">
          <Chip style={styles.skeltonTextSecondary} />
        </Typography>
        <Typography variant="subtitle2" gutterBottom>
          <Chip style={styles.skeltonTextSecondary} />
        </Typography>
        <Typography variant="subtitle2" gutterBottom>
          <Chip style={styles.skeltonTextSecondary} />
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          disabled
          style={styles.loadingButton}
        >
          Loading
        </Button>
      </CardContent>
    </Card>
  );
};

export default React.memo(SkeltonMapCard);
