import React from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core';

const styles = {
  container: {
    display: 'inline-block',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%'
  },
  cardContainerSmall: {
    marginTop: 16
  },
  cardContainerLarge: {
    marginTop: 20
  }
};

const VerticalReviewList = props => {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <div style={styles.container}>
      {props.children.map(child => (
        <div
          key={child.key}
          style={smUp ? styles.cardContainerLarge : styles.cardContainerSmall}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default React.memo(VerticalReviewList);
