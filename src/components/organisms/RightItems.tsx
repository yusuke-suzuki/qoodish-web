import React from 'react';
import {
  CardContent,
  Typography,
  Divider,
  Paper,
  makeStyles,
  createStyles,
  Theme
} from '@material-ui/core';
import Link from 'next/link';
import I18n from '../../utils/I18n';
import RecommendMaps from './RecommendMaps';
import TrendingMaps from './TrendingMaps';
import TrendingSpots from './TrendingSpots';
import FbPage from '../molecules/FbPage';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    item: {
      marginBottom: 20
    },
    cardContent: {
      paddingBottom: theme.spacing(2)
    },
    fbPage: {
      textAlign: 'center'
    }
  })
);

const Footer = React.memo(() => {
  const classes = useStyles();

  return (
    <Paper elevation={0}>
      <CardContent className={classes.cardContent}>
        <div>
          <Link href="/terms">
            <a>{I18n.t('terms of service')}</a>
          </Link>
        </div>
        <div>
          <Link href="/privacy">
            <a>{I18n.t('privacy policy')}</a>
          </Link>
        </div>
        <Typography variant="caption">
          © 2021 Qoodish, All rights reserved.
        </Typography>
      </CardContent>
    </Paper>
  );
});

const RightItems = () => {
  const classes = useStyles();

  return (
    <>
      <RecommendMaps />
      <Divider className={classes.item} />
      <div className={classes.item}>
        <TrendingMaps />
      </div>
      <div className={classes.item}>
        <TrendingSpots />
      </div>
      <div className={classes.item}>
        <Footer />
      </div>
      <div className={classes.fbPage}>
        <FbPage />
      </div>
    </>
  );
};

export default React.memo(RightItems);
