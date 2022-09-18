import { memo } from 'react';
import { Card, createStyles, makeStyles, Typography } from '@material-ui/core';
import { Map } from '@material-ui/icons';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles(() =>
  createStyles({
    card: {
      width: 1280,
      height: 630,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5em'
    },
    icon: {
      fontSize: '13rem',
      marginRight: '0.1em'
    },
    logo: {
      fontFamily: "'Lobster', cursive",
      lineHeight: 'unset',
      fontSize: '13rem'
    },
    caption: {
      fontSize: '4.0rem',
      marginBottom: '0.5em'
    }
  })
);

export default memo(function OgpLogo() {
  const classes = useStyles();
  const { I18n } = useLocale();

  return (
    <Card className={classes.card} square={true} elevation={0}>
      <div>
        <div className={classes.logoContainer}>
          <Map color="primary" className={classes.icon} />
          <Typography variant="h1" className={classes.logo}>
            Qoodish
          </Typography>
        </div>
        <Typography
          variant="h4"
          color="inherit"
          align="center"
          className={classes.caption}
        >
          {I18n.t('create map together')}
        </Typography>
      </div>
    </Card>
  );
});
