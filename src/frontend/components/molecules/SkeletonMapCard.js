import React from 'react';
import CardContent from '@material-ui/core/CardContent';
import Skeleton from '@material-ui/lab/Skeleton';
import Card from '@material-ui/core/Card';

const styles = {
  cardContent: {
    paddingBottom: 16,
    paddingTop: 8
  }
};

const SkeletonMapCard = () => {
  return (
    <Card elevation={0}>
      <Skeleton variant="rect" height={120} width="100%" />
      <CardContent style={styles.cardContent}>
        <Skeleton height={28} width="100%" />
        <Skeleton height={24} width="100%" />
        <Skeleton height={24} width="100%" />
        <Skeleton height={24} width="100%" />
        <Skeleton height={52} width={94} />
      </CardContent>
    </Card>
  );
};

export default React.memo(SkeletonMapCard);
