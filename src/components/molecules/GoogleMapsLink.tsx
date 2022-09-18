import { memo } from 'react';
import { createStyles, makeStyles, Typography } from '@material-ui/core';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles(() =>
  createStyles({
    gmapLink: {
      textDecoration: 'none'
    }
  })
);

type Props = {
  currentSpot: any;
};

export default memo(function GoogleMapsLink(props: Props) {
  const { currentSpot } = props;
  const classes = useStyles();
  const { I18n } = useLocale();

  return (
    <Typography variant="subtitle2" color="textSecondary">
      <a
        href={currentSpot && currentSpot.url}
        target="_blank"
        rel="noopener"
        className={classes.gmapLink}
      >
        {I18n.t('open in google maps')}
      </a>
    </Typography>
  );
});
