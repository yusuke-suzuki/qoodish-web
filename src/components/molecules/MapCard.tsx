import { memo } from 'react';
import FollowMapButton from '../molecules/FollowMapButton';
import Link from 'next/link';
import {
  Card,
  CardActions,
  CardContent,
  CardMedia,
  createStyles,
  makeStyles,
  Typography
} from '@material-ui/core';
import { Lock } from '@material-ui/icons';

const useStyles = makeStyles(() =>
  createStyles({
    card: {
      width: '100%'
    },
    mapImage: {
      width: '100%',
      height: 120,
      objectFit: 'cover'
    },
    cardContent: {
      paddingBottom: 8,
      paddingTop: 8
    },
    privateIcon: {
      fontSize: '1rem'
    },
    cardMedia: {
      width: '100%'
    },
    cardActions: {
      padding: 16,
      paddingTop: 0
    },
    link: {
      textDecoration: 'none',
      color: 'inherit'
    }
  })
);

type Props = {
  map: any;
};

export default memo(function MapCard(props: Props) {
  const { map } = props;
  const classes = useStyles();

  return (
    <Link href={`/maps/${map.id}`} passHref>
      <a title={map.name} className={classes.link}>
        <Card className={classes.card} elevation={0}>
          <CardMedia>
            <img
              src={map.thumbnail_url_400}
              alt={map.name}
              className={classes.mapImage}
              loading="lazy"
            />
          </CardMedia>
          <CardContent className={classes.cardContent}>
            <Typography variant="subtitle1" noWrap>
              {map.private && (
                <Lock className={classes.privateIcon} color="inherit" />
              )}{' '}
              {map.name}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary" noWrap>
              {map.owner_name}
            </Typography>
            <Typography
              variant="subtitle2"
              color="textSecondary"
              gutterBottom
              noWrap
            >
              {map.description}
            </Typography>
          </CardContent>
          <CardActions className={classes.cardActions}>
            <FollowMapButton currentMap={map} />
          </CardActions>
        </Card>
      </a>
    </Link>
  );
});
