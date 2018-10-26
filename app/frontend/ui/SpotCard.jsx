import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import DirectionsIcon from '@material-ui/icons/Directions';
import InfoIcon from '@material-ui/icons/Info';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Divider from '@material-ui/core/Divider';
import Toolbar from '@material-ui/core/Toolbar';
import PlaceIcon from '@material-ui/icons/Place';
import DragHandleIcon from '@material-ui/icons/DragHandle';
import AddIcon from '@material-ui/icons/Add';
import PersonIcon from '@material-ui/icons/Person';
import { Link } from 'react-router-dom';
import I18n from '../containers/I18n';
import SwipeableViews from 'react-swipeable-views';
import Badge from '@material-ui/core/Badge';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import Paper from '@material-ui/core/Paper';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

const styles = {
  drawerPaperLarge: {
    height: 'calc(100vh - 64px)',
    width: 380,
    marginTop: 64
  },
  cardLarge: {
    height: '100%',
    minHeight: 'calc(100vh - 64px)',
    overflowY: 'scroll'
  },
  cardContentSmall: {
    paddingBottom: 16,
    paddingTop: 0
  },
  spotImage: {
    width: '100%',
    objectFit: 'cover',
    height: 300
  },
  reviewComment: {
    marginRight: 20
  },
  listItem: {
    paddingTop: 0
  },
  backButton: {
    marginLeft: 'auto',
    marginRight: 8,
    color: 'white'
  },
  toolbar: {
    backgroundImage: 'linear-gradient(to bottom,rgba(0,0,0,.5),rgba(0,0,0,0))',
    position: 'absolute',
    zIndex: 1,
    right: 0,
    left: 0
  },
  secondaryAvatar: {
    borderRadius: 0,
    marginRight: 12,
    marginTop: 4
  },
  modal: {
    height: 0
  },
  dragHandleContainer: {
    textAlign: 'center',
    paddingTop: 2,
    height: 20
  },
  gridList: {
    flexWrap: 'nowrap',
    transform: 'translateZ(0)'
  },
  avatarGridTile: {
    width: 30,
    height: 30,
    marginLeft: 8,
    marginRight: 8
  },
  createReviewTile: {
    height: '100%',
    textAlign: 'center'
  },
  bottomAction: {
    width: '33.3333333333%',
    minWidth: 'auto',
    paddingTop: 8
  }
};

