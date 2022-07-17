import { memo } from 'react';
import Link from 'next/link';
import FbPage from '../molecules/FbPage';
import {
  Container,
  createStyles,
  Grid,
  makeStyles,
  Paper,
  Theme,
  Typography
} from '@material-ui/core';
import { amber } from '@material-ui/core/colors';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    topContents: {
      backgroundColor: amber[500],
      padding: theme.spacing(3)
    },
    bottomContents: {
      backgroundColor: amber[700],
      padding: theme.spacing(2)
    }
  })
);

export default memo(function Footer() {
  const classes = useStyles();
  const { I18n } = useLocale();

  return (
    <Paper square>
      <div className={classes.topContents}>
        <Container>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={12} md={6} lg={6}>
              <FbPage />
            </Grid>
            <Grid item xs={12} sm={12} md={6} lg={6}>
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
              <div>
                <a
                  href="https://github.com/yusuke-suzuki/qoodish-web"
                  target="_blank"
                >
                  GitHub
                </a>
              </div>
            </Grid>
          </Grid>
        </Container>
      </div>
      <div className={classes.bottomContents}>
        <Container>
          <Typography variant="caption">
            © 2022 Qoodish, All rights reserved.
          </Typography>
        </Container>
      </div>
    </Paper>
  );
});
