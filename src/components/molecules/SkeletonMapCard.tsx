import React from 'react';
import CardContent from '@material-ui/core/CardContent';
import Skeleton from '@material-ui/lab/Skeleton';
import Card from '@material-ui/core/Card';
import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cardContent: {
      paddingBottom: theme.spacing(2),
      paddingTop: theme.spacing(1)
    }
  })
);

const SkeletonMapCard = () => {
  const classes = useStyles();

  return (
    <Card elevation={0}>
      <Skeleton variant="rect" height={120} width="100%" />
      <CardContent className={classes.cardContent}>
        <Skeleton height={28} width="100%" />
        <Skeleton height={24} width="100%" />
        <Skeleton height={24} width="100%" />
        <Skeleton height={52} width={94} />
      </CardContent>
    </Card>
  );
};

export default React.memo(SkeletonMapCard);
