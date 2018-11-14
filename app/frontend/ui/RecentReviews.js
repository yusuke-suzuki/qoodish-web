import React from 'react';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import PersonIcon from '@material-ui/icons/Person';
import Chip from '@material-ui/core/Chip';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import NoContentsContainer from '../containers/NoContentsContainer';
import I18n from '../containers/I18n';
import moment from 'moment';

const styles = {
  gridList: {
    width: '100%'
  },
  gridTile: {
    cursor: 'pointer'
  },
  reviewCard: {
    margin: 3
  },
  cardContentLarge: {
    paddingTop: 0,
    paddingRight: 120
  },
  cardContentSmall: {
    paddingTop: 0,
    paddingRight: 112
  },
  reviewImage: {
    width: '100%'
  },
  reviewComment: {
    height: '4.5em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    WebkitLineClamp: '3',
    WebkitBoxOrient: 'vertical',
    display: '-webkit-box'
  },
  secondaryAvatarLarge: {
    borderRadius: 0,
    marginRight: 24,
    width: 80,
    height: 80
  },
  secondaryAvatarSmall: {
    borderRadius: 0,
    marginRight: 16,
    width: 80,
    height: 80
  },
  skeltonTextPrimary: {
    width: '100%',
    height: '1.25rem'
  },
  skeltonTextSecondary: {
    width: '50%',
    height: '1rem'
  },
  skeltonTextComment: {
    width: '100%',
    height: '1rem'
  },
  skeltonAvatar: {
    width: 40,
    height: 40
  }
};

const RecentReviews = (props) => {
  if (!props.loading && props.recentReviews.length < 1) {
    return (
      <NoContentsContainer
        contentType="review"
        message={I18n.t('reports will see here')}
      />
    );
  } else {
    return (
      <GridList
        cols={props.large ? 2 : 1}
        style={styles.gridList}
        spacing={20}
        cellHeight={240}
      >
        {props.loading
        ? Array.from(new Array(8)).map((v, i) => (
          <GridListTile key={i}>
            <Card style={styles.reviewCard}>
              <CardHeader
                avatar={
                  <Avatar style={styles.skeltonAvatar}><PersonIcon /></Avatar>
                }
                title={<Chip style={styles.skeltonTextSecondary} />}
                subheader={<Chip style={styles.skeltonTextSecondary} />}
              />
              <CardContent style={props.large ? styles.cardContentLarge : styles.cardContentSmall}>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  gutterBottom
                >
                  <Chip style={styles.skeltonTextSecondary} />
                </Typography>
                <Typography variant="h6" gutterBottom>
                  <Chip style={styles.skeltonTextPrimary} />
                </Typography>
                <Typography component="p" style={styles.reviewComment}>
                  <Chip style={styles.skeltonTextComment} />
                  <Chip style={styles.skeltonTextComment} />
                  <Chip style={styles.skeltonTextComment} />
                </Typography>
              </CardContent>
            </Card>
          </GridListTile>
        ))
        : props.recentReviews.map(review => (
          <GridListTile
            key={review.id}
            onClick={() => props.handleReviewClick(review)}
            style={styles.gridTile}
          >
            <Card style={styles.reviewCard}>
              <CardHeader
                avatar={
                  <Avatar
                    src={review.author.profile_image_url}
                    alt={review.author.name}
                  />
                }
                title={review.author.name}
                subheader={
                  moment(review.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
                    .locale(window.currentLocale)
                    .fromNow()
                }
              />
              <CardContent style={props.large ? styles.cardContentLarge : styles.cardContentSmall}>
                <Typography
                  variant="subtitle1"
                  color="primary"
                  gutterBottom
                  noWrap
                >
                  {review.map.name}
                </Typography>
                <Typography variant="h6" gutterBottom noWrap>
                  {review.spot.name}
                </Typography>
                <Typography component="p" style={styles.reviewComment}>
                  {review.comment}
                </Typography>
              </CardContent>
            </Card>
            {review.image && (
              <ListItemSecondaryAction>
                <Avatar
                  src={review.image.thumbnail_url}
                  alt={review.spot.name}
                  style={props.large ? styles.secondaryAvatarLarge : styles.secondaryAvatarSmall}
                />
              </ListItemSecondaryAction>
            )}
          </GridListTile>
        ))}
      </GridList>
    );
  }
};

export default RecentReviews;
