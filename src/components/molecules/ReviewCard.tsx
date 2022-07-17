import { memo } from 'react';
import twitter from 'twitter-text';
import Link from 'next/link';
import ReviewShareMenu from './ReviewShareMenu';
import ReviewVertMenu from './ReviewVertMenu';
import ReviewCardActions from './ReviewCardActions';
import ReviewComments from './ReviewComments';
import ReviewImageStepper from './ReviewImageStepper';
import SpotLink from './SpotLink';
import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  createStyles,
  Divider,
  makeStyles,
  Theme,
  Typography
} from '@material-ui/core';
import { formatDistanceToNow } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';
import { useRouter } from 'next/router';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cardTitle: {
      width: 'fit-content',
      wordBreak: 'break-all'
    },
    reviewComment: {
      wordBreak: 'break-all',
      whiteSpace: 'pre-wrap'
    },
    cardContent: {
      paddingTop: 0
    },
    cardActions: {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3)
    },
    link: {
      textDecoration: 'none',
      color: 'inherit'
    }
  })
);

type Props = {
  currentReview: any;
  hideActions?: boolean;
};

export default memo(function ReviewCard(props: Props) {
  const { currentReview, hideActions } = props;
  const classes = useStyles();
  const router = useRouter();

  return (
    <Card elevation={0}>
      <CardHeader
        avatar={
          <Link href={`/users/${currentReview.author.id}`}>
            <a title={currentReview.author.name} className={classes.link}>
              {currentReview.author.profile_image_url ? (
                <Avatar
                  src={currentReview.author.profile_image_url}
                  imgProps={{
                    alt: currentReview.author.name,
                    loading: 'lazy'
                  }}
                />
              ) : (
                <Avatar>{currentReview.author.name.slice(0, 1)}</Avatar>
              )}
            </a>
          </Link>
        }
        action={
          <Box display="flex">
            <ReviewShareMenu currentReview={currentReview} />
            <ReviewVertMenu currentReview={currentReview} />
          </Box>
        }
        title={
          <Link href={`/users/${currentReview.author.id}`}>
            <a title={currentReview.author.name} className={classes.link}>
              {currentReview.author.name}
            </a>
          </Link>
        }
        subheader={formatDistanceToNow(new Date(currentReview.created_at), {
          addSuffix: true,
          locale: router.locale === 'ja' ? ja : enUS
        })}
      />

      <CardContent className={classes.cardContent}>
        <Link href={`/maps/${currentReview.map.id}`}>
          <a title={currentReview.map.name} className={classes.link}>
            <Typography
              variant="subtitle1"
              color="primary"
              className={classes.cardTitle}
              gutterBottom
            >
              {currentReview.map.name}
            </Typography>
          </a>
        </Link>

        <SpotLink spot={currentReview.spot}>
          <Typography
            variant="h5"
            component="h2"
            className={classes.cardTitle}
            gutterBottom
          >
            {currentReview.spot.name}
          </Typography>
        </SpotLink>

        <Typography
          component="p"
          dangerouslySetInnerHTML={{
            __html: twitter.autoLink(
              twitter.htmlEscape(currentReview.comment),
              {
                targetBlank: true
              }
            )
          }}
          className={classes.reviewComment}
          data-test="review-card-comment"
        />
      </CardContent>

      {currentReview.images.length > 0 ? (
        <ReviewImageStepper review={currentReview} />
      ) : (
        <Divider />
      )}

      {currentReview.comments.length > 0 && (
        <ReviewComments comments={currentReview.comments} />
      )}

      {!hideActions && (
        <CardActions disableSpacing className={classes.cardActions}>
          <ReviewCardActions review={currentReview} />
        </CardActions>
      )}
    </Card>
  );
});
