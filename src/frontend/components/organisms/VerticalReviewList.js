import React from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

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
  const large = useMediaQuery('(min-width: 600px)');

  return (
    <div style={styles.container}>
      {props.children.map(child => (
        <div
          style={large ? styles.cardContainerLarge : styles.cardContainerSmall}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default React.memo(VerticalReviewList);
