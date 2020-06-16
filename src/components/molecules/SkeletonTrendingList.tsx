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

const styles = {
  listItemLarge: {
    paddingLeft: 10,
    paddingRight: 80
  },
  listItemSmall: {
    paddingLeft: 10,
    paddingRight: 80
  },
  cardContainer: {
    paddingBottom: 16
  }
};

const SkeletonTrendingList = () => {
  const large = useMediaQuery('(min-width: 600px)');

  return (
    <Paper elevation={0}>
      <CardContent style={styles.cardContainer}>
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
              style={large ? styles.listItemLarge : styles.listItemSmall}
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
