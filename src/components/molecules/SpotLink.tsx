import React, { memo, useCallback } from 'react';
import { useDispatch } from 'redux-react-hook';
import openSpotDialog from '../../actions/openSpotDialog';
import { createStyles, makeStyles } from '@material-ui/core';

type Props = {
  spot: any;
  children: any;
};

const useStyles = makeStyles(() =>
  createStyles({
    link: {
      textDecoration: 'none',
      color: 'inherit'
    }
  })
);

export default memo(function SpotLink(props: Props) {
  const { spot, children } = props;
  const dispatch = useDispatch();
  const classes = useStyles();

  const handleClick = useCallback(
    e => {
      e.preventDefault();
      dispatch(openSpotDialog(spot));
    },
    [dispatch, spot]
  );

  return (
    <a
      href={`/spots/${spot.place_id}`}
      title={spot.name}
      onClick={handleClick}
      className={classes.link}
    >
      {children}
    </a>
  );
});