class SpotCard extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      reviews: []
    };
  }

  componentWillReceiveProps(nextProps) {
    let reviews = nextProps.mapReviews.filter(review => {
      return review.place_id === nextProps.currentSpot.place_id;
    });
    this.setState(Object.assign(this.state.reviews, reviews));
  }

  render() {
    return this.renderDrawer();
  }

  renderDrawer() {
    return (
      <SwipeableDrawer
        variant={this.props.large ? "persistent" : "temporary"}
        anchor={this.props.large ? "left": "bottom"}
        open={this.props.open}
        PaperProps={{
          style: this.props.large ? styles.drawerPaperLarge : {},
          square: this.props.large ? true : false
        }}
        onOpen={this.props.handleOpen}
        onClose={this.props.handleClose}
        disableSwipeToOpen
        disableBackdropTransition
        ModalProps={{ hideBackdrop: true, style: this.props.large ? {} : styles.modal }}
      >
        {this.props.large && this.renderToolbar()}
        {this.props.currentSpot && this.renderSpotCard(this.props.currentSpot)}
      </SwipeableDrawer>
    );
  }

  renderSpotCard(spot) {
    return this.props.large ? this.renderSpotCardLarge(spot) : this.renderSpotCardSmall(spot);
  }

  renderSpotCardLarge(spot) {
    return (
      <Card style={styles.cardLarge}>
        <CardMedia>
          <SwipeableViews>
            {this.renderReviewImages(this.state.reviews)}
          </SwipeableViews>
        </CardMedia>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
          >
            {spot.name}
          </Typography>
          <Typography
            variant="subtitle1"
            color="textSecondary"
            gutterBottom
          >
            {spot.formatted_address}
          </Typography>
        </CardContent>
        <Divider />
        {this.renderBottomNavigation(spot)}
        <Divider />
        <List disablePadding>
          {this.renderSpotReviews(this.state.reviews)}
        </List>
      </Card>
    );
  }

  renderBottomNavigation(spot) {
    return (
      <Paper style={styles.bottomNav} elevation={this.props.large ? 0 : 2}>
        <BottomNavigation showLabels>
          <BottomNavigationAction
            label={I18n.t('location')}
            icon={<PlaceIcon />}
            onClick={() => this.props.handleLocationButtonClick(spot)}
            style={styles.bottomAction}
          />
          <BottomNavigationAction
            label={I18n.t('routes')}
            icon={<DirectionsIcon />}
            onClick={() => this.props.handleRouteButtonClick(spot)}
            style={styles.bottomAction}
          />
          <BottomNavigationAction
            label={I18n.t('detail')}
            icon={<InfoIcon />}
            component={Link}
            to={`/spots/${spot.place_id}`}
            style={styles.bottomAction}
          />
        </BottomNavigation>
      </Paper>
    );
  }

  renderSpotCardSmall(spot) {
    return (
      <div>
        <CardContent style={styles.cardContentSmall}>
          <div style={styles.dragHandleContainer}>
            <DragHandleIcon color="disabled" />
          </div>
          {this.renderCardHeader(spot)}
          <GridList
            cols={2.5}
            cellHeight={100}
            style={styles.gridList}
          >
            {this.renderCreateReviewTile(spot)}
            {this.renderReviewTiles(this.state.reviews)}
          </GridList>
        </CardContent>
        {this.renderBottomNavigation(spot)}
      </div>
    );
  }

  renderCardHeader(spot) {
    return (
      <List disablePadding>
        <ListItem disableGutters style={styles.listItem}>
          <ListItemText
            disableTypography
            primary={
              <Typography variant="h6" noWrap>
                {spot.name}
              </Typography>
            }
            secondary={
              <Typography
                component="p"
                noWrap
                color="textSecondary"
              >
                {spot.formatted_address}
              </Typography>
            }
          />
          <ListItemSecondaryAction>
            <IconButton>
              <Badge
                badgeContent={this.state.reviews.length}
                color="primary"
              >
                <PersonIcon />
              </Badge>
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    );
  }

  renderCreateReviewTile(spot) {
    return (
      <GridListTile
        key="add-review"
        onClick={() => this.props.handleCreateReviewClick(spot)}
      >
        <img src={process.env.SUBSTITUTE_URL} />
        <GridListTileBar
          style={styles.createReviewTile}
          title={
            <AddIcon fontSize="large" />
          }
          subtitle={I18n.t('create new report')}
        />
      </GridListTile>
    );
  }

  renderReviewTiles(reviews) {
    return reviews.map(review => (
      <GridListTile
        key={review.id}
        onClick={() => this.props.handleReviewClick(review)}
      >
        <img src={review.image ? review.image.thumbnail_url : process.env.SUBSTITUTE_URL} alt={review.spot.name} />
        <GridListTileBar
          actionIcon={
            <Avatar
              src={review.author.profile_image_url}
              alt={review.author.name}
              style={styles.avatarGridTile}
            />
          }
          actionPosition="left"
          subtitle={review.comment}
        />
      </GridListTile>
    ));
  }

  renderReviewImages(reviews) {
    return reviews.map(review => (
      <img
        key={review.id}
        src={review.image ? review.image.url : process.env.SUBSTITUTE_URL}
        style={styles.spotImage}
        alt={review.spot.name}
      />
    ));
  }

  renderSpotReviews(reviews) {
    return reviews.map(review => (
      <ListItem
        button
        key={review.id}
        onClick={() => this.props.handleReviewClick(review)}
      >
        <Avatar
          src={review.author.profile_image_url}
          alt={review.author.name}
        />
        <ListItemText
          disableTypography={true}
          primary={
            <Typography variant="subtitle1" noWrap>
              {review.author.name}
            </Typography>
          }
          secondary={
            <Typography
              component="p"
              noWrap
              color="textSecondary"
              style={styles.reviewComment}
            >
              {review.comment}
            </Typography>
          }
        />
        {review.image && (
          <ListItemSecondaryAction
            onClick={() => this.props.handleReviewClick(review)}
          >
            <Avatar
              src={review.image.thumbnail_url}
              style={styles.secondaryAvatar}
              alt={review.spot.name}
            />
          </ListItemSecondaryAction>
        )}
      </ListItem>
    ));
  }

  renderToolbar() {
    return (
      <Toolbar
        style={styles.toolbar}
        disableGutters
      >
        {this.renderBackButton()}
      </Toolbar>
    );
  }

  renderBackButton() {
    return (
      <IconButton
        color="inherit"
        onClick={this.props.handleClose}
        style={styles.backButton}
      >
        <ChevronLeftIcon />
      </IconButton>
    );
  }
}

export default SpotCard;
