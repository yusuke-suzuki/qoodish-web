import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme =>
  createStyles({
    container: {
      display: 'inline-block',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      width: '100%'
    },
    cardContainer: {
      marginTop: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        marginTop: 20
      }
    }
  })
);

type Props = {
  children: any;
};

const VerticalReviewList = (props: Props) => {
  const { children } = props;
  const classes = useStyles();

  return (
    <div className={classes.container}>
      {children.map(child => (
        <div key={child.key} className={classes.cardContainer}>
          {child}
        </div>
      ))}
    </div>
  );
};

export default React.memo(VerticalReviewList);
