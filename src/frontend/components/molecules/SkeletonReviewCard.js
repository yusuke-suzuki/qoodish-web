import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Skeleton from '@material-ui/lab/Skeleton';

const styles = {
  cardContent: {
    paddingTop: 0
  },
  cardActions: {
    padding: 16
  },
  rect: {
    minHeight: 350,
    height: '100%',
    width: '100%'
  }
};

const SkeletonReviewCard = () => {
  return (
    <Card elevation={0}>
      <CardHeader
        avatar={<Skeleton variant="circle" width={40} height={40} />}
        title={<Skeleton height={20} width="40%" />}
        subheader={<Skeleton height={20} width="40%" />}
      />
      <CardContent style={styles.cardContent}>
        <Skeleton height={28} width="40%" />
        <Skeleton height={32} width="40%" />
        <Skeleton height={24} width="100%" />
        <Skeleton height={24} width="100%" />
      </CardContent>
      <Skeleton variant="rect" style={styles.rect} />
      <CardContent style={styles.cardActions}>
        <Skeleton height={20} width="80%" />
        <Skeleton height={20} width="80%" />
      </CardContent>
    </Card>
  );
};

export default React.memo(SkeletonReviewCard);
