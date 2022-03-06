import { memo } from 'react';
import { createStyles, makeStyles, Typography } from '@material-ui/core';
import I18n from '../../utils/I18n';

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
