import React from 'react';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Typography from '@material-ui/core/Typography';
import { Link } from '@yusuke-suzuki/rize-router';

const styles = {
  logo: {
    cursor: 'pointer',
    fontFamily: "'Lobster', cursive"
  },
  link: {
    textDecoration: 'none',
    color: 'inherit'
  }
};

const Logo = props => {
  const { color } = props;
  const smUp = useMediaQuery('(min-width: 600px)');

  return (
    <Typography
      variant={smUp ? 'h4' : 'h5'}
      color={color ? color : 'primary'}
      style={styles.logo}
    >
      <Link to="/" style={styles.link} title="Qoodish">
        Qoodish
      </Link>
    </Typography>
  );
};

export default React.memo(Logo);
