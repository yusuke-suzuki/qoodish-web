import React from 'react';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Typography from '@material-ui/core/Typography';
import Link from './Link';

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
  const mdUp = useMediaQuery('(min-width: 960px)');

  return (
    <Typography
      variant={mdUp ? 'h4' : 'h5'}
      color={props.color ? props.color : 'default'}
      style={styles.logo}
    >
      <Link to="/" style={styles.link} title="Qoodish">
        Qoodish
      </Link>
    </Typography>
  );
};

export default React.memo(Logo);
