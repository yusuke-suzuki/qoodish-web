import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Skeleton from '@material-ui/lab/Skeleton';
import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cardContent: {
      paddingTop: 0
    },
    cardActions: {
      padding: theme.spacing(2)
    },
    rect: {
      minHeight: 350,
      height: '100%',
      width: '100%'
    }
  })
);

const SkeletonReviewCard = () => {
  const classes = useStyles();

  return (
    <Card elevation={0}>
      <CardHeader
        avatar={<Skeleton variant="circle" width={40} height={40} />}
        title={<Skeleton height={20} width="40%" />}
        subheader={<Skeleton height={20} width="40%" />}
      />
      <CardContent className={classes.cardContent}>
        <Skeleton height={28} width="40%" />
        <Skeleton height={32} width="40%" />
        <Skeleton height={24} width="100%" />
        <Skeleton height={24} width="100%" />
      </CardContent>
      <Skeleton variant="rect" className={classes.rect} />
      <CardContent className={classes.cardActions}>
        <Skeleton height={20} width="80%" />
        <Skeleton height={20} width="80%" />
      </CardContent>
    </Card>
  );
};

export default React.memo(SkeletonReviewCard);
