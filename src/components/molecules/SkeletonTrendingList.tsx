import React from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Skeleton from '@material-ui/lab/Skeleton';
import Paper from '@material-ui/core/Paper';
import CardContent from '@material-ui/core/CardContent';
import { createStyles, makeStyles, Theme, useTheme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    listItemLarge: {
      paddingLeft: 10,
      paddingRight: 80
    },
    listItemSmall: {
      paddingLeft: 10,
      paddingRight: 80
    },
    cardContainer: {
      paddingBottom: theme.spacing(2)
    }
  })
);

const SkeletonTrendingList = () => {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const classes = useStyles();

  return (
    <Paper elevation={0}>
      <CardContent className={classes.cardContainer}>
        <List
          disablePadding
          subheader={
            <ListSubheader disableGutters>
              <Skeleton height={28} width="60%" />
            </ListSubheader>
          }
        >
          {Array.from(new Array(10)).map((v, i) => (
            <ListItem
              key={i}
              className={mdUp ? classes.listItemLarge : classes.listItemSmall}
            >
              <ListItemAvatar>
                <Skeleton variant="circle" width={40} height={40} />
              </ListItemAvatar>
              <ListItemText
                disableTypography={true}
                primary={<Skeleton height={28} width="100%" />}
                secondary={<Skeleton height={24} width="100%" />}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Paper>
  );
};

export default React.memo(SkeletonTrendingList);